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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Building2,
  Wallet,
  Zap,
  FileText,
  Loader2,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth-context";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

export function DepositDialog({ open, onOpenChange }: DepositDialogProps) {
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [manualSubmitted, setManualSubmitted] = useState(false);

  const resetForm = () => {
    setAmount("");
    setMethod("");
    setReference("");
    setLoading(false);
    setManualSubmitted(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  // Chapa automated deposit
  const handleChapaDeposit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      toast({ title: "Invalid amount", description: "Minimum deposit is ETB 10.00", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/payments/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: numAmount.toFixed(2) }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to Chapa checkout
        window.open(data.checkoutUrl, "_blank");
        toast({
          title: "Redirecting to Chapa",
          description: "Complete your payment in the new tab. Your balance will update automatically.",
        });
        handleClose(false);
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

  // Manual deposit
  const handleManualDeposit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      toast({ title: "Invalid amount", description: "Minimum deposit is ETB 10.00", variant: "destructive" });
      return;
    }
    if (!method) {
      toast({ title: "Missing method", description: "Select a payment method", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/payments/deposit/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: numAmount.toFixed(2), method, reference }),
      });

      if (res.ok) {
        setManualSubmitted(true);
        toast({
          title: "Deposit request submitted",
          description: "Your deposit will be credited after admin verification.",
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
            Deposit Funds
          </DialogTitle>
          <DialogDescription>Add funds to your wallet</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="chapa" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chapa" className="flex items-center gap-1.5" data-testid="tab-chapa-deposit">
              <Zap className="h-3.5 w-3.5" />
              Chapa (Instant)
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1.5" data-testid="tab-manual-deposit">
              <FileText className="h-3.5 w-3.5" />
              Manual
            </TabsTrigger>
          </TabsList>

          {/* Chapa auto deposit */}
          <TabsContent value="chapa" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Amount (ETB)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                data-testid="input-chapa-amount"
              />
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((qa) => (
                  <Button
                    key={qa}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(qa.toString())}
                    className="text-xs"
                  >
                    ETB {qa}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm font-medium">How it works</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• You'll be redirected to Chapa's secure payment page</li>
                <li>• Pay with Telebirr, CBE Birr, Bank Transfer, or Card</li>
                <li>• Funds are credited instantly after payment</li>
                <li>• No extra fees from AdConnect</li>
              </ul>
            </div>

            <Button
              className="w-full h-11"
              onClick={handleChapaDeposit}
              disabled={loading || !amount || parseFloat(amount) < 10}
              data-testid="button-chapa-deposit"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <><ExternalLink className="h-4 w-4 mr-2" /> Pay ETB {amount || "0.00"} via Chapa</>
              )}
            </Button>
          </TabsContent>

          {/* Manual deposit */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            {manualSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-chart-2 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Request Submitted</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your deposit will be credited after admin verification (typically within 24 hours).
                </p>
                <Button variant="outline" className="mt-4" onClick={() => handleClose(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Amount (ETB)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="10"
                    data-testid="input-manual-amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger data-testid="select-manual-method">
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

                <div className="space-y-2">
                  <Label>Transaction Reference (optional)</Label>
                  <Input
                    placeholder="Enter your payment reference number"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    data-testid="input-manual-reference"
                  />
                </div>

                <div className="p-3 rounded-lg bg-chart-4/10 text-sm">
                  <p className="font-medium mb-1">Manual deposits require admin approval</p>
                  <p className="text-xs text-muted-foreground">
                    Transfer the amount, then submit this form with your reference. An admin will verify and credit your account within 24 hours.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleManualDeposit}
                  disabled={loading || !amount || !method}
                  data-testid="button-manual-deposit"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Deposit Request"
                  )}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
