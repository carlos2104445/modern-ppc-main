import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChapaPaymentDialog } from "@/components/chapa-payment-dialog";
import apiClient from "@/lib/api-client";

interface ChapaPayment {
  id: string;
  txRef: string;
  amount: string;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  chapaReference: string | null;
  paymentMethod: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function ChapaPayments() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<ChapaPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const mockUser = {
    id: "user-001",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+251911000000",
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/chapa/payments", { showErrorToast: false });
      setPayments(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      pending: "secondary",
      failed: "destructive",
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chapa Payments</h1>
        <p className="text-muted-foreground">Manage and track your Chapa payment transactions</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Payment Transactions
              </CardTitle>
              <CardDescription>View all your Chapa payment transactions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setShowPaymentDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Payment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments found. Start by making your first payment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Ref</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">{payment.txRef}</TableCell>
                      <TableCell className="font-semibold">
                        {payment.amount} {payment.currency}
                      </TableCell>
                      <TableCell>{payment.email}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{payment.paymentMethod || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.completedAt ? formatDate(payment.completedAt) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ChapaPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        userId={mockUser.id}
        userEmail={mockUser.email}
        userFirstName={mockUser.firstName}
        userLastName={mockUser.lastName}
        userPhoneNumber={mockUser.phoneNumber}
      />
    </div>
  );
}
