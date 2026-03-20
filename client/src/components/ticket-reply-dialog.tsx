import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: {
    id: string;
    subject: string;
    status: "open" | "in_progress" | "resolved";
    priority: "low" | "medium" | "high";
    date: string;
    replies: number;
  };
}

export function TicketReplyDialog({ open, onOpenChange, ticket }: TicketReplyDialogProps) {
  const { toast } = useToast();
  const [reply, setReply] = useState("");
  const [newStatus, setNewStatus] = useState(ticket.status);

  const conversationHistory = [
    {
      id: "1",
      sender: "User",
      message: ticket.subject,
      timestamp: ticket.date,
      isAdmin: false,
    },
    {
      id: "2",
      sender: "Support Agent",
      message: "Thank you for contacting us. We're looking into this issue.",
      timestamp: "2 hours ago",
      isAdmin: true,
    },
  ];

  const handleSendReply = () => {
    if (!reply.trim()) {
      toast({
        title: "Reply required",
        description: "Please enter a reply message.",
        variant: "destructive",
      });
      return;
    }

    console.log("Sending reply:", { ticketId: ticket.id, reply, newStatus });
    toast({
      title: "Reply sent",
      description: "Your reply has been sent to the user.",
    });
    setReply("");
    onOpenChange(false);
  };

  const handleResolve = () => {
    console.log("Resolving ticket:", ticket.id);
    toast({
      title: "Ticket resolved",
      description: "This support ticket has been marked as resolved.",
    });
    onOpenChange(false);
  };

  const priorityColors = {
    low: "bg-muted",
    medium: "bg-chart-4",
    high: "bg-destructive",
  };

  const statusColors = {
    open: "bg-chart-4",
    in_progress: "bg-primary",
    resolved: "bg-chart-2",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Ticket #{ticket.id}: {ticket.subject}
          </DialogTitle>
          <DialogDescription>View conversation and reply to customer</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Badge variant="outline" className={statusColors[ticket.status]}>
              {ticket.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className={priorityColors[ticket.priority]}>
              {ticket.priority} priority
            </Badge>
            <span className="text-sm text-muted-foreground ml-auto">{ticket.date}</span>
          </div>

          {/* Conversation History */}
          <div className="space-y-3">
            <h3 className="font-semibold">Conversation</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {conversationHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    msg.isAdmin ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                placeholder="Type your response to the customer..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                data-testid="textarea-ticket-reply"
              />
            </div>

            <div>
              <Label htmlFor="status">Update Status</Label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger id="status" data-testid="select-ticket-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-reply"
            >
              Cancel
            </Button>
            {ticket.status !== "resolved" && (
              <Button
                variant="outline"
                className="text-chart-2 border-chart-2"
                onClick={handleResolve}
                data-testid="button-resolve-ticket"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            )}
            <Button onClick={handleSendReply} data-testid="button-send-reply">
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
