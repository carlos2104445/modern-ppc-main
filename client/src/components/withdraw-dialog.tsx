import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Wallet,
  Loader2,
  CheckCircle,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth-context";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: string;
}

export function WithdrawDialog({ open, onOpenChange, availableBalance }: WithdrawDialogProps) {
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newBalance, setNewBalance] = useState<string | null>(null);

  const numBalance = parseFloat(availableBalance.replace(/[^0-9.]/g, "")) || 0;
  const numAmount = parseFloat(amount) || 0;
  const isValidAmount = numAmount >= 10 && numAmount <= numBalance;

  const resetForm = () => {
    setAmount("");
    setMethod("");
    setAccountDetails("");
    setLoading(false);
    setSubmitted(false);
    setNewBalance(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const handleWithdraw = async () => {
    if (!isValidAmount) {
      toast({
        title: "Invalid amount",
        description: numAmount < 10
          ? "Minimum withdrawal is ETB 10.00"
          : `Insufficient balance. You have ${availableBalance}`,
        variant: "destructive",
      });
      return;
    }
    if (!method) {
      toast({ title: "Missing method", description: "Select a withdrawal method", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/payments/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: numAmount.toFixed(2),
          method,
          accountDetails,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmitted(true);
        setNewBalance(data.newBalance);
        await refreshProfile();
        toast({
          title: "Withdrawal submitted",
          description: data.message,
        });
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>Request a withdrawal to your preferred method</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="h-12 w-12 text-chart-2 mx-auto" />
            <h3 className="font-semibold text-lg">Withdrawal Submitted</h3>
            <p className="text-sm text-muted-foreground">
              Your withdrawal of <strong>ETB {numAmount.toFixed(2)}</strong> via{" "}
              <strong className="capitalize">{method.replace(/_/g, " ")}</strong> has been submitted for processing.
            </p>
            {newBalance && (
              <p className="text-sm">
                New balance: <strong>ETB {parseFloat(newBalance).toFixed(2)}</strong>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Processing typically takes 1-3 business days.
            </p>
            <Button variant="outline" onClick={() => handleClose(false)} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Balance display */}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold mt-1">{availableBalance}</p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount (ETB) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                max={numBalance}
                data-testid="input-withdraw-amount"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: ETB 10.00</span>
                <Button
                  variant="ghost"
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => setAmount(numBalance.toFixed(2))}
                >
                  Max: ETB {numBalance.toFixed(2)}
                </Button>
              </div>
              {numAmount > numBalance && (
                <div className="flex items-center gap-1 text-destructive text-xs">
                  <AlertTriangle className="h-3 w-3" /> Exceeds available balance
                </div>
              )}
            </div>

            {/* Method */}
            <div className="space-y-2">
              <Label>Withdrawal Method <span className="text-destructive">*</span></Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger data-testid="select-withdraw-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="telebirr">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Telebirr
                    </div>
                  </SelectItem>
                  <SelectItem value="cbe_birr">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> CBE Birr
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account details */}
            <div className="space-y-2">
              <Label>Account Details <span className="text-destructive">*</span></Label>
              <Input
                placeholder={
                  method === "bank_transfer"
                    ? "Bank name & account number"
                    : method === "telebirr" || method === "cbe_birr"
                    ? "Phone number"
                    : "Enter account details"
                }
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                data-testid="input-account-details"
              />
            </div>

            {/* Processing info */}
            <div className="p-3 rounded-lg border border-border">
              <h4 className="font-semibold mb-1.5 text-sm">Processing Information</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• Processing time: 1-3 business days</li>
                <li>• Balance is deducted immediately</li>
                <li>• You will be notified once processed</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleClose(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                className="flex-1"
                disabled={loading || !isValidAmount || !method || !accountDetails}
                data-testid="button-submit-withdraw"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  `Withdraw ETB ${numAmount > 0 ? numAmount.toFixed(2) : "0.00"}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
