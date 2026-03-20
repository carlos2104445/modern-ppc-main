import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { TransactionTable } from "@/components/transaction-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Building2,
  CheckCircle,
  Loader2,
  DollarSign,
} from "lucide-react";
import { DepositDialog } from "@/components/deposit-dialog";
import { WithdrawDialog } from "@/components/withdraw-dialog";
import { useAuth } from "@/hooks/use-auth-context";
import { useToast } from "@/hooks/use-toast";

export default function Wallet() {
  const { user, loading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  // Handle Chapa payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const txRef = params.get("tx_ref");

    if (paymentStatus === "success" && txRef) {
      // Verify the payment
      fetch(`/api/v1/payments/verify/${txRef}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "completed") {
            toast({ title: "Payment successful! 🎉", description: "Your balance has been updated." });
            refreshProfile();
          } else {
            toast({ title: "Payment processing", description: "Your payment is being verified." });
          }
        })
        .catch(() => {});
      // Clean URL
      window.history.replaceState({}, "", "/wallet");
    } else if (paymentStatus === "failed") {
      toast({ title: "Payment failed", description: "Please try again.", variant: "destructive" });
      window.history.replaceState({}, "", "/wallet");
    } else if (paymentStatus === "error") {
      toast({ title: "Payment error", description: "Something went wrong.", variant: "destructive" });
      window.history.replaceState({}, "", "/wallet");
    }
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/v1/user/transactions", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoadingTx(false);
      }
    }
    if (user) fetchTransactions();
  }, [user]);

  const balance = parseFloat(user?.balance || "0").toFixed(2);

  const formattedTransactions = transactions.map((tx) => ({
    id: tx.id,
    type: tx.type as any,
    amount: `ETB ${Math.abs(parseFloat(tx.amount)).toFixed(2)}`,
    description: tx.description,
    status: tx.status as any,
    date: new Date(tx.createdAt).toLocaleString(),
  }));

  const deposits = formattedTransactions.filter((t) =>
    ["deposit", "campaign_refund"].includes(transactions.find((tx) => tx.id === t.id)?.type || "")
  );
  const withdrawals = formattedTransactions.filter((t) =>
    ["withdrawal", "campaign_escrow"].includes(transactions.find((tx) => tx.id === t.id)?.type || "")
  );

  const statusColors: Record<string, string> = {
    completed: "bg-chart-2",
    pending: "bg-chart-4",
    failed: "bg-destructive",
    verified: "bg-chart-2",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your balance and transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-4xl font-bold" data-testid="text-balance">
                ETB {balance}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Available for use</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="flex-col h-auto py-4"
                onClick={() => setDepositDialogOpen(true)}
                data-testid="button-deposit"
              >
                <ArrowDownToLine className="h-5 w-5 mb-1" />
                <span className="text-xs">Deposit</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => setWithdrawDialogOpen(true)}
                data-testid="button-withdraw"
              >
                <ArrowUpFromLine className="h-5 w-5 mb-1" />
                <span className="text-xs">Withdraw</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all" data-testid="tab-all-transactions">
                    All Transactions
                  </TabsTrigger>
                  <TabsTrigger value="deposits" data-testid="tab-deposits">
                    Credits
                  </TabsTrigger>
                  <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">
                    Debits
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  {loadingTx ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : formattedTransactions.length > 0 ? (
                    <TransactionTable transactions={formattedTransactions} />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                  )}
                </TabsContent>

                <TabsContent value="deposits" className="mt-4 space-y-3">
                  {deposits.length > 0 ? (
                    deposits.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-card-border hover-elevate"
                      >
                        <div>
                          <p className="font-semibold">{tx.amount}</p>
                          <p className="text-sm text-muted-foreground">{tx.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={statusColors[tx.status] || ""}>
                            {tx.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No credits yet</p>
                  )}
                </TabsContent>

                <TabsContent value="withdrawals" className="mt-4 space-y-3">
                  {withdrawals.length > 0 ? (
                    withdrawals.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-card-border hover-elevate"
                      >
                        <div>
                          <p className="font-semibold">{tx.amount}</p>
                          <p className="text-sm text-muted-foreground">{tx.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={statusColors[tx.status] || ""}>
                            {tx.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No debits yet</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <DepositDialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen} />

      <WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        availableBalance={`ETB ${balance}`}
      />
    </div>
  );
}
