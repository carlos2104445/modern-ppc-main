import { useState } from "react";
import { SupportTicketCard } from "@/components/support-ticket-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle, Clock, CheckCircle } from "lucide-react";
import { CreateTicketDialog } from "@/components/create-ticket-dialog";

export default function Support() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const tickets = [
    {
      id: "1",
      subject: "Withdrawal not processed",
      status: "in_progress" as const,
      priority: "high" as const,
      date: "2 hours ago",
      replies: 3,
    },
    {
      id: "2",
      subject: "Question about referral commissions",
      status: "open" as const,
      priority: "medium" as const,
      date: "1 day ago",
      replies: 0,
    },
    {
      id: "3",
      subject: "Ad approval status",
      status: "resolved" as const,
      priority: "low" as const,
      date: "3 days ago",
      replies: 5,
    },
    {
      id: "4",
      subject: "Account verification issue",
      status: "open" as const,
      priority: "high" as const,
      date: "5 hours ago",
      replies: 1,
    },
  ];

  const stats = [
    {
      title: "Open Tickets",
      value: tickets
        .filter((t) => t.status === "open" || t.status === "in_progress")
        .length.toString(),
      icon: HelpCircle,
      color: "text-chart-4",
    },
    {
      title: "In Progress",
      value: tickets.filter((t) => t.status === "in_progress").length.toString(),
      icon: Clock,
      color: "text-chart-3",
    },
    {
      title: "Resolved",
      value: tickets.filter((t) => t.status === "resolved").length.toString(),
      icon: CheckCircle,
      color: "text-chart-2",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground mt-1">
            Get help with your account and platform issues
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-ticket">
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tickets Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Tickets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <SupportTicketCard key={ticket.id} {...ticket} />
          ))}
        </div>
      </div>

      <CreateTicketDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
