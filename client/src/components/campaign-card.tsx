import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, MousePointerClick, Pause, Play, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface CampaignCardProps {
  id: string;
  name: string;
  budget: string;
  spent: string;
  clicks: number;
  status: "active" | "paused" | "completed";
  onViewDetails?: () => void;
  onDelete?: () => void;
}

export function CampaignCard({
  id,
  name,
  budget,
  spent,
  clicks,
  status: initialStatus,
  onViewDetails,
  onDelete,
}: CampaignCardProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState(initialStatus);

  const budgetNum = parseFloat(budget.replace(/[^0-9.-]/g, ""));
  const spentNum = parseFloat(spent.replace(/[^0-9.-]/g, ""));
  const progress = budgetNum > 0 ? (spentNum / budgetNum) * 100 : 0;

  const handleToggle = () => {
    const newStatus = status === "active" ? "paused" : "active";
    setStatus(newStatus);
    toast({
      title: `Campaign ${newStatus}`,
      description: `"${name}" has been ${newStatus}`,
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      toast({
        title: "Campaign deleted",
        description: `"${name}" has been removed`,
        variant: "destructive",
      });
    }
  };

  const statusColors = {
    active: "bg-chart-2",
    paused: "bg-chart-4",
    completed: "bg-muted",
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg" data-testid={`text-campaign-name-${id}`}>
            {name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={statusColors[status]}
              data-testid={`badge-campaign-status-${id}`}
            >
              {status}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-campaign-menu-${id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewDetails} data-testid={`menu-view-details-${id}`}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
              data-testid={`menu-delete-${id}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {budget}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="text-lg font-semibold">{spent}</p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Budget Used</p>
            <p className="text-xs font-medium">{progress.toFixed(1)}%</p>
          </div>
          <Progress value={progress} />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          <span>{clicks} clicks</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleToggle}
          disabled={status === "completed"}
          data-testid={`button-toggle-campaign-${id}`}
        >
          {status === "active" ? (
            <Pause className="h-4 w-4 mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {status === "active" ? "Pause" : "Resume"}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onViewDetails}
          data-testid={`button-view-campaign-${id}`}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
