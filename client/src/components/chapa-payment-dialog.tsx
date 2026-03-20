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
import { Wallet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";

interface ChapaPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userPhoneNumber?: string;
}

export function ChapaPaymentDialog({
  open,
  onOpenChange,
  userId,
  userEmail,
  userFirstName,
  userLastName,
  userPhoneNumber,
}: ChapaPaymentDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) < 10) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount of at least ETB 10.00",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient.post("/chapa/initialize", {
        userId,
        amount: parseFloat(amount),
        currency: "ETB",
        email: userEmail,
        firstName: userFirstName,
        lastName: userLastName,
        phoneNumber: userPhoneNumber,
        returnUrl: `${window.location.origin}/payment/success`,
        callbackUrl: `${window.location.origin}/api/chapa/callback`,
      });

      toast({
        title: "Redirecting to Chapa",
        description: "You will be redirected to complete your payment.",
      });

      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pay with Chapa
          </DialogTitle>
          <DialogDescription>Make a secure payment using Chapa payment gateway</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chapa-amount">
              Amount (ETB) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="chapa-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              min="10"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">Minimum payment: ETB 10.00</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-1">Payment Information</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Secure payment via Chapa</li>
              <li>• Supports multiple payment methods</li>
              <li>• Instant payment confirmation</li>
              <li>• Transaction fees may apply</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={!amount || parseFloat(amount) < 10 || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ETB ${amount || "0.00"}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
