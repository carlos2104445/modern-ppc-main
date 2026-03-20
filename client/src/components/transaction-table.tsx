import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, ArrowUpFromLine, MousePointerClick, Users } from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "click_earning" | "referral_commission";
  amount: string;
  description: string;
  status: "completed" | "pending" | "failed";
  date: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const typeIcons = {
  deposit: ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
  click_earning: MousePointerClick,
  referral_commission: Users,
};

const statusColors = {
  completed: "bg-chart-2",
  pending: "bg-chart-4",
  failed: "bg-destructive",
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="rounded-md border border-card-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const Icon = typeIcons[transaction.type];
            const isPositive =
              transaction.type === "deposit" ||
              transaction.type === "click_earning" ||
              transaction.type === "referral_commission";

            return (
              <TableRow
                key={transaction.id}
                className="hover-elevate"
                data-testid={`row-transaction-${transaction.id}`}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize text-sm">{transaction.type.replace("_", " ")}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {transaction.description}
                </TableCell>
                <TableCell
                  className={`font-mono font-semibold ${isPositive ? "text-chart-2" : "text-destructive"}`}
                >
                  {isPositive ? "+" : "-"}
                  {transaction.amount}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[transaction.status]}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{transaction.date}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
