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
import { CheckCircle, XCircle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WithdrawalReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal: {
    id: string;
    userId: string;
    userName: string;
    amount: string;
    method: string;
    account: string;
    requestDate: string;
  };
}

export function WithdrawalReviewDialog({
  open,
  onOpenChange,
  withdrawal,
}: WithdrawalReviewDialogProps) {
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const handleApprove = () => {
    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID required",
        description: "Please provide a transaction ID for processing.",
        variant: "destructive",
      });
      return;
    }
    console.log("Approving withdrawal:", withdrawal.id, transactionId);
    toast({
      title: "Withdrawal Approved",
      description: `${withdrawal.amount} withdrawal has been processed.`,
    });
    onOpenChange(false);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    console.log("Rejecting withdrawal:", withdrawal.id, rejectionReason);
    toast({
      title: "Withdrawal Rejected",
      description: `Withdrawal request has been rejected.`,
      variant: "destructive",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Withdrawal Review
          </DialogTitle>
          <DialogDescription>Review and process withdrawal request</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Withdrawal Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">User</p>
              <p className="font-medium">{withdrawal.userName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-medium">{withdrawal.userId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-bold text-lg text-primary">{withdrawal.amount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Method</p>
              <p className="font-medium">{withdrawal.method}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account</p>
              <p className="font-medium">{withdrawal.account}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requested</p>
              <p className="font-medium">{withdrawal.requestDate}</p>
            </div>
          </div>

          {/* Transaction ID (for approval) */}
          <div>
            <Label htmlFor="transaction-id">Transaction ID (required for approval)</Label>
            <Textarea
              id="transaction-id"
              placeholder="Enter payment gateway transaction ID..."
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              rows={2}
              data-testid="input-transaction-id"
            />
          </div>

          {/* Rejection Reason */}
          <div>
            <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Provide a reason if rejecting this withdrawal..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              data-testid="textarea-rejection-reason"
            />
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
              data-testid="button-reject-withdrawal"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApprove} data-testid="button-approve-withdrawal">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Process
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
