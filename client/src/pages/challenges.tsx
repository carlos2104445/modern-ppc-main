import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Target, CheckCircle2, Clock, Star, MousePointerClick, Users,
  Coins, TrendingUp, Calendar, Loader2, Gift,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-context";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, any> = {
  MousePointerClick, Coins, Target, TrendingUp, Users,
};

const getTimeRemaining = (type: "daily" | "weekly") => {
  const now = new Date();
  if (type === "daily") {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  }
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  return `${daysUntilSunday}d remaining`;
};

export default function Challenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      const res = await fetch("/api/v1/user/challenges", { credentials: "include" });
      if (res.ok) setChallenges(await res.json());
    } catch (err) {
      console.error("Failed to fetch challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchChallenges();
  }, [user]);

  const claimReward = async (challengeId: string) => {
    setClaiming(challengeId);
    try {
      const res = await fetch(`/api/v1/user/challenges/${challengeId}/claim`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "🎉 Reward Claimed!",
          description: data.message,
        });
        // Refresh challenges
        await fetchChallenges();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to claim reward",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to claim reward", variant: "destructive" });
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const dailyChallenges = challenges?.daily || [];
  const weeklyChallenges = challenges?.weekly || [];
  const completedDaily = dailyChallenges.filter((c: any) => c.completed).length;
  const completedWeekly = weeklyChallenges.filter((c: any) => c.completed).length;

  const renderChallenge = (challenge: any) => {
    const IconComponent = iconMap[challenge.icon] || Target;
    const progressPct = (challenge.progress / challenge.target) * 100;
    const isDaily = challenge.type === "daily";

    return (
      <Card
        key={challenge.id}
        className={challenge.completed ? "bg-green-500/5 border-green-500/20" : ""}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${challenge.completed ? "bg-green-500/10" : isDaily ? "bg-primary/10" : "bg-purple-500/10"}`}>
                <IconComponent
                  className={`w-5 h-5 ${
                    challenge.completed
                      ? "text-green-600 dark:text-green-400"
                      : isDaily
                      ? "text-primary"
                      : "text-purple-600 dark:text-purple-400"
                  }`}
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {challenge.title}
                  {challenge.completed && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />}
                </CardTitle>
                <CardDescription className="text-sm">{challenge.description}</CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={isDaily
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
              }
            >
              {isDaily ? "Daily" : "Weekly"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {!challenge.completed && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{challenge.progress}/{challenge.target}</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{getTimeRemaining(challenge.type)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">Reward:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {challenge.rewardBirr} ETB
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold">{challenge.rewardXP} XP</span>
              </div>
            </div>

            {challenge.completed && !challenge.claimed && (
              <Button
                size="sm"
                onClick={() => claimReward(challenge.id)}
                disabled={claiming === challenge.id}
                className="gap-1.5"
              >
                {claiming === challenge.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Gift className="h-3.5 w-3.5" />
                )}
                Claim
              </Button>
            )}
            {challenge.claimed && (
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                Claimed ✓
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6" data-testid="page-challenges">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Daily Challenges</h1>
          <p className="text-sm text-muted-foreground">Complete challenges to earn bonus rewards</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">{dailyChallenges.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{completedDaily}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Completed</p>
                <p className="text-2xl font-bold">{completedWeekly}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Daily Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyChallenges.map(renderChallenge)}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Weekly Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyChallenges.map(renderChallenge)}
        </div>
      </div>
    </div>
  );
}
