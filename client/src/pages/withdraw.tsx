import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Wallet, CreditCard, Building2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Withdraw() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const handleWithdraw = () => {
    console.log("Withdraw:", { amount, method });
    toast({
      title: "Withdrawal requested",
      description: `Your withdrawal of $${amount} has been submitted for processing.`,
    });
  };

  const withdrawalMethods = [
    { id: "1", type: "PayPal", email: "john.doe@example.com", status: "verified" },
    { id: "2", type: "Bank Transfer", account: "****1234", status: "verified" },
    { id: "3", type: "Cryptocurrency", address: "0x742d...5e89", status: "pending" },
  ];

  const recentWithdrawals = [
    { id: "1", amount: "ETB 50.00", method: "PayPal", status: "completed", date: "2024-01-14" },
    {
      id: "2",
      amount: "ETB 100.00",
      method: "Bank Transfer",
      status: "pending",
      date: "2024-01-10",
    },
    { id: "3", amount: "ETB 25.00", method: "PayPal", status: "completed", date: "2024-01-05" },
  ];

  const statusColors = {
    completed: "bg-chart-2",
    pending: "bg-chart-4",
    failed: "bg-destructive",
    verified: "bg-chart-2",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdraw Funds</h1>
        <p className="text-muted-foreground mt-1">Request a withdrawal to your preferred method</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                New Withdrawal
              </CardTitle>
              <CardDescription>Enter withdrawal details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold mt-1" data-testid="text-available-balance">
                  ETB 1,234.56
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-withdrawal-amount"
                />
                <p className="text-xs text-muted-foreground">Minimum withdrawal: ETB 10.00</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Withdrawal Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger id="method" data-testid="select-withdrawal-method">
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
                <h4 className="font-semibold mb-2">Processing Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Processing time: 1-3 business days</li>
                  <li>• Transaction fee: 2% (minimum ETB 0.50)</li>
                  <li>• KYC verification required for withdrawals over ETB 100</li>
                </ul>
              </div>

              <Button
                className="w-full"
                onClick={handleWithdraw}
                disabled={!amount || !method}
                data-testid="button-submit-withdrawal"
              >
                Submit Withdrawal Request
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-card-border hover-elevate"
                  >
                    <div>
                      <p className="font-semibold">{withdrawal.amount}</p>
                      <p className="text-sm text-muted-foreground">{withdrawal.method}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={statusColors[withdrawal.status as keyof typeof statusColors]}
                      >
                        {withdrawal.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{withdrawal.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Methods</CardTitle>
              <CardDescription>Manage your withdrawal methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {withdrawalMethods.map((method) => (
                <div
                  key={method.id}
                  className="p-3 rounded-lg border border-card-border hover-elevate"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {method.type === "PayPal" && <CreditCard className="h-4 w-4" />}
                      {method.type === "Bank Transfer" && <Building2 className="h-4 w-4" />}
                      {method.type === "Cryptocurrency" && <Wallet className="h-4 w-4" />}
                      <span className="font-medium text-sm">{method.type}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={statusColors[method.status as keyof typeof statusColors]}
                    >
                      {method.status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {method.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {"email" in method && method.email}
                    {"account" in method && method.account}
                    {"address" in method && method.address}
                  </p>
                </div>
              ))}
              <Button variant="outline" className="w-full" data-testid="button-add-method">
                Add New Method
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
