import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Timer,
  Eye,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth-context";

interface AdViewerDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  ad: {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    payout?: string;
    cpc?: string;
    duration?: number;
    advertiser?: string;
    advertiserName?: string;
    type?: "link" | "youtube" | "banner";
    url?: string;
    targetUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
  };
  userId?: string;
}

type ViewState = "idle" | "opening" | "viewing" | "verifying" | "complete" | "failed";

export function AdViewerDialog({
  open,
  onOpenChange,
  ad,
  userId,
}: AdViewerDialogProps) {
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [popupClosed, setPopupClosed] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const popupCheckRef = useRef<NodeJS.Timeout | null>(null);

  const duration = ad.duration || 15;
  const payout = ad.payout || (ad.cpc ? `ETB ${parseFloat(ad.cpc).toFixed(2)}` : "ETB 0.05");
  const adTitle = ad.title || ad.name || "Ad";
  const advertiser = ad.advertiser || ad.advertiserName || "Advertiser";

  // Get the URL the ad should open
  const getAdUrl = useCallback(() => {
    if (ad.type === "youtube" && ad.videoUrl) return ad.videoUrl;
    if (ad.url) return ad.url;
    if (ad.targetUrl) return ad.targetUrl;
    if (ad.imageUrl) return ad.imageUrl;
    return null;
  }, [ad]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setViewState("idle");
      setTimeRemaining(0);
      setPopupClosed(false);
      setSessionId(null);
      if (timerRef.current) clearInterval(timerRef.current);
      if (popupCheckRef.current) clearInterval(popupCheckRef.current);
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
      popupRef.current = null;
    }
  }, [open]);

  // Start viewing — opens popup and begins countdown
  const handleStartViewing = async () => {
    setViewState("opening");

    // 1. Register the ad view session on the server
    try {
      const res = await fetch("/api/v1/ad-views/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          campaignId: ad.id,
          duration,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to start ad view", variant: "destructive" });
        setViewState("idle");
        return;
      }

      const data = await res.json();
      setSessionId(data.sessionId);
    } catch {
      toast({ title: "Error", description: "Network error. Try again.", variant: "destructive" });
      setViewState("idle");
      return;
    }

    // 2. Open the ad in a new window
    const adUrl = getAdUrl();
    if (adUrl) {
      const popup = window.open(
        adUrl,
        "_blank",
        "width=900,height=650,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=yes"
      );
      popupRef.current = popup;

      if (!popup) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site to view ads.",
          variant: "destructive",
        });
        setViewState("idle");
        return;
      }
    }

    // 3. Start the countdown
    setTimeRemaining(duration);
    setPopupClosed(false);
    setViewState("viewing");

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 4. Poll to check if popup is still open
    popupCheckRef.current = setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        setPopupClosed(true);
        if (popupCheckRef.current) clearInterval(popupCheckRef.current);
      }
    }, 500);
  };

  // When timer hits 0, transition to complete state
  useEffect(() => {
    if (viewState === "viewing" && timeRemaining === 0) {
      setViewState("complete");
      if (popupCheckRef.current) clearInterval(popupCheckRef.current);
    }
  }, [viewState, timeRemaining]);

  // Claim the reward
  const handleClaimReward = async () => {
    if (!sessionId) return;
    setViewState("verifying");

    try {
      const res = await fetch("/api/v1/ad-views/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Reward earned! 🎉",
          description: `You earned ${payout} for viewing "${adTitle}"`,
        });
        await refreshProfile();
        onOpenChange(false);
      } else {
        const err = await res.json();
        setViewState("failed");
        toast({
          title: "Claim failed",
          description: err.error || "Could not verify your ad view. Try again.",
          variant: "destructive",
        });
      }
    } catch {
      setViewState("failed");
      toast({
        title: "Network error",
        description: "Failed to claim reward. Try again.",
        variant: "destructive",
      });
    }
  };

  const progress = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {adTitle}
          </DialogTitle>
          <DialogDescription>
            By {advertiser} • Earn {payout}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Idle state — prompt to start */}
          {viewState === "idle" && (
            <div className="text-center space-y-4 py-4">
              <div className="bg-muted/50 rounded-xl p-6">
                <Timer className="h-12 w-12 mx-auto text-primary mb-3" />
                <h3 className="font-semibold text-lg">Ready to view this ad?</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  The ad will open in a <strong>new window</strong>. Keep it open for{" "}
                  <strong>{duration} seconds</strong> while the timer counts down here.
                </p>
              </div>
              <Button
                className="w-full h-12 text-base"
                onClick={handleStartViewing}
                data-testid="button-start-ad-view"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Open Ad & Start Timer
              </Button>
            </div>
          )}

          {/* Opening state */}
          {viewState === "opening" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Viewing state — timer counting down */}
          {viewState === "viewing" && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-6 text-center">
                <div className="text-5xl font-mono font-bold text-primary mb-2">
                  {timeRemaining}
                </div>
                <p className="text-sm text-muted-foreground">seconds remaining</p>
              </div>

              <Progress value={progress} className="h-3" />

              {popupClosed && timeRemaining > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    The ad window was closed early. Timer is still running, but you must view the full duration.
                  </span>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Keep the ad window open until the timer reaches zero
              </p>
            </div>
          )}

          {/* Complete state — ready to claim */}
          {viewState === "complete" && (
            <div className="space-y-4">
              <div className="bg-chart-2/10 rounded-xl p-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-chart-2 mb-2" />
                <h3 className="font-semibold text-lg text-chart-2">Ad View Complete!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Claim your reward of <strong>{payout}</strong>
                </p>
              </div>
              <Button
                className="w-full h-12 text-base"
                onClick={handleClaimReward}
                data-testid="button-claim-reward"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Claim {payout}
              </Button>
            </div>
          )}

          {/* Verifying state */}
          {viewState === "verifying" && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying your ad view...</p>
            </div>
          )}

          {/* Failed state */}
          {viewState === "failed" && (
            <div className="space-y-4">
              <div className="bg-destructive/10 rounded-xl p-6 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-2" />
                <h3 className="font-semibold text-lg">Verification Failed</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Could not verify your ad view. Please try again.
                </p>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setViewState("idle")}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
