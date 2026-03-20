import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  balance: string;
  status: "active" | "banned" | "suspended";
  kycStatus: "pending" | "approved" | "rejected";
  joinDate: string;
}

interface UserTableProps {
  users: User[];
  onUserClick?: (user: User) => void;
}

const statusColors = {
  active: "bg-chart-2",
  banned: "bg-destructive",
  suspended: "bg-chart-4",
};

const kycColors = {
  pending: "bg-chart-4",
  approved: "bg-chart-2",
  rejected: "bg-destructive",
};

export function UserTable({ users, onUserClick }: UserTableProps) {
  return (
    <div className="rounded-md border border-card-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>KYC</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <TableRow
                key={user.id}
                className="hover-elevate cursor-pointer"
                onClick={() => onUserClick?.(user)}
                data-testid={`row-user-${user.id}`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="font-mono font-semibold">{user.balance}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[user.status]}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={kycColors[user.kycStatus]}>
                    {user.kycStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.joinDate}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-user-actions-${user.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem data-testid={`menuitem-view-details-${user.id}`}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid={`menuitem-edit-balance-${user.id}`}>
                        Edit Balance
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid={`menuitem-view-activity-${user.id}`}>
                        View Activity
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        data-testid={`menuitem-ban-user-${user.id}`}
                      >
                        Ban User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
