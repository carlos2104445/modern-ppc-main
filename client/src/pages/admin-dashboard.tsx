import { StatCard } from "@/components/stat-card";
import { ActivityLog } from "@/components/activity-log";
import { MaintenanceModeToggle } from "@/components/maintenance-mode-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const alerts = [
    { id: "1", type: "KYC", message: "15 pending KYC verifications", count: 15 },
    { id: "2", type: "Withdrawal", message: "8 withdrawal requests pending", count: 8 },
    { id: "3", type: "Ads", message: "23 ads awaiting approval", count: 23 },
    { id: "4", type: "Support", message: "12 open support tickets", count: 12 },
  ];

  const recentActivities = [
    {
      id: "1",
      user: "John Doe",
      action: "Registered new account",
      timestamp: "2 minutes ago",
      type: "user" as const,
    },
    {
      id: "2",
      user: "Admin User",
      action: "Approved KYC for Jane Smith",
      timestamp: "15 minutes ago",
      type: "admin" as const,
    },
    {
      id: "3",
      user: "System",
      action: "Processed 25 ad clicks",
      timestamp: "30 minutes ago",
      type: "system" as const,
    },
    {
      id: "4",
      user: "Bob Johnson",
      action: "Created new ad campaign",
      timestamp: "1 hour ago",
      type: "user" as const,
    },
    {
      id: "5",
      user: "Admin User",
      action: "Processed withdrawal for Sarah Lee",
      timestamp: "2 hours ago",
      type: "admin" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and pending actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="12,453"
          description="Active users"
          icon={Users}
          trend={{ value: "8.2%", isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value="ETB 45,678"
          description="This month"
          icon={DollarSign}
          trend={{ value: "12.5%", isPositive: true }}
        />
        <StatCard
          title="Total Deposits"
          value="ETB 89,234"
          description="All time"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Campaigns"
          value="342"
          description="Running now"
          icon={AlertCircle}
        />
      </div>

      <MaintenanceModeToggle />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg border border-card-border hover-elevate"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-chart-4">
                    {alert.count}
                  </Badge>
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={`button-view-${alert.type.toLowerCase()}`}
                >
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              data-testid="button-manage-users"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              data-testid="button-approve-kyc"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Review KYC Submissions
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              data-testid="button-process-withdrawals"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Process Withdrawals
            </Button>
          </CardContent>
        </Card>
      </div>

      <ActivityLog activities={recentActivities} title="Recent Platform Activity" />
    </div>
  );
}
