import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KYCReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: {
    id: string;
    userId: string;
    userName: string;
    email: string;
    documents: string[];
    submittedDate: string;
    attemptNumber?: number;
    previousRejectionReason?: string;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
}

export function KYCReviewDialog({
  open,
  onOpenChange,
  submission,
  onApprove,
  onReject,
}: KYCReviewDialogProps) {
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");

  const attemptNumber = submission.attemptNumber || 1;
  const maxAttempts = 3;
  const remainingAttempts = maxAttempts - attemptNumber;
  const isLastAttempt = attemptNumber >= maxAttempts;

  const handleApprove = () => {
    if (onApprove) {
      onApprove(submission.id);
    }
    toast({
      title: "KYC Approved",
      description: `${submission.userName}'s verification has been approved.`,
    });
    onOpenChange(false);
    setRejectionReason("");
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a detailed reason so the user can fix their submission.",
        variant: "destructive",
      });
      return;
    }

    if (onReject) {
      onReject(submission.id, rejectionReason);
    }

    const message = isLastAttempt
      ? `${submission.userName}'s verification has been permanently rejected (final attempt).`
      : `${submission.userName}'s verification has been rejected. ${remainingAttempts - 1} resubmission${remainingAttempts - 1 !== 1 ? "s" : ""} remaining.`;

    toast({
      title: "KYC Rejected",
      description: message,
      variant: "destructive",
    });
    onOpenChange(false);
    setRejectionReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KYC Review - {submission.userName}</DialogTitle>
          <DialogDescription>
            Review submitted documents and approve or reject verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-medium">{submission.userId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{submission.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="font-medium">{submission.submittedDate}</p>
            </div>
          </div>

          {/* Attempt Counter */}
          <div
            className={`p-4 rounded-lg ${isLastAttempt ? "bg-destructive/10 border border-destructive" : "bg-chart-4/10 border border-chart-4"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Submission Attempt</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLastAttempt
                    ? "This is the final attempt. Rejection will be permanent."
                    : `User can resubmit ${remainingAttempts} more time${remainingAttempts !== 1 ? "s" : ""} if rejected.`}
                </p>
              </div>
              <div
                className={`text-2xl font-bold ${isLastAttempt ? "text-destructive" : "text-chart-4"}`}
                data-testid="text-attempt-number"
              >
                {attemptNumber} / {maxAttempts}
              </div>
            </div>
          </div>

          {/* Previous Rejection Reason (if exists) */}
          {submission.previousRejectionReason && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium mb-2">Previous Rejection Reason:</p>
              <p className="text-sm text-muted-foreground italic">
                {submission.previousRejectionReason}
              </p>
            </div>
          )}

          {/* Documents */}
          <div>
            <h3 className="font-semibold mb-3">Submitted Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {submission.documents.map((doc, index) => (
                <div key={index} className="border border-border rounded-lg p-4 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{doc}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    data-testid={`button-view-doc-${index}`}
                  >
                    View Document
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection Reason */}
          <div>
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Provide a detailed reason for rejection (e.g., blurry document, expired ID, mismatched information). Be specific so the user knows how to fix it."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              data-testid="textarea-rejection-reason"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isLastAttempt
                ? "⚠️ This rejection will be permanent. Provide a clear reason for the user's records."
                : "This reason will help the user correct their submission for the next attempt."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-destructive border-destructive"
              onClick={handleReject}
              data-testid="button-reject-kyc"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApprove} data-testid="button-approve-kyc">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
