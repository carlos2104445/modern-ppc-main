import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus } from "lucide-react";
import { EmailComposerDialog } from "@/components/email-composer-dialog";

export default function AdminCommunications() {
  const [composerOpen, setComposerOpen] = useState(false);

  const recentCommunications = [
    {
      id: "1",
      subject: "Platform Maintenance Notice",
      audience: "All Users",
      sentDate: "2024-01-15 10:00 AM",
      status: "sent",
      recipients: 12453,
    },
    {
      id: "2",
      subject: "New Feature Announcement",
      audience: "Premium Members",
      sentDate: "2024-01-12 02:30 PM",
      status: "sent",
      recipients: 3456,
    },
    {
      id: "3",
      subject: "Referral Program Update",
      audience: "Active Earners",
      sentDate: "2024-01-10 09:15 AM",
      status: "sent",
      recipients: 8234,
    },
  ];

  const statusColors = {
    sent: "bg-chart-2",
    scheduled: "bg-chart-4",
    draft: "bg-muted",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communications Manager</h1>
          <p className="text-muted-foreground mt-1">Send messages and notifications to users</p>
        </div>
        <Button onClick={() => setComposerOpen(true)} data-testid="button-compose-email">
          <Plus className="h-4 w-4 mr-2" />
          Compose Email
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentCommunications.map((comm) => (
                <div
                  key={comm.id}
                  className="p-3 rounded-lg border border-card-border hover-elevate"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{comm.subject}</h4>
                    <Badge
                      variant="outline"
                      className={statusColors[comm.status as keyof typeof statusColors]}
                    >
                      {comm.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{comm.audience}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{comm.recipients.toLocaleString()} recipients</span>
                    <span>{comm.sentDate}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <EmailComposerDialog open={composerOpen} onOpenChange={setComposerOpen} />
    </div>
  );
}
