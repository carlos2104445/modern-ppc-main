import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink, Youtube, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminAdPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ad: {
    id: string;
    title: string;
    description?: string;
    advertiser: string;
    campaign: string;
    payout: string;
    duration: number;
    status: string;
    type?: "link" | "youtube" | "banner";
    targetUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
}

export function AdminAdPreviewDialog({
  open,
  onOpenChange,
  ad,
  onApprove,
  onReject,
}: AdminAdPreviewDialogProps) {
  const { toast } = useToast();
  const [showRejectionReason, setShowRejectionReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url?.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const handleApprove = () => {
    onApprove?.(ad.id);
    toast({
      title: "Ad approved",
      description: `"${ad.title}" has been approved and is now live.`,
    });
    onOpenChange(false);
    setShowRejectionReason(false);
    setRejectionReason("");
  };

  const handleRejectClick = () => {
    setShowRejectionReason(true);
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description:
          "Please provide a reason for rejection so the user can understand what went wrong.",
        variant: "destructive",
      });
      return;
    }

    onReject?.(ad.id, rejectionReason);
    toast({
      title: "Ad rejected",
      description: `"${ad.title}" has been rejected. The user has been notified with your reason.`,
      variant: "destructive",
    });
    onOpenChange(false);
    setShowRejectionReason(false);
    setRejectionReason("");
  };

  const handleCancelReject = () => {
    setShowRejectionReason(false);
    setRejectionReason("");
  };

  const adType = ad.type || "link";

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
            Campaign: {ad.campaign} • By {ad.advertiser} • Payout: {ad.payout}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ad Details */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{adType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium">{ad.duration}s</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{ad.status}</p>
            </div>
          </div>

          {/* Ad Content Preview */}
          <div className="min-h-[300px] flex items-center justify-center bg-muted/30 rounded-lg p-6">
            {adType === "link" && (
              <div className="text-center space-y-4">
                <ExternalLink className="h-20 w-20 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">{ad.title}</h3>
                <p className="text-muted-foreground max-w-md">
                  {ad.description || "Click to visit advertiser's website"}
                </p>
                {ad.targetUrl && (
                  <a
                    href={ad.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    {ad.targetUrl} <ExternalLink className="h-4 w-4" />
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

            {((adType === "link" && !ad.targetUrl) ||
              (adType === "youtube" && !ad.videoUrl) ||
              (adType === "banner" && !ad.imageUrl)) && (
              <p className="text-muted-foreground text-center">No preview available</p>
            )}
          </div>

          {ad.description && adType !== "link" && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground">{ad.description}</p>
            </div>
          )}
        </div>

        {showRejectionReason && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="ad-rejection-reason">Rejection Reason *</Label>
            <Textarea
              id="ad-rejection-reason"
              placeholder="Explain to the user why this ad was rejected (e.g., violates content policy, misleading information, inappropriate imagery)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              data-testid="textarea-ad-rejection-reason"
            />
            <p className="text-xs text-muted-foreground">
              This reason will be shown to the user so they can improve their ad.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {showRejectionReason ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelReject}
                data-testid="button-cancel-reject"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="text-destructive border-destructive"
                onClick={handleConfirmReject}
                data-testid="button-confirm-reject-ad"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Confirm Rejection
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-close-preview"
              >
                Close
              </Button>
              {ad.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive"
                    onClick={handleRejectClick}
                    data-testid={`button-reject-ad-dialog-${ad.id}`}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="bg-chart-2 hover:bg-chart-2/90"
                    onClick={handleApprove}
                    data-testid={`button-approve-ad-dialog-${ad.id}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
