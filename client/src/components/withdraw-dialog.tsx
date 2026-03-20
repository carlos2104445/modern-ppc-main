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
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building2, Wallet, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: string;
}

export function WithdrawDialog({ open, onOpenChange, availableBalance }: WithdrawDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const withdrawalMethods = [
    { id: "1", type: "PayPal", email: "john.doe@example.com", status: "verified" },
    { id: "2", type: "Bank Transfer", account: "****1234", status: "verified" },
    { id: "3", type: "Cryptocurrency", address: "0x742d...5e89", status: "pending" },
  ];

  const statusColors = {
    verified: "bg-chart-2",
    pending: "bg-chart-4",
  };

  const handleWithdraw = () => {
    if (!amount || !method) {
      toast({
        title: "Missing information",
        description: "Please enter amount and select withdrawal method.",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount < 10) {
      toast({
        title: "Invalid amount",
        description: "Minimum withdrawal is ETB 10.00",
        variant: "destructive",
      });
      return;
    }

    console.log("Withdraw:", { amount, method });
    toast({
      title: "Withdrawal requested",
      description: `Your withdrawal of ETB ${amount} has been submitted for processing.`,
    });
    setAmount("");
    setMethod("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>Request a withdrawal to your preferred method</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-3xl font-bold mt-1">{availableBalance}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Withdrawal Details</h3>

              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-withdraw-amount"
                />
                <p className="text-xs text-muted-foreground">Minimum withdrawal: ETB 10.00</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-method">
                  Withdrawal Method <span className="text-destructive">*</span>
                </Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger id="withdraw-method" data-testid="select-withdraw-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal - john.doe@example.com</SelectItem>
                    <SelectItem value="bank">Bank Transfer - ****1234</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency - 0x742d...5e89</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <h4 className="font-semibold mb-2 text-sm">Processing Information</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Processing time: 1-3 business days</li>
                  <li>• Transaction fee: 2% (minimum ETB 0.50)</li>
                  <li>• KYC verification required for withdrawals over ETB 100</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Withdrawal Methods</h3>
                <Button variant="ghost" size="sm" data-testid="button-add-withdrawal-method">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {withdrawalMethods.map((methodItem) => (
                  <div
                    key={methodItem.id}
                    className="p-3 rounded-lg border border-card-border hover-elevate"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {methodItem.type === "PayPal" && <CreditCard className="h-4 w-4" />}
                        {methodItem.type === "Bank Transfer" && <Building2 className="h-4 w-4" />}
                        {methodItem.type === "Cryptocurrency" && <Wallet className="h-4 w-4" />}
                        <span className="font-medium text-sm">{methodItem.type}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={statusColors[methodItem.status as keyof typeof statusColors]}
                      >
                        {methodItem.status === "verified" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {methodItem.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {"email" in methodItem && methodItem.email}
                      {"account" in methodItem && methodItem.account}
                      {"address" in methodItem && methodItem.address}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel-withdraw"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              className="flex-1"
              disabled={!amount || !method}
              data-testid="button-submit-withdraw"
            >
              Submit Withdrawal Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
