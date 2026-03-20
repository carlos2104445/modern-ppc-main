import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Clock, Eye } from "lucide-react";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { DataTable, Column } from "@/components/data-table";
import { DateRangePicker } from "@/components/date-range-picker";
import { ExportButtons } from "@/components/export-buttons";
import { BulkActions, BulkSelectCheckbox } from "@/components/bulk-actions";
import { CustomerDetailsDialog } from "@/components/customer-details-dialog";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

interface Customer {
  id: string;
  name: string;
  email: string;
  balance: string;
  status: "active" | "suspended" | "banned";
  kycStatus: "pending" | "approved" | "rejected";
  joinDate: string;
  totalEarnings: string;
  campaigns: number;
  referrals: number;
}

export default function AdminCustomersEnhanced() {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [customers] = useState<Customer[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      balance: "ETB 1,234.56",
      status: "active",
      kycStatus: "approved",
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
      status: "active",
      kycStatus: "pending",
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
      status: "suspended",
      kycStatus: "rejected",
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
      status: "active",
      kycStatus: "approved",
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
      status: "active",
      kycStatus: "pending",
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
      status: "active",
      kycStatus: "approved",
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
      status: "banned",
      kycStatus: "rejected",
      joinDate: "2024-01-15",
      totalEarnings: "ETB 345.21",
      campaigns: 0,
      referrals: 0,
    },
  ]);

  const stats = {
    total: customers.length,
    active: customers.filter((u) => u.status === "active").length,
    suspended: customers.filter((u) => u.status === "suspended").length,
    pendingKyc: customers.filter((u) => u.kycStatus === "pending").length,
  };

  const columns: Column<Customer>[] = [
    {
      key: "select",
      label: "",
      render: (customer) => (
        <BulkSelectCheckbox
          id={customer.id}
          checked={selectedIds.includes(customer.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedIds((prev) => [...prev, customer.id]);
            } else {
              setSelectedIds((prev) => prev.filter((id) => id !== customer.id));
            }
          }}
        />
      ),
    },
    {
      key: "name",
      label: "Customer",
      sortable: true,
      render: (customer) => (
        <div>
          <div className="font-medium">{customer.name}</div>
          <div className="text-sm text-muted-foreground">{customer.email}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (customer) => (
        <Badge
          variant={
            customer.status === "active"
              ? "default"
              : customer.status === "suspended"
                ? "secondary"
                : "destructive"
          }
        >
          {customer.status}
        </Badge>
      ),
    },
    {
      key: "kycStatus",
      label: "KYC",
      sortable: true,
      render: (customer) => (
        <Badge
          variant={
            customer.kycStatus === "approved"
              ? "default"
              : customer.kycStatus === "pending"
                ? "secondary"
                : "destructive"
          }
        >
          {customer.kycStatus}
        </Badge>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
    },
    {
      key: "totalEarnings",
      label: "Total Earnings",
      sortable: true,
    },
    {
      key: "joinDate",
      label: "Join Date",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (customer) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedCustomer(customer);
            setDetailsDialogOpen(true);
          }}
          data-testid={`button-view-details-${customer.id}`}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
      ),
    },
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(customers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleExportCSV = () => {
    toast({
      title: "Exporting to CSV",
      description: "Your customer data is being exported...",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Exporting to PDF",
      description: "Your customer report is being generated...",
    });
  };

  const bulkActions = [
    {
      label: "Activate Selected",
      onClick: (ids: string[]) => {
        toast({
          title: "Users activated",
          description: `${ids.length} users have been activated.`,
        });
        setSelectedIds([]);
      },
    },
    {
      label: "Suspend Selected",
      onClick: (ids: string[]) => {
        toast({
          title: "Users suspended",
          description: `${ids.length} users have been suspended.`,
        });
        setSelectedIds([]);
      },
    },
    {
      label: "Delete Selected",
      onClick: (ids: string[]) => {
        toast({
          title: "Users deleted",
          description: `${ids.length} users have been deleted.`,
          variant: "destructive",
        });
        setSelectedIds([]);
      },
      variant: "destructive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <BreadcrumbNav items={[{ label: "Customers" }]} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all platform customers</p>
        </div>
        <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingKyc}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Filter by join date"
            className="w-80"
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <BulkActions
        selectedIds={selectedIds}
        totalCount={customers.length}
        onSelectAll={handleSelectAll}
        actions={bulkActions}
      />

      {/* Data Table */}
      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Search customers by name or email..."
        pageSize={10}
      />

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <CustomerDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          customer={selectedCustomer}
          onAction={(userId, action, newStatus) => {
            toast({
              title: "Action completed",
              description: `Customer ${action} successfully.`,
            });
          }}
        />
      )}
    </div>
  );
}
