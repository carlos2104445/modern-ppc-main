import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Ban,
  CheckCircle,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    name: string;
    email: string;
    status: string;
    balance: string;
    joinDate: string;
    kycStatus: string;
    totalEarnings?: string;
    campaigns?: number;
    referrals?: number;
  };
  onAction?: (userId: string, action: string, newStatus?: string) => void;
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  customer,
  onAction,
}: CustomerDetailsDialogProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState(customer.status);

  useEffect(() => {
    setStatus(customer.status);
  }, [customer.id, customer.status]);

  const activityLog = [
    {
      id: "1",
      action: "Viewed 5 ads",
      amount: "+ETB 12.50",
      timestamp: "2 hours ago",
      type: "earning",
    },
    {
      id: "2",
      action: "Withdrew ETB 250",
      amount: "-ETB 250.00",
      timestamp: "1 day ago",
      type: "withdrawal",
    },
    {
      id: "3",
      action: "Created campaign 'Summer Sale'",
      timestamp: "2 days ago",
      type: "campaign",
    },
    {
      id: "4",
      action: "Deposited ETB 500",
      amount: "+ETB 500.00",
      timestamp: "3 days ago",
      type: "deposit",
    },
    {
      id: "5",
      action: "Referred new user",
      amount: "+ETB 25.00",
      timestamp: "4 days ago",
      type: "referral",
    },
    { id: "6", action: "Updated profile", timestamp: "5 days ago", type: "profile" },
  ];

  const transactions = [
    {
      id: "1",
      type: "deposit",
      description: "Bank Transfer",
      amount: "+ETB 500.00",
      status: "completed",
      date: "2024-01-10 14:30",
    },
    {
      id: "2",
      type: "withdrawal",
      description: "Bank Transfer",
      amount: "-ETB 250.00",
      status: "completed",
      date: "2024-01-12 09:15",
    },
    {
      id: "3",
      type: "earning",
      description: "Ad View - YouTube Campaign",
      amount: "+ETB 2.50",
      status: "completed",
      date: "2024-01-13 16:45",
    },
    {
      id: "4",
      type: "earning",
      description: "Referral Commission",
      amount: "+ETB 25.00",
      status: "completed",
      date: "2024-01-14 11:20",
    },
    {
      id: "5",
      type: "withdrawal",
      description: "Bank Transfer",
      amount: "-ETB 100.00",
      status: "pending",
      date: "2024-01-15 10:00",
    },
  ];

  const campaigns = [
    { id: "1", name: "Summer Sale Campaign", status: "active", spent: "ETB 287.50", clicks: 1250 },
    { id: "2", name: "Product Launch", status: "paused", spent: "ETB 150.00", clicks: 680 },
    { id: "3", name: "Brand Awareness", status: "completed", spent: "ETB 500.00", clicks: 2400 },
  ];

  const handleStatusChange = () => {
    if (onAction) {
      onAction(customer.id, "updateStatus", status);
    }
    toast({
      title: "Status updated",
      description: `Customer status changed to ${status}.`,
    });
    onOpenChange(false);
  };

  const handleSuspend = () => {
    const newStatus = "suspended";
    setStatus(newStatus);
    if (onAction) {
      onAction(customer.id, "updateStatus", newStatus);
    }
    toast({
      title: "Customer suspended",
      description: `${customer.name} has been suspended.`,
      variant: "destructive",
    });
    onOpenChange(false);
  };

  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={customer.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p>{customer.name}</p>
              <p className="text-sm font-normal text-muted-foreground">{customer.email}</p>
            </div>
          </DialogTitle>
          <DialogDescription>View and manage customer details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold" data-testid="text-customer-balance">
                    {customer.balance}
                  </p>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p
                    className="text-xl font-bold text-chart-2"
                    data-testid="text-customer-earnings"
                  >
                    {customer.totalEarnings || "ETB 0.00"}
                  </p>
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold" data-testid="text-customer-campaigns">
                    {customer.campaigns || 0}
                  </p>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold" data-testid="text-customer-referrals">
                    {customer.referrals || 0}
                  </p>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status and KYC Badges */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Status:</p>
              <Badge
                variant="outline"
                className={
                  customer.status === "active"
                    ? "bg-chart-2"
                    : customer.status === "suspended"
                      ? "bg-chart-4"
                      : "bg-destructive"
                }
                data-testid="badge-customer-status"
              >
                {customer.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">KYC:</p>
              <Badge
                variant="outline"
                className={
                  customer.kycStatus === "approved"
                    ? "bg-chart-2"
                    : customer.kycStatus === "pending"
                      ? "bg-chart-4"
                      : "bg-destructive"
                }
                data-testid="badge-customer-kyc"
              >
                {customer.kycStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Joined:</p>
              <p className="text-sm font-medium" data-testid="text-customer-joined">
                {customer.joinDate}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity" data-testid="tab-activity">
                Activity
              </TabsTrigger>
              <TabsTrigger value="transactions" data-testid="tab-transactions">
                Transactions
              </TabsTrigger>
              <TabsTrigger value="campaigns" data-testid="tab-campaigns">
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {activityLog.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg border border-card-border hover-elevate"
                      data-testid={`activity-${log.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground mt-1">{log.timestamp}</p>
                        </div>
                        {log.amount && (
                          <Badge
                            variant="outline"
                            className={
                              log.amount.startsWith("+")
                                ? "bg-chart-2/10 text-chart-2"
                                : "bg-chart-1/10 text-chart-1"
                            }
                          >
                            {log.amount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-lg border border-card-border hover-elevate"
                      data-testid={`transaction-${tx.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {tx.type === "deposit" || tx.type === "earning" ? (
                              <ArrowDownRight className="h-4 w-4 text-chart-2" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-chart-1" />
                            )}
                            <p className="text-sm font-medium capitalize">{tx.type}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{tx.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${tx.amount.startsWith("+") ? "text-chart-2" : "text-chart-1"}`}
                          >
                            {tx.amount}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="campaigns" className="mt-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-3 rounded-lg border border-card-border hover-elevate"
                      data-testid={`campaign-${campaign.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{campaign.name}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge
                              variant="outline"
                              className={
                                campaign.status === "active"
                                  ? "bg-chart-2"
                                  : campaign.status === "paused"
                                    ? "bg-chart-4"
                                    : "bg-muted"
                              }
                            >
                              {campaign.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {campaign.clicks} clicks
                            </span>
                          </div>
                        </div>
                        <p className="font-bold">{campaign.spent}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="customer-status">Account Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="customer-status" data-testid="select-customer-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleStatusChange}
                className="w-full"
                data-testid="button-update-status"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-customer"
            >
              Close
            </Button>
            {customer.status === "active" && (
              <Button
                variant="outline"
                className="text-destructive border-destructive"
                onClick={handleSuspend}
                data-testid="button-suspend-customer"
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspend Account
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
