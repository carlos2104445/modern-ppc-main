import { useState } from "react";
import { SupportTicketCard } from "@/components/support-ticket-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TicketReplyDialog } from "@/components/ticket-reply-dialog";

export default function AdminTickets() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
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
    {
      id: "5",
      subject: "Payment gateway error",
      status: "in_progress" as const,
      priority: "high" as const,
      date: "1 hour ago",
      replies: 2,
    },
    {
      id: "6",
      subject: "Feature request - Dark mode",
      status: "open" as const,
      priority: "low" as const,
      date: "2 days ago",
      replies: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <p className="text-muted-foreground mt-1">Manage customer support requests</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          className="pl-9"
          data-testid="input-search-tickets"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => {
              setSelectedTicket(ticket);
              setReplyDialogOpen(true);
            }}
          >
            <SupportTicketCard {...ticket} />
          </div>
        ))}
      </div>

      {selectedTicket && (
        <TicketReplyDialog
          open={replyDialogOpen}
          onOpenChange={setReplyDialogOpen}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
}
