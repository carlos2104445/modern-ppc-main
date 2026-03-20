import { useState } from "react";
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
} from "lucide-react";
import { DepositDialog } from "@/components/deposit-dialog";
import { WithdrawDialog } from "@/components/withdraw-dialog";

export default function Wallet() {
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const transactions = [
    {
      id: "1",
      type: "deposit" as const,
      amount: "ETB 100.00",
      description: "PayPal deposit",
      status: "completed" as const,
      date: "2024-01-15 10:30 AM",
    },
    {
      id: "2",
      type: "click_earning" as const,
      amount: "ETB 0.05",
      description: "Ad click reward",
      status: "completed" as const,
      date: "2024-01-15 09:15 AM",
    },
    {
      id: "3",
      type: "referral_commission" as const,
      amount: "ETB 2.50",
      description: "Level 1 referral commission",
      status: "completed" as const,
      date: "2024-01-14 03:20 PM",
    },
    {
      id: "4",
      type: "withdrawal" as const,
      amount: "ETB 50.00",
      description: "Bank transfer",
      status: "pending" as const,
      date: "2024-01-14 11:00 AM",
    },
    {
      id: "5",
      type: "click_earning" as const,
      amount: "ETB 0.08",
      description: "Ad click reward",
      status: "completed" as const,
      date: "2024-01-13 02:45 PM",
    },
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

  const recentDeposits = [
    { id: "1", amount: "ETB 100.00", method: "PayPal", status: "completed", date: "2024-01-15" },
    {
      id: "2",
      amount: "ETB 200.00",
      method: "Bank Transfer",
      status: "completed",
      date: "2024-01-12",
    },
    {
      id: "3",
      amount: "ETB 50.00",
      method: "Credit Card",
      status: "completed",
      date: "2024-01-08",
    },
  ];

  const withdrawalMethods = [
    { id: "1", type: "PayPal", email: "john.doe@example.com", status: "verified" },
    { id: "2", type: "Bank Transfer", account: "****1234", status: "verified" },
    { id: "3", type: "Cryptocurrency", address: "0x742d...5e89", status: "pending" },
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
                ETB 1,234.56
              </p>
              <p className="text-sm text-muted-foreground mt-1">Available for withdrawal</p>
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
                    Deposits
                  </TabsTrigger>
                  <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">
                    Withdrawals
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <TransactionTable transactions={transactions} />
                </TabsContent>

                <TabsContent value="deposits" className="mt-4 space-y-3">
                  {recentDeposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-card-border hover-elevate"
                      data-testid={`deposit-${deposit.id}`}
                    >
                      <div>
                        <p className="font-semibold">{deposit.amount}</p>
                        <p className="text-sm text-muted-foreground">{deposit.method}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={statusColors[deposit.status as keyof typeof statusColors]}
                        >
                          {deposit.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{deposit.date}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="withdrawals" className="mt-4 space-y-3">
                  {recentWithdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-card-border hover-elevate"
                      data-testid={`withdrawal-${withdrawal.id}`}
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdrawal Methods Card */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {withdrawalMethods.map((method) => (
              <div
                key={method.id}
                className="p-4 rounded-lg border border-card-border hover-elevate"
                data-testid={`method-${method.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {method.type === "PayPal" && <CreditCard className="h-4 w-4" />}
                    {method.type === "Bank Transfer" && <Building2 className="h-4 w-4" />}
                    {method.type === "Cryptocurrency" && <WalletIcon className="h-4 w-4" />}
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
          </div>
        </CardContent>
      </Card>

      <DepositDialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen} />

      <WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        availableBalance="ETB 1,234.56"
      />
    </div>
  );
}
