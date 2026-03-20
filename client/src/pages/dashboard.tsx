import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  TrendingUp,
  MousePointerClick,
  Users,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  DollarSign,
  Trophy,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { InviteReferralDialog } from "@/components/invite-referral-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LevelProgressBar } from "@/components/level-progress-bar";
import { EarningsChart } from "@/components/earnings-chart";
import { DailyStreak } from "@/components/daily-streak";
import { GoalProgress } from "@/components/goal-progress";
import { AchievementHighlights } from "@/components/achievement-highlights";
import { LeaderboardPreview } from "@/components/leaderboard-preview";

export default function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  const referralLink = "https://adconnect.app/ref/JD123456";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const userStats = {
    name: "John",
    level: 12,
    currentXP: 2450,
    xpToNextLevel: 3000,
    totalXP: 24500,
    currentStreak: 5,
    longestStreak: 14,
    streakFreezes: 2,
    rank: 45,
    totalUsers: 1250,
  };

  const earningsData = [
    { date: "Mon", earnings: 45.5, clicks: 42 },
    { date: "Tue", earnings: 52.3, clicks: 48 },
    { date: "Wed", earnings: 38.2, clicks: 35 },
    { date: "Thu", earnings: 67.8, clicks: 61 },
    { date: "Fri", earnings: 71.4, clicks: 65 },
    { date: "Sat", earnings: 55.9, clicks: 51 },
    { date: "Sun", earnings: 49.2, clicks: 44 },
  ];

  const goals = [
    {
      id: "1",
      title: "Daily Ad Views",
      current: 42,
      target: 50,
      unit: "ads",
      period: "daily" as const,
      reward: "ETB 5 bonus",
    },
    {
      id: "2",
      title: "Weekly Earnings",
      current: 234.5,
      target: 500,
      unit: "ETB",
      period: "weekly" as const,
      reward: "ETB 25 bonus",
    },
    {
      id: "3",
      title: "Referral Challenge",
      current: 3,
      target: 5,
      unit: "referrals",
      period: "monthly" as const,
      reward: "Premium Badge",
    },
  ];

  const achievements = [
    {
      id: "1",
      title: "First Click",
      description: "Complete your first ad view",
      progress: 1,
      target: 1,
      unlocked: true,
      rarity: "common" as const,
      reward: "+50 XP",
    },
    {
      id: "2",
      title: "Century Club",
      description: "Earn ETB 100 in total",
      progress: 87,
      target: 100,
      unlocked: false,
      rarity: "rare" as const,
      reward: "+200 XP",
    },
    {
      id: "3",
      title: "Referral Master",
      description: "Refer 10 active users",
      progress: 7,
      target: 10,
      unlocked: false,
      rarity: "epic" as const,
      reward: "Premium Badge",
    },
    {
      id: "4",
      title: "Streak Champion",
      description: "Maintain a 30-day streak",
      progress: 5,
      target: 30,
      unlocked: false,
      rarity: "legendary" as const,
      reward: "+1000 XP",
    },
  ];

  const leaderboardData = [
    { rank: 1, username: "ProClicker", earnings: "ETB 12,450", isCurrentUser: false },
    { rank: 2, username: "AdMaster99", earnings: "ETB 11,230", isCurrentUser: false },
    { rank: 3, username: "EarnKing", earnings: "ETB 10,875", isCurrentUser: false },
    { rank: 4, username: "TopEarner", earnings: "ETB 9,560", isCurrentUser: false },
    { rank: 45, username: "John", earnings: "ETB 5,679", isCurrentUser: true },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "earning",
      title: "Ad View Completed",
      description: "YouTube ad - Tech Product Launch",
      amount: "+ETB 2.50",
      time: "5 minutes ago",
      icon: MousePointerClick,
      color: "text-chart-2",
    },
    {
      id: "2",
      type: "campaign",
      title: "Campaign Paused",
      description: "Summer Sale Campaign",
      time: "1 hour ago",
      icon: Pause,
      color: "text-chart-4",
    },
    {
      id: "3",
      type: "earning",
      title: "Referral Commission",
      description: "From user @john_doe",
      amount: "+ETB 15.00",
      time: "2 hours ago",
      icon: Users,
      color: "text-chart-2",
    },
    {
      id: "4",
      type: "withdrawal",
      title: "Withdrawal Processed",
      description: "Bank Transfer to 1234******5678",
      amount: "-ETB 500.00",
      time: "3 hours ago",
      icon: ArrowUpRight,
      color: "text-chart-1",
    },
    {
      id: "5",
      type: "campaign",
      title: "Campaign Started",
      description: "Product Launch 2024",
      time: "5 hours ago",
      icon: Play,
      color: "text-chart-2",
    },
    {
      id: "6",
      type: "earning",
      title: "Ad View Completed",
      description: "Banner ad - Fashion Brand",
      amount: "+ETB 1.75",
      time: "6 hours ago",
      icon: MousePointerClick,
      color: "text-chart-2",
    },
  ];

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {greeting}, {userStats.name}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LevelProgressBar
            level={userStats.level}
            currentXP={userStats.currentXP}
            xpToNextLevel={userStats.xpToNextLevel}
            totalXP={userStats.totalXP}
          />
        </div>
        <DailyStreak
          currentStreak={userStats.currentStreak}
          longestStreak={userStats.longestStreak}
          streakFreezes={userStats.streakFreezes}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => setLocation("/wallet")}
          className="cursor-pointer"
          data-testid="card-wallet-balance"
        >
          <StatCard
            title="Wallet Balance"
            value="ETB 1,234.56"
            description="Available for withdrawal"
            icon={Wallet}
            variant="primary"
          />
        </div>
        <div
          onClick={() => setLocation("/wallet")}
          className="cursor-pointer"
          data-testid="card-lifetime-earnings"
        >
          <StatCard
            title="Lifetime Earnings"
            value="ETB 5,678.90"
            description="Total earned"
            icon={TrendingUp}
            trend={{ value: "12.5%", isPositive: true }}
            variant="highlighted"
          />
        </div>
        <div
          onClick={() => setLocation("/earn")}
          className="cursor-pointer"
          data-testid="card-ads-clicked"
        >
          <StatCard
            title="Ads Clicked Today"
            value="42"
            description="Daily clicks"
            icon={MousePointerClick}
          />
        </div>
        <div
          onClick={() => setLocation("/referrals")}
          className="cursor-pointer"
          data-testid="card-active-referrals"
        >
          <StatCard
            title="Active Referrals"
            value="23"
            description="Total network"
            icon={Users}
            trend={{ value: "3 new", isPositive: true }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EarningsChart data={earningsData} period="7d" />
        </div>
        <GoalProgress goals={goals} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share your unique link to earn commissions on your referrals' earnings
            </p>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly data-testid="input-referral-link" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyReferral}
                data-testid="button-copy-referral"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setInviteDialogOpen(true)}
                data-testid="button-share-referral"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Share with Friends
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start h-12 text-base font-medium"
              onClick={() => setLocation("/earn")}
              data-testid="button-view-ads"
            >
              <MousePointerClick className="h-5 w-5 mr-3" />
              View Available Ads
            </Button>
            <Button
              className="w-full justify-start h-12 text-base font-medium"
              variant="outline"
              onClick={() => setLocation("/campaigns")}
              data-testid="button-create-campaign"
            >
              <TrendingUp className="h-5 w-5 mr-3" />
              Create New Campaign
            </Button>
            <Button
              className="w-full justify-start h-12 text-base font-medium"
              variant="outline"
              onClick={() => setLocation("/wallet")}
              data-testid="button-withdraw"
            >
              <Wallet className="h-5 w-5 mr-3" />
              Manage Wallet
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <CardTitle>Recent Activity</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/wallet")}
              data-testid="button-view-all-activity"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="space-y-1 px-6 pb-6">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer"
                      data-testid={`activity-item-${activity.id}`}
                    >
                      <div className={`p-2 rounded-lg bg-muted ${activity.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium"
                              data-testid={`activity-title-${activity.id}`}
                            >
                              {activity.title}
                            </p>
                            <p
                              className="text-xs text-muted-foreground truncate"
                              data-testid={`activity-description-${activity.id}`}
                            >
                              {activity.description}
                            </p>
                          </div>
                          {activity.amount && (
                            <Badge
                              variant="outline"
                              className={
                                activity.amount.startsWith("+")
                                  ? "bg-chart-2/10 text-chart-2"
                                  : "bg-chart-1/10 text-chart-1"
                              }
                              data-testid={`activity-amount-${activity.id}`}
                            >
                              {activity.amount}
                            </Badge>
                          )}
                        </div>
                        <p
                          className="text-xs text-muted-foreground mt-1"
                          data-testid={`activity-time-${activity.id}`}
                        >
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementHighlights achievements={achievements} />
        <LeaderboardPreview
          entries={leaderboardData}
          userRank={userStats.rank}
          totalUsers={userStats.totalUsers}
        />
      </div>

      <InviteReferralDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </div>
  );
}
