import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  DollarSign,
  AlertTriangle,
  Eye,
} from "lucide-react";

interface CampaignAnalytics {
  campaignId: string;
  totalViews: number;
  completedViews: number;
  clickedViews: number;
  rewardsClaimed: number;
  flaggedViews: number;
  totalRewards: string;
  completionRate: string;
  clickThroughRate: string;
  fraudRate: string;
  avgFraudScore: string;
}

interface UserAnalytics {
  userId: string;
  totalViews: number;
  completedViews: number;
  clickedViews: number;
  rewardsClaimed: number;
  flaggedViews: number;
  totalEarnings: string;
  avgFraudScore: string;
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [campaignId, setCampaignId] = useState("");
  const [userId, setUserId] = useState("");
  const [campaignAnalytics, setCampaignAnalytics] = useState<CampaignAnalytics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const fetchCampaignAnalytics = async () => {
    if (!campaignId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign ID",
        variant: "destructive",
      });
      return;
    }

    setLoadingCampaign(true);
    try {
      const response = await fetch(`/api/analytics/campaign/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setCampaignAnalytics(data);
      } else {
        throw new Error("Failed to fetch campaign analytics");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch campaign analytics",
        variant: "destructive",
      });
    } finally {
      setLoadingCampaign(false);
    }
  };

  const fetchUserAnalytics = async () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setLoadingUser(true);
    try {
      const response = await fetch(`/api/analytics/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserAnalytics(data);
      } else {
        throw new Error("Failed to fetch user analytics");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user analytics",
        variant: "destructive",
      });
    } finally {
      setLoadingUser(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ad View Analytics</h1>
          <p className="text-muted-foreground">
            Detailed metrics and insights for campaigns and users
          </p>
        </div>
        <BarChart3 className="h-12 w-12 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Analytics</CardTitle>
          <CardDescription>
            View detailed performance metrics for a specific campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="campaignId">Campaign ID</Label>
              <Input
                id="campaignId"
                placeholder="Enter campaign ID"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchCampaignAnalytics} disabled={loadingCampaign}>
                {loadingCampaign ? "Loading..." : "Fetch Analytics"}
              </Button>
            </div>
          </div>

          {campaignAnalytics && (
            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignAnalytics.totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    {campaignAnalytics.completedViews} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignAnalytics.clickThroughRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {campaignAnalytics.clickedViews} clicks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${campaignAnalytics.totalRewards}</div>
                  <p className="text-xs text-muted-foreground">
                    {campaignAnalytics.rewardsClaimed} claimed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignAnalytics.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">View completion percentage</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fraud Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignAnalytics.fraudRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {campaignAnalytics.flaggedViews} flagged
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Fraud Score</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignAnalytics.avgFraudScore}</div>
                  <p className="text-xs text-muted-foreground">Average risk score</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
          <CardDescription>View detailed activity metrics for a specific user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchUserAnalytics} disabled={loadingUser}>
                {loadingUser ? "Loading..." : "Fetch Analytics"}
              </Button>
            </div>
          </div>

          {userAnalytics && (
            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userAnalytics.totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    {userAnalytics.completedViews} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${userAnalytics.totalEarnings}</div>
                  <p className="text-xs text-muted-foreground">
                    {userAnalytics.rewardsClaimed} rewards claimed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userAnalytics.clickedViews}</div>
                  <p className="text-xs text-muted-foreground">Ad links clicked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flagged Views</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userAnalytics.flaggedViews}</div>
                  <p className="text-xs text-muted-foreground">Suspicious activities</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Fraud Score</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userAnalytics.avgFraudScore}</div>
                  <p className="text-xs text-muted-foreground">Average risk score</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
