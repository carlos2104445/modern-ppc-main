import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Youtube, Image as ImageIcon, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdViewerDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  ad: {
    id: string;
    title: string;
    description: string;
    payout: string;
    duration: number;
    advertiser: string;
    type?: "link" | "youtube" | "banner";
    targetUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
  };
  userId?: string;
}

export function AdViewerDialog({
  open,
  onOpenChange,
  ad,
  userId = "demo-user",
}: AdViewerDialogProps) {
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState(ad.duration);
  const [isComplete, setIsComplete] = useState(false);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [trackedUrl, setTrackedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTimeRemaining(ad.duration);
      setIsComplete(false);
      setTrackingToken(null);
      setTrackedUrl(null);
      return;
    }

    const startTracking = async () => {
      try {
        const response = await fetch("/api/ad-views/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify({
            userId,
            campaignId: ad.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTrackingToken(data.trackingToken);
          setTrackedUrl(`/api/track/${data.trackingToken}`);
        }
      } catch (error) {
        console.error("Failed to start tracking:", error);
      }
    };

    startTracking();

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsComplete(true);
          clearInterval(timer);
          if (trackingToken) {
            fetch(`/api/ad-views/${trackingToken}/complete`, {
              method: "POST",
            }).catch(console.error);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, ad.duration, ad.id, userId, trackingToken]);

  const handleClaim = async () => {
    if (!trackingToken) {
      toast({
        title: "Error",
        description: "Tracking token not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/ad-views/${trackingToken}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rewardAmount: ad.payout.replace(/[^0-9.]/g, ""),
        }),
      });

      if (response.ok) {
        toast({
          title: "Reward claimed!",
          description: `You earned ${ad.payout} for viewing this ad.`,
        });
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to claim reward",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to claim reward:", error);
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url?.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const adType = ad.type || "link";
  const progress = ((ad.duration - timeRemaining) / ad.duration) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {adType === "link" && <ExternalLink className="h-5 w-5" />}
            {adType === "youtube" && <Youtube className="h-5 w-5" />}
            {adType === "banner" && <ImageIcon className="h-5 w-5" />}
            {ad.title}
          </DialogTitle>
          <DialogDescription>
            By {ad.advertiser} • Earn {ad.payout}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ad Content */}
          <div className="min-h-[300px] flex items-center justify-center bg-muted/30 rounded-lg p-6">
            {adType === "link" && (
              <div className="text-center space-y-4">
                <ExternalLink className="h-20 w-20 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">{ad.title}</h3>
                <p className="text-muted-foreground max-w-md">{ad.description}</p>
                {trackedUrl && (
                  <a
                    href={trackedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    Visit Website <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            {adType === "youtube" && ad.videoUrl && getYoutubeEmbedUrl(ad.videoUrl) && (
              <div className="w-full">
                <iframe
                  width="100%"
                  height="350"
                  src={getYoutubeEmbedUrl(ad.videoUrl)}
                  title={ad.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            )}

            {adType === "banner" && ad.imageUrl && (
              <div className="w-full">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-auto rounded-lg max-h-[400px] object-contain"
                />
              </div>
            )}
          </div>

          {/* Timer Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isComplete ? "Ad viewing complete!" : `Please wait ${timeRemaining} seconds...`}
              </span>
              <span className="font-mono font-semibold">{timeRemaining}s</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Action Button */}
          <Button
            className="w-full"
            onClick={handleClaim}
            disabled={!isComplete}
            data-testid="button-claim-reward"
          >
            {isComplete ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Claim {ad.payout}
              </>
            ) : (
              `Claim ${ad.payout} (${timeRemaining}s)`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
