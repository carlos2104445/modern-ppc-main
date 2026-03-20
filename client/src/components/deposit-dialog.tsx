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
import { CreditCard, Building2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositDialog({ open, onOpenChange }: DepositDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const handleDeposit = () => {
    if (!amount || !method) {
      toast({
        title: "Missing information",
        description: "Please enter amount and select payment method.",
        variant: "destructive",
      });
      return;
    }

    console.log("Deposit:", { amount, method });
    toast({
      title: "Deposit initiated",
      description: `Your deposit of ETB ${amount} has been initiated.`,
    });
    setAmount("");
    setMethod("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Deposit Funds
          </DialogTitle>
          <DialogDescription>Add funds to your wallet</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">
              Amount <span className="text-destructive">*</span>
            </Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-deposit-amount"
            />
            <p className="text-xs text-muted-foreground">Minimum deposit: ETB 10.00</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit-method">
              Payment Method <span className="text-destructive">*</span>
            </Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="deposit-method" data-testid="select-deposit-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    PayPal
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-1">Transaction Info</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Instant processing for most methods</li>
              <li>• No transaction fees</li>
              <li>• Secure payment gateway</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel-deposit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              className="flex-1"
              disabled={!amount || !method}
              data-testid="button-submit-deposit"
            >
              Deposit ETB {amount || "0.00"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
