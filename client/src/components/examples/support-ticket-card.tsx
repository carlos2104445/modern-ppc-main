import { SupportTicketCard } from "../support-ticket-card";

export default function SupportTicketCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <SupportTicketCard
        id="1"
        subject="Withdrawal not processed"
        status="in_progress"
        priority="high"
        date="2 hours ago"
        replies={3}
      />
      <SupportTicketCard
        id="2"
        subject="Question about referral commissions"
        status="open"
        priority="medium"
        date="1 day ago"
        replies={0}
      />
      <SupportTicketCard
        id="3"
        subject="Ad approval status"
        status="resolved"
        priority="low"
        date="3 days ago"
        replies={5}
      />
    </div>
  );
}
