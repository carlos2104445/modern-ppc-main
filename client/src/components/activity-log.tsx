import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: "user" | "admin" | "system";
}

interface ActivityLogProps {
  activities: Activity[];
  title?: string;
}

export function ActivityLog({ activities, title = "Recent Activity" }: ActivityLogProps) {
  const typeColors = {
    user: "bg-primary",
    admin: "bg-chart-3",
    system: "bg-muted",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between p-3 rounded-lg border border-card-border hover-elevate"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={typeColors[activity.type]}>
                    {activity.type}
                  </Badge>
                  <span className="text-sm font-medium">{activity.user}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
