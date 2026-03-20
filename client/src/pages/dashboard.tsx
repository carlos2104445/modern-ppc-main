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
  Play,
  Pause,
  DollarSign,
  Trophy,
  Zap,
  Loader2,
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
import { useAuth } from "@/hooks/use-auth-context";

export default function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [stats, setStats] = useState<any>(null);

  const referralLink = user?.referralCode
    ? `https://adconnect.app/ref/${user.referralCode}`
    : "https://adconnect.app";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/v1/user/stats", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }
    if (user) fetchStats();
  }, [user]);

  const earningsData = [
    { date: "Mon", earnings: 0, clicks: 0 },
    { date: "Tue", earnings: 0, clicks: 0 },
    { date: "Wed", earnings: 0, clicks: 0 },
    { date: "Thu", earnings: 0, clicks: 0 },
    { date: "Fri", earnings: 0, clicks: 0 },
    { date: "Sat", earnings: 0, clicks: 0 },
    { date: "Sun", earnings: 0, clicks: 0 },
  ];

  const goals = [
    {
      id: "1",
      title: "Daily Ad Views",
      current: 0,
      target: 50,
      unit: "ads",
      period: "daily" as const,
      reward: "ETB 5 bonus",
    },
    {
      id: "2",
      title: "Weekly Earnings",
      current: parseFloat(stats?.lifetimeEarnings || "0"),
      target: 500,
      unit: "ETB",
      period: "weekly" as const,
      reward: "ETB 25 bonus",
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
      progress: Math.min(parseFloat(stats?.lifetimeEarnings || "0"), 100),
      target: 100,
      unlocked: parseFloat(stats?.lifetimeEarnings || "0") >= 100,
      rarity: "rare" as const,
      reward: "+200 XP",
    },
  ];

  const leaderboardData = [
    { rank: 1, username: "—", earnings: "—", isCurrentUser: false },
  ];

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const userName = user?.firstName || user?.username || "User";
  const balance = parseFloat(user?.balance || "0").toFixed(2);
  const lifetime = parseFloat(user?.lifetimeEarnings || "0").toFixed(2);
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const xpToNext = level * 500;
  const streak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || 0;
  const streakFreezes = user?.streakFreezes || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {greeting}, {userName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LevelProgressBar
            level={level}
            currentXP={xp % xpToNext}
            xpToNextLevel={xpToNext}
            totalXP={xp}
          />
        </div>
        <DailyStreak
          currentStreak={streak}
          longestStreak={longestStreak}
          streakFreezes={streakFreezes}
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
            value={`ETB ${balance}`}
            description="Available for use"
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
            value={`ETB ${lifetime}`}
            description="Total earned"
            icon={TrendingUp}
            variant="highlighted"
          />
        </div>
        <div
          onClick={() => setLocation("/campaigns")}
          className="cursor-pointer"
          data-testid="card-campaigns"
        >
          <StatCard
            title="Active Campaigns"
            value={stats?.activeCampaigns?.toString() || "0"}
            description={`${stats?.totalCampaigns || 0} total`}
            icon={MousePointerClick}
          />
        </div>
        <div
          onClick={() => setLocation("/campaigns")}
          className="cursor-pointer"
          data-testid="card-in-escrow"
        >
          <StatCard
            title="In Escrow"
            value={`ETB ${stats?.totalInEscrow || "0.00"}`}
            description="Campaign funds held"
            icon={DollarSign}
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
            <CardTitle>Recent Transactions</CardTitle>
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
                {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover-elevate cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg bg-muted ${parseFloat(tx.amount) >= 0 ? 'text-chart-2' : 'text-chart-1'}`}>
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium capitalize">
                              {tx.type.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tx.description}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              parseFloat(tx.amount) >= 0
                                ? "bg-chart-2/10 text-chart-2"
                                : "bg-chart-1/10 text-chart-1"
                            }
                          >
                            {parseFloat(tx.amount) >= 0 ? "+" : ""}ETB {tx.amount}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No transactions yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementHighlights achievements={achievements} />
        <LeaderboardPreview
          entries={leaderboardData}
          userRank={0}
          totalUsers={0}
        />
      </div>

      <InviteReferralDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </div>
  );
}
