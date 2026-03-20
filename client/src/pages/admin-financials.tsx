import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  X,
  Eye,
  AlertCircle,
  Settings,
  FileText,
  Search,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import type {
  WithdrawalRequest,
  DepositRequest,
  FinancialSettings,
  TransactionLog,
} from "@shared/schema";

export default function AdminFinancials() {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [withdrawalFeePercentage, setWithdrawalFeePercentage] = useState("");
  const [depositFeePercentage, setDepositFeePercentage] = useState("");
  const [txnSearchId, setTxnSearchId] = useState("");
  const [txnSearchQuery, setTxnSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: withdrawalRequests = [], isLoading: loadingWithdrawals } = useQuery<
    WithdrawalRequest[]
  >({
    queryKey: ["/api/withdrawal-requests"],
  });

  const { data: depositRequests = [], isLoading: loadingDeposits } = useQuery<DepositRequest[]>({
    queryKey: ["/api/deposit-requests"],
  });

  const { data: financialSettings, isLoading: loadingSettings } = useQuery<FinancialSettings>({
    queryKey: ["/api/financial-settings"],
  });

  useEffect(() => {
    if (financialSettings) {
      setTaxPercentage(financialSettings.taxPercentage);
      setWithdrawalFeePercentage(financialSettings.withdrawalFeePercentage);
      setDepositFeePercentage(financialSettings.depositFeePercentage);
    }
  }, [financialSettings]);

  const { data: transactionLogs = [], isLoading: loadingLogs } = useQuery<TransactionLog[]>({
    queryKey: txnSearchQuery
      ? ["/api/transaction-logs", { txnId: txnSearchQuery }]
      : ["/api/transaction-logs"],
    queryFn: async () => {
      const url = txnSearchQuery
        ? `/api/transaction-logs?txnId=${encodeURIComponent(txnSearchQuery)}`
        : "/api/transaction-logs";
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch transaction logs");
      return response.json();
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/financial-settings", "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-settings"] });
      toast({
        title: "Settings updated",
        description: "Financial settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update financial settings.",
        variant: "destructive",
      });
    },
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/withdrawal-requests/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawal-requests"] });
      toast({
        title: "Withdrawal updated",
        description: "The withdrawal request has been updated successfully.",
      });
      setWithdrawalDialogOpen(false);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update withdrawal request.",
        variant: "destructive",
      });
    },
  });

  const updateDepositMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/deposit-requests/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposit-requests"] });
      toast({
        title: "Deposit updated",
        description: "The deposit request has been updated successfully.",
      });
      setDepositDialogOpen(false);
      setFailureReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deposit request.",
        variant: "destructive",
      });
    },
  });

  const stats = {
    totalRevenue: 45678,
    totalDeposits: depositRequests
      .filter((d) => d.status === "completed")
      .reduce((acc, d) => acc + parseFloat(String(d.amount)), 0),
    totalWithdrawals: withdrawalRequests
      .filter((w) => w.status === "approved")
      .reduce((acc, w) => acc + parseFloat(String(w.amount)), 0),
    pendingWithdrawals: withdrawalRequests.filter((w) => w.status === "pending").length,
    failedDeposits: depositRequests.filter((d) => d.status === "failed").length,
  };

  const handleReviewWithdrawal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setWithdrawalDialogOpen(true);
  };

  const handleApproveWithdrawal = () => {
    if (!selectedWithdrawal) return;
    updateWithdrawalMutation.mutate({
      id: selectedWithdrawal.id,
      data: {
        status: "approved",
        reviewedBy: "admin",
        reviewedAt: new Date().toISOString(),
      },
    });
  };

  const handleRejectWithdrawal = () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) {
      toast({
        title: "Validation error",
        description: "Please provide a rejection reason.",
        variant: "destructive",
      });
      return;
    }
    updateWithdrawalMutation.mutate({
      id: selectedWithdrawal.id,
      data: {
        status: "rejected",
        rejectionReason: rejectionReason,
        reviewedBy: "admin",
        reviewedAt: new Date().toISOString(),
      },
    });
  };

  const handleReviewDeposit = (deposit: DepositRequest) => {
    setSelectedDeposit(deposit);
    setDepositDialogOpen(true);
  };

  const handleRetryDeposit = () => {
    if (!selectedDeposit) return;
    updateDepositMutation.mutate({
      id: selectedDeposit.id,
      data: {
        status: "pending",
        failureReason: null,
      },
    });
  };

  const handleMarkDepositFailed = () => {
    if (!selectedDeposit || !failureReason.trim()) {
      toast({
        title: "Validation error",
        description: "Please provide a failure reason.",
        variant: "destructive",
      });
      return;
    }
    updateDepositMutation.mutate({
      id: selectedDeposit.id,
      data: {
        status: "failed",
        failureReason: failureReason,
      },
    });
  };

  const handleSaveSettings = () => {
    if (!taxPercentage || taxPercentage.trim() === "") {
      toast({
        title: "Validation error",
        description: "Tax percentage is required.",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawalFeePercentage || withdrawalFeePercentage.trim() === "") {
      toast({
        title: "Validation error",
        description: "Withdrawal fee percentage is required.",
        variant: "destructive",
      });
      return;
    }

    if (!depositFeePercentage || depositFeePercentage.trim() === "") {
      toast({
        title: "Validation error",
        description: "Deposit fee percentage is required.",
        variant: "destructive",
      });
      return;
    }

    const tax = parseFloat(taxPercentage);
    const withdrawalFee = parseFloat(withdrawalFeePercentage);
    const depositFee = parseFloat(depositFeePercentage);

    if (Number.isNaN(tax) || tax < 0 || tax > 100) {
      toast({
        title: "Validation error",
        description: "Tax percentage must be a valid number between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    if (Number.isNaN(withdrawalFee) || withdrawalFee < 0 || withdrawalFee > 100) {
      toast({
        title: "Validation error",
        description: "Withdrawal fee percentage must be a valid number between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    if (Number.isNaN(depositFee) || depositFee < 0 || depositFee > 100) {
      toast({
        title: "Validation error",
        description: "Deposit fee percentage must be a valid number between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate({
      taxPercentage: tax.toFixed(2),
      withdrawalFeePercentage: withdrawalFee.toFixed(2),
      depositFeePercentage: depositFee.toFixed(2),
      updatedBy: "admin",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financials</h1>
        <p className="text-muted-foreground mt-1">Monitor platform financial operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-deposits">
              {formatCurrency(stats.totalDeposits)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-withdrawals">
              {formatCurrency(stats.totalWithdrawals)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-withdrawals">
              {stats.pendingWithdrawals}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Deposits</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-failed-deposits">
              {stats.failedDeposits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="withdrawals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">
            Withdrawal Requests
            {stats.pendingWithdrawals > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.pendingWithdrawals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deposits" data-testid="tab-deposits">
            Deposit Requests
            {stats.failedDeposits > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.failedDeposits}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">
            <FileText className="h-4 w-4 mr-2" />
            Transaction Logs
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingWithdrawals ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading withdrawal requests...
                </div>
              ) : withdrawalRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No withdrawal requests found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalRequests.map((withdrawal) => (
                      <TableRow key={withdrawal.id} data-testid={`row-withdrawal-${withdrawal.id}`}>
                        <TableCell
                          className="font-medium"
                          data-testid={`text-user-${withdrawal.id}`}
                        >
                          {withdrawal.userId.substring(0, 8)}...
                        </TableCell>
                        <TableCell data-testid={`text-amount-${withdrawal.id}`}>
                          {formatCurrency(withdrawal.amount)}
                        </TableCell>
                        <TableCell data-testid={`text-method-${withdrawal.id}`}>
                          {withdrawal.method}
                        </TableCell>
                        <TableCell
                          className="font-mono text-sm"
                          data-testid={`text-account-${withdrawal.id}`}
                        >
                          {withdrawal.accountDetails}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              withdrawal.status === "approved"
                                ? "default"
                                : withdrawal.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            data-testid={`badge-status-${withdrawal.id}`}
                          >
                            {withdrawal.status}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-sm text-muted-foreground"
                          data-testid={`text-date-${withdrawal.id}`}
                        >
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {withdrawal.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewWithdrawal(withdrawal)}
                              data-testid={`button-review-withdrawal-${withdrawal.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDeposits ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading deposit requests...
                </div>
              ) : depositRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No deposit requests found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depositRequests.map((deposit) => (
                      <TableRow key={deposit.id} data-testid={`row-deposit-${deposit.id}`}>
                        <TableCell className="font-medium" data-testid={`text-user-${deposit.id}`}>
                          {deposit.userId.substring(0, 8)}...
                        </TableCell>
                        <TableCell data-testid={`text-amount-${deposit.id}`}>
                          {formatCurrency(deposit.amount)}
                        </TableCell>
                        <TableCell data-testid={`text-method-${deposit.id}`}>
                          {deposit.method}
                        </TableCell>
                        <TableCell
                          className="font-mono text-sm"
                          data-testid={`text-txid-${deposit.id}`}
                        >
                          {deposit.transactionId || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              deposit.status === "completed"
                                ? "default"
                                : deposit.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                            data-testid={`badge-status-${deposit.id}`}
                          >
                            {deposit.status}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-sm text-muted-foreground"
                          data-testid={`text-date-${deposit.id}`}
                        >
                          {new Date(deposit.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {deposit.status === "failed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewDeposit(deposit)}
                              data-testid={`button-review-deposit-${deposit.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Logs</CardTitle>
              <CardDescription>View all deposit and withdrawal transaction records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by transaction ID..."
                      value={txnSearchId}
                      onChange={(e) => setTxnSearchId(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-txn"
                    />
                  </div>
                  <Button
                    onClick={() => setTxnSearchQuery(txnSearchId)}
                    data-testid="button-search-txn"
                  >
                    Search
                  </Button>
                  {txnSearchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTxnSearchId("");
                        setTxnSearchQuery("");
                      }}
                      data-testid="button-clear-search"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {loadingLogs ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading transaction logs...
                  </div>
                ) : transactionLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {txnSearchQuery
                      ? "No transaction found with this ID."
                      : "No transaction logs found."}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionLogs.map((log) => (
                        <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                          <TableCell
                            className="font-mono text-sm"
                            data-testid={`text-txn-id-${log.id}`}
                          >
                            {log.transactionId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={log.type === "deposit" ? "default" : "secondary"}
                              data-testid={`badge-type-${log.id}`}
                            >
                              {log.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium" data-testid={`text-user-${log.id}`}>
                            {log.userId.substring(0, 8)}...
                          </TableCell>
                          <TableCell data-testid={`text-amount-${log.id}`}>
                            {formatCurrency(log.amount)}
                          </TableCell>
                          <TableCell data-testid={`text-fee-${log.id}`}>
                            {formatCurrency(log.fee)}
                          </TableCell>
                          <TableCell data-testid={`text-tax-${log.id}`}>
                            {formatCurrency(log.tax)}
                          </TableCell>
                          <TableCell className="font-bold" data-testid={`text-net-${log.id}`}>
                            {formatCurrency(log.netAmount)}
                          </TableCell>
                          <TableCell data-testid={`text-method-${log.id}`}>{log.method}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.status === "completed"
                                  ? "default"
                                  : log.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                              data-testid={`badge-status-${log.id}`}
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className="text-sm text-muted-foreground"
                            data-testid={`text-date-${log.id}`}
                          >
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>Configure tax percentage applied to transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSettings ? (
                  <div className="text-center py-8 text-muted-foreground">Loading settings...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
                        <Input
                          id="taxPercentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={taxPercentage}
                          onChange={(e) => setTaxPercentage(e.target.value)}
                          placeholder="0.00"
                          data-testid="input-tax-percentage"
                        />
                        <p className="text-sm text-muted-foreground">
                          Tax applied to all transactions
                        </p>
                      </div>
                      {financialSettings && (
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground mb-1">Current Tax Rate</p>
                          <p className="text-2xl font-bold" data-testid="text-current-tax">
                            {financialSettings.taxPercentage}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Fee Settings</CardTitle>
                <CardDescription>Configure fees for deposits and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSettings ? (
                  <div className="text-center py-8 text-muted-foreground">Loading settings...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="withdrawalFeePercentage">Withdrawal Fee (%)</Label>
                        <Input
                          id="withdrawalFeePercentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={withdrawalFeePercentage}
                          onChange={(e) => setWithdrawalFeePercentage(e.target.value)}
                          placeholder="0.00"
                          data-testid="input-withdrawal-fee-percentage"
                        />
                        <p className="text-sm text-muted-foreground">Fee charged on withdrawals</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="depositFeePercentage">Deposit Fee (%)</Label>
                        <Input
                          id="depositFeePercentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={depositFeePercentage}
                          onChange={(e) => setDepositFeePercentage(e.target.value)}
                          placeholder="0.00"
                          data-testid="input-deposit-fee-percentage"
                        />
                        <p className="text-sm text-muted-foreground">Fee charged on deposits</p>
                      </div>
                    </div>

                    {financialSettings && (
                      <div className="rounded-lg bg-muted p-4">
                        <h3 className="font-medium mb-3">Current Fee Rates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Withdrawal Fee</p>
                            <p
                              className="text-xl font-bold"
                              data-testid="text-current-withdrawal-fee"
                            >
                              {financialSettings.withdrawalFeePercentage}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deposit Fee</p>
                            <p className="text-xl font-bold" data-testid="text-current-deposit-fee">
                              {financialSettings.depositFeePercentage}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {financialSettings?.updatedAt && (
              <div className="text-sm text-muted-foreground text-center">
                Last updated: {new Date(financialSettings.updatedAt).toLocaleString()}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save All Settings"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Review Dialog */}
      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Withdrawal Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this withdrawal request
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="text-lg font-bold" data-testid="text-review-amount">
                    {formatCurrency(selectedWithdrawal.amount)}
                  </p>
                </div>
                <div>
                  <Label>Method</Label>
                  <p className="text-lg" data-testid="text-review-method">
                    {selectedWithdrawal.method}
                  </p>
                </div>
              </div>
              <div>
                <Label>Account Details</Label>
                <p
                  className="font-mono text-sm bg-muted p-2 rounded-md"
                  data-testid="text-review-account"
                >
                  {selectedWithdrawal.accountDetails}
                </p>
              </div>
              <div>
                <Label>User ID</Label>
                <p className="text-sm" data-testid="text-review-user">
                  {selectedWithdrawal.userId}
                </p>
              </div>
              <div>
                <Label>Request Date</Label>
                <p className="text-sm" data-testid="text-review-date">
                  {new Date(selectedWithdrawal.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason (optional)</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter reason if rejecting..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  data-testid="textarea-rejection-reason"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setWithdrawalDialogOpen(false);
                setRejectionReason("");
              }}
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectWithdrawal}
              disabled={updateWithdrawalMutation.isPending}
              data-testid="button-reject-withdrawal"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApproveWithdrawal}
              disabled={updateWithdrawalMutation.isPending}
              data-testid="button-approve-withdrawal"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Review Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Failed Deposit</DialogTitle>
            <DialogDescription>
              Review this failed deposit and take appropriate action
            </DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="text-lg font-bold" data-testid="text-review-deposit-amount">
                    {formatCurrency(selectedDeposit.amount)}
                  </p>
                </div>
                <div>
                  <Label>Method</Label>
                  <p className="text-lg" data-testid="text-review-deposit-method">
                    {selectedDeposit.method}
                  </p>
                </div>
              </div>
              <div>
                <Label>Transaction ID</Label>
                <p
                  className="font-mono text-sm bg-muted p-2 rounded-md"
                  data-testid="text-review-deposit-txid"
                >
                  {selectedDeposit.transactionId || "N/A"}
                </p>
              </div>
              {selectedDeposit.failureReason && (
                <div>
                  <Label>Failure Reason</Label>
                  <p className="text-sm text-destructive" data-testid="text-review-failure-reason">
                    {selectedDeposit.failureReason}
                  </p>
                </div>
              )}
              <div>
                <Label>User ID</Label>
                <p className="text-sm" data-testid="text-review-deposit-user">
                  {selectedDeposit.userId}
                </p>
              </div>
              <div>
                <Label>Request Date</Label>
                <p className="text-sm" data-testid="text-review-deposit-date">
                  {new Date(selectedDeposit.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="failureReason">Update Failure Reason</Label>
                <Textarea
                  id="failureReason"
                  placeholder="Enter failure reason..."
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  rows={3}
                  data-testid="textarea-failure-reason"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDepositDialogOpen(false);
                setFailureReason("");
              }}
              data-testid="button-cancel-deposit-review"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleMarkDepositFailed}
              disabled={updateDepositMutation.isPending}
              data-testid="button-mark-failed"
            >
              <X className="h-4 w-4 mr-2" />
              Mark Failed
            </Button>
            <Button
              onClick={handleRetryDeposit}
              disabled={updateDepositMutation.isPending}
              data-testid="button-retry-deposit"
            >
              <Check className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
