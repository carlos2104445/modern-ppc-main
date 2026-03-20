import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface SupportTicketCardProps {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  date: string;
  replies: number;
}

const statusColors = {
  open: "bg-chart-4",
  in_progress: "bg-primary",
  resolved: "bg-chart-2",
};

const priorityColors = {
  low: "bg-muted",
  medium: "bg-chart-4",
  high: "bg-destructive",
};

export function SupportTicketCard({
  id,
  subject,
  status,
  priority,
  date,
  replies,
}: SupportTicketCardProps) {
  return (
    <Card className="hover-elevate cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base" data-testid={`text-ticket-subject-${id}`}>
            {subject}
          </CardTitle>
          <div className="flex gap-2 shrink-0">
            <Badge variant="outline" className={statusColors[status]}>
              {status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className={priorityColors[priority]}>
              {priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{replies} replies</span>
          </div>
          <span className="text-muted-foreground">{date}</span>
        </div>
        <Button variant="outline" className="w-full" data-testid={`button-view-ticket-${id}`}>
          View Conversation
        </Button>
      </CardContent>
    </Card>
  );
}
