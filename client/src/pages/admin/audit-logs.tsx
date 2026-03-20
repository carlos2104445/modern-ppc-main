import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Shield } from "lucide-react";
import { AuditLog } from "@shared/schema";
import { CardSkeletonLoader } from "@/components/skeleton-loader";
import { EmptyState } from "@/components/empty-state";
import { formatDistanceToNow } from "date-fns";

export default function AdminAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit-logs"],
  });

  const filteredLogs =
    logs?.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesResource = resourceFilter === "all" || log.resource === resourceFilter;
      const matchesAction = actionFilter === "all" || log.action === actionFilter;

      return matchesSearch && matchesResource && matchesAction;
    }) || [];

  const resources = Array.from(new Set(logs?.map((log) => log.resource) || []));
  const actions = Array.from(new Set(logs?.map((log) => log.action) || []));

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("create") || action.includes("add")) return "default";
    if (action.includes("update") || action.includes("edit")) return "secondary";
    if (action.includes("delete") || action.includes("remove")) return "destructive";
    return "outline";
  };

  const exportToCSV = () => {
    if (!filteredLogs.length) return;

    const headers = [
      "Timestamp",
      "Admin",
      "Action",
      "Resource",
      "Resource ID",
      "Details",
      "IP Address",
    ];
    const rows = filteredLogs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.adminEmail,
      log.action,
      log.resource,
      log.resourceId || "",
      log.details || "",
      log.ipAddress || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <CardSkeletonLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="text-page-description">
            Track all administrative actions and system changes
          </p>
        </div>
        <Button
          onClick={exportToCSV}
          variant="outline"
          data-testid="button-export-csv"
          disabled={!filteredLogs.length}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger data-testid="select-resource-filter">
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {resources.map((resource) => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger data-testid="select-action-filter">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No audit logs found"
          description={
            searchQuery || resourceFilter !== "all" || actionFilter !== "all"
              ? "Try adjusting your filters to see more results"
              : "Admin actions will appear here once they are performed"
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                      <TableCell
                        className="whitespace-nowrap"
                        data-testid={`text-timestamp-${log.id}`}
                      >
                        <div className="text-sm">{new Date(log.createdAt).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-admin-${log.id}`}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {log.adminEmail}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`badge-action-${log.id}`}>
                        <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                      </TableCell>
                      <TableCell data-testid={`text-resource-${log.id}`}>
                        <div className="font-medium">{log.resource}</div>
                        {log.resourceId && (
                          <div className="text-xs text-muted-foreground">ID: {log.resourceId}</div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md" data-testid={`text-details-${log.id}`}>
                        <div className="truncate text-sm text-muted-foreground">
                          {log.details || "—"}
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-sm text-muted-foreground"
                        data-testid={`text-ip-${log.id}`}
                      >
                        {log.ipAddress || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span data-testid="text-total-count">
          Showing {filteredLogs.length} of {logs?.length || 0} logs
        </span>
        {(searchQuery || resourceFilter !== "all" || actionFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setResourceFilter("all");
              setActionFilter("all");
            }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
