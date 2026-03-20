import { useState, useMemo } from "react";
import { UserTable } from "@/components/user-table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, UserCheck, UserX, Clock } from "lucide-react";
import { CustomerDetailsDialog } from "@/components/customer-details-dialog";

export default function AdminCustomers() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "banned">(
    "all"
  );
  const [kycFilter, setKycFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const [users, setUsers] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      balance: "ETB 1,234.56",
      status: "active" as const,
      kycStatus: "approved" as const,
      joinDate: "2024-01-10",
      totalEarnings: "ETB 5,420.00",
      campaigns: 3,
      referrals: 12,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      balance: "ETB 567.89",
      status: "active" as const,
      kycStatus: "pending" as const,
      joinDate: "2024-01-12",
      totalEarnings: "ETB 1,890.50",
      campaigns: 1,
      referrals: 5,
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.j@example.com",
      balance: "ETB 0.00",
      status: "suspended" as const,
      kycStatus: "rejected" as const,
      joinDate: "2024-01-08",
      totalEarnings: "ETB 250.00",
      campaigns: 0,
      referrals: 2,
    },
    {
      id: "4",
      name: "Alice Williams",
      email: "alice.w@example.com",
      balance: "ETB 2,345.67",
      status: "active" as const,
      kycStatus: "approved" as const,
      joinDate: "2024-01-05",
      totalEarnings: "ETB 8,920.30",
      campaigns: 5,
      referrals: 28,
    },
    {
      id: "5",
      name: "Charlie Davis",
      email: "charlie.d@example.com",
      balance: "ETB 890.12",
      status: "active" as const,
      kycStatus: "pending" as const,
      joinDate: "2024-01-14",
      totalEarnings: "ETB 3,240.75",
      campaigns: 2,
      referrals: 8,
    },
    {
      id: "6",
      name: "Emma Wilson",
      email: "emma.w@example.com",
      balance: "ETB 1,567.89",
      status: "active" as const,
      kycStatus: "approved" as const,
      joinDate: "2024-01-03",
      totalEarnings: "ETB 6,780.45",
      campaigns: 4,
      referrals: 15,
    },
    {
      id: "7",
      name: "Michael Brown",
      email: "mike.b@example.com",
      balance: "ETB 345.21",
      status: "banned" as const,
      kycStatus: "rejected" as const,
      joinDate: "2024-01-15",
      totalEarnings: "ETB 345.21",
      campaigns: 0,
      referrals: 0,
    },
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesKyc = kycFilter === "all" || user.kycStatus === kycFilter;
      return matchesSearch && matchesStatus && matchesKyc;
    });
  }, [users, searchQuery, statusFilter, kycFilter]);

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    pendingKyc: users.filter((u) => u.kycStatus === "pending").length,
  };

  const handleUserAction = (userId: string, action: string, newStatus?: string) => {
    if (action === "updateStatus" && newStatus) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus as any } : u))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all platform users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className="hover-elevate cursor-pointer"
          onClick={() => setStatusFilter("all")}
          data-testid="card-total-users"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">
              {stats.total}
            </div>
          </CardContent>
        </Card>
        <Card
          className="hover-elevate cursor-pointer"
          onClick={() => setStatusFilter("active")}
          data-testid="card-active-users"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2" data-testid="text-active-users">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card
          className="hover-elevate cursor-pointer"
          onClick={() => setStatusFilter("suspended")}
          data-testid="card-suspended-users"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4" data-testid="text-suspended-users">
              {stats.suspended}
            </div>
          </CardContent>
        </Card>
        <Card
          className="hover-elevate cursor-pointer"
          onClick={() => setKycFilter("pending")}
          data-testid="card-pending-kyc"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4" data-testid="text-pending-kyc">
              {stats.pendingKyc}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-users"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={kycFilter} onValueChange={(value) => setKycFilter(value as any)}>
          <SelectTrigger className="w-[180px]" data-testid="select-kyc-filter">
            <SelectValue placeholder="KYC Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All KYC</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" data-testid="text-users-count">
          Showing {filteredUsers.length} of {stats.total} users
        </p>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        onUserClick={(user) => {
          setSelectedCustomer(user);
          setDetailsDialogOpen(true);
        }}
      />

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <CustomerDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          customer={selectedCustomer}
          onAction={handleUserAction}
        />
      )}
    </div>
  );
}
