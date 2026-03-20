import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Link as LinkIcon,
  Youtube,
  Image as ImageIcon,
  DollarSign,
  MousePointerClick,
  Eye,
  Calendar,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";

interface CampaignDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: {
    id: string;
    name: string;
    type: "link" | "youtube" | "banner";
    budget: string;
    spent: string;
    clicks: number;
    status: "active" | "paused" | "completed";
  };
}

export function CampaignDetailsDialog({
  open,
  onOpenChange,
  campaign,
}: CampaignDetailsDialogProps) {
  const budgetNum = parseFloat(campaign.budget.replace(/[^0-9.-]/g, ""));
  const spentNum = parseFloat(campaign.spent.replace(/[^0-9.-]/g, ""));
  const progress = budgetNum > 0 ? (spentNum / budgetNum) * 100 : 0;

  const typeIcons = {
    link: LinkIcon,
    youtube: Youtube,
    banner: ImageIcon,
  };

  const TypeIcon = typeIcons[campaign.type];

  const statusColors = {
    active: "bg-chart-2/20 text-chart-2",
    paused: "bg-chart-4/20 text-chart-4",
    completed: "bg-muted text-muted-foreground",
  };

  // Mock data for detailed stats
  const detailedStats = {
    impressions: 15420,
    ctr: "8.1%",
    avgCpc: "ETB 0.23",
    conversions: 89,
    conversionRate: "7.1%",
    roi: "245%",
  };

  const performanceData = [
    { label: "Impressions", value: detailedStats.impressions.toLocaleString(), icon: Eye },
    { label: "Clicks", value: campaign.clicks.toLocaleString(), icon: MousePointerClick },
    { label: "CTR", value: detailedStats.ctr, icon: TrendingUp },
    { label: "Avg CPC", value: detailedStats.avgCpc, icon: DollarSign },
    { label: "Conversions", value: detailedStats.conversions.toString(), icon: Target },
    { label: "Conv. Rate", value: detailedStats.conversionRate, icon: Users },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl" data-testid="text-campaign-detail-name">
                {campaign.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <TypeIcon className="h-4 w-4" />
                <span className="capitalize">{campaign.type} Campaign</span>
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={statusColors[campaign.status]}
              data-testid="badge-campaign-detail-status"
            >
              {campaign.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-2xl font-bold" data-testid="text-campaign-detail-budget">
                      {campaign.budget}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="text-2xl font-bold" data-testid="text-campaign-detail-spent">
                      {campaign.spent}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold" data-testid="text-campaign-detail-remaining">
                      ETB {(budgetNum - spentNum).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Budget Usage</p>
                    <p className="text-sm font-medium" data-testid="text-campaign-detail-progress">
                      {progress.toFixed(1)}%
                    </p>
                  </div>
                  <Progress value={progress} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {performanceData.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p
                            className="text-xl font-bold mt-1"
                            data-testid={`text-metric-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {stat.value}
                          </p>
                        </div>
                        <Icon className="h-8 w-8 text-muted-foreground opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ROI Highlight */}
          <Card className="bg-chart-2/10 border-chart-2/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Return on Investment</p>
                  <p
                    className="text-3xl font-bold text-chart-2 mt-1"
                    data-testid="text-campaign-detail-roi"
                  >
                    {detailedStats.roi}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-chart-2" />
              </div>
            </CardContent>
          </Card>

          {/* Campaign Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Campaign Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Campaign Type</span>
                <span
                  className="text-sm font-medium capitalize"
                  data-testid="text-campaign-detail-type"
                >
                  {campaign.type}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Cost Per Click</span>
                <span className="text-sm font-medium" data-testid="text-campaign-detail-cpc">
                  {detailedStats.avgCpc}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Target Audience</span>
                <span className="text-sm font-medium" data-testid="text-campaign-detail-audience">
                  All Users
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Duration</span>
                <span className="text-sm font-medium" data-testid="text-campaign-detail-duration">
                  30 Days
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => console.log("Edit campaign:", campaign.id)}
              data-testid="button-edit-campaign-detail"
            >
              Edit Campaign
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-campaign-detail"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
