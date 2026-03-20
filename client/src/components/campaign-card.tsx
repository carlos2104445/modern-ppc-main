import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, MousePointerClick, Pause, Play, Trash2, MoreVertical, XCircle } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CampaignCardProps {
  id: string;
  name: string;
  type?: string;
  budget: string;
  spent: string;
  clicks: number;
  status: string;
  onViewDetails?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
}

export function CampaignCard({
  id,
  name,
  type,
  budget,
  spent,
  clicks,
  status,
  onViewDetails,
  onDelete,
  onCancel,
}: CampaignCardProps) {
  const budgetNum = parseFloat(budget.replace(/[^0-9.-]/g, ""));
  const spentNum = parseFloat(spent.replace(/[^0-9.-]/g, ""));
  const progress = budgetNum > 0 ? (spentNum / budgetNum) * 100 : 0;

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending_review: { label: "Pending Review", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
    active: { label: "Active", color: "bg-green-500/10 text-green-600 border-green-200" },
    paused: { label: "Paused", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
    completed: { label: "Completed", color: "bg-muted text-muted-foreground" },
    cancelled: { label: "Cancelled", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
    rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-200" },
  };

  const currentStatus = statusConfig[status] || { label: status, color: "bg-muted" };
  const canCancel = ["pending_review", "active", "paused"].includes(status);
  const isTerminal = ["completed", "cancelled", "rejected"].includes(status);

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
              className={currentStatus.color}
              data-testid={`badge-campaign-status-${id}`}
            >
              {currentStatus.label}
            </Badge>
            {type && (
              <Badge variant="secondary" className="text-xs">
                {type}
              </Badge>
            )}
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
            {canCancel && onCancel && (
              <DropdownMenuItem
                onClick={onCancel}
                className="text-orange-600"
                data-testid={`menu-cancel-${id}`}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel & Refund
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onDelete}
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
        {canCancel && onCancel ? (
          <Button
            variant="outline"
            className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
            onClick={onCancel}
            data-testid={`button-cancel-campaign-${id}`}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel & Refund
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1"
            disabled={isTerminal}
            data-testid={`button-toggle-campaign-${id}`}
          >
            {isTerminal ? status : status === "active" ? (
              <><Pause className="h-4 w-4 mr-2" /> Pause</>
            ) : (
              <><Play className="h-4 w-4 mr-2" /> Resume</>
            )}
          </Button>
        )}
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
