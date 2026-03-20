import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Wallet, Building2, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    id: string;
    name: string;
    price: string;
    period: string;
  };
}

export function SubscriptionPaymentDialog({
  open,
  onOpenChange,
  plan,
}: SubscriptionPaymentDialogProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  // Mock wallet balance
  const walletBalance = "ETB 1,234.56";
  const planPrice = parseFloat(plan.price.replace("ETB ", ""));

  const handlePayment = () => {
    if (paymentMethod === "wallet") {
      // Check if wallet has sufficient balance
      const balance = parseFloat(walletBalance.replace("ETB ", "").replace(",", ""));
      if (balance < planPrice) {
        toast({
          title: "Insufficient balance",
          description: "Please add funds to your wallet or choose a different payment method.",
          variant: "destructive",
        });
        return;
      }
    }

    console.log("Processing payment:", { plan: plan.id, method: paymentMethod });

    toast({
      title: "Subscription activated!",
      description: `You are now subscribed to ${plan.name}. Welcome to premium features!`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to {plan.name}</DialogTitle>
          <DialogDescription>Choose your payment method to complete subscription</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" data-testid="text-payment-plan-name">
                {plan.name} Plan
              </span>
              <span className="text-lg font-bold" data-testid="text-payment-plan-price">
                {plan.price}
              </span>
            </div>
            <p className="text-xs text-muted-foreground" data-testid="text-payment-billing-period">
              Billed {plan.period}
            </p>
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label className="mb-3 block">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <Card
                className={`p-4 cursor-pointer hover-elevate ${paymentMethod === "wallet" ? "border-primary border-2" : ""}`}
                onClick={() => setPaymentMethod("wallet")}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="wallet" id="wallet" data-testid="radio-payment-wallet" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="h-5 w-5" />
                      <Label htmlFor="wallet" className="font-medium cursor-pointer">
                        AdConnect Wallet
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid="text-wallet-balance">
                      Available balance: {walletBalance}
                    </p>
                    {parseFloat(walletBalance.replace("ETB ", "").replace(",", "")) < planPrice && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        <span>Insufficient balance</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer hover-elevate ${paymentMethod === "bank" ? "border-primary border-2" : ""}`}
                onClick={() => setPaymentMethod("bank")}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="bank" id="bank" data-testid="radio-payment-bank" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-5 w-5" />
                      <Label htmlFor="bank" className="font-medium cursor-pointer">
                        Bank Transfer
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pay directly from your bank account
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer hover-elevate ${paymentMethod === "card" ? "border-primary border-2" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="card" id="card" data-testid="radio-payment-card" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="h-5 w-5" />
                      <Label htmlFor="card" className="font-medium cursor-pointer">
                        Credit/Debit Card
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pay with Visa, Mastercard, or other cards
                    </p>
                  </div>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* Payment Terms */}
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">
              By completing this payment, you agree to subscribe to {plan.name} plan at {plan.price}{" "}
              billed {plan.period}. You can cancel your subscription at any time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-payment"
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handlePayment} data-testid="button-confirm-payment">
              Pay {plan.price}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
