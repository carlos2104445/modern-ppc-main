import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Award, Zap, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-context";

type LevelDef = {
  level: number;
  name: string;
  minXP: number;
  maxXP: number | null;
  earningsBoostPercent: number;
  maxDailyAds: number;
  priorityAdReview: boolean;
  prioritySupport: boolean;
};

export default function Levels() {
  const { user } = useAuth();
  const [gamData, setGamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGamification() {
      try {
        const res = await fetch("/api/v1/user/gamification", { credentials: "include" });
        if (res.ok) setGamData(await res.json());
      } catch (err) {
        console.error("Failed to fetch gamification:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchGamification();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const levels: LevelDef[] = gamData?.levels || [];
  const currentXP = gamData?.xp || user?.xp || 0;
  const userLevel = gamData?.level || user?.level || 1;
  const currentStreak = gamData?.currentStreak || 0;
  const longestStreak = gamData?.longestStreak || 0;

  const currentLevelDef = levels.find((l) => l.level === userLevel) || levels[0];
  const nextLevelDef = levels.find((l) => l.level === userLevel + 1);

  const progressPercentage = nextLevelDef
    ? ((currentXP - (currentLevelDef?.minXP || 0)) / ((nextLevelDef?.minXP || 1) - (currentLevelDef?.minXP || 0))) * 100
    : 100;

  const xpNeeded = nextLevelDef ? nextLevelDef.minXP - currentXP : 0;

  return (
    <div className="p-6 space-y-6" data-testid="page-levels">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Star className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Level & Progress</h1>
          <p className="text-sm text-muted-foreground">Track your XP and unlock new benefits</p>
        </div>
      </div>

      {/* Current Level Card */}
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Level {currentLevelDef?.level}: {currentLevelDef?.name}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {currentXP.toLocaleString()} XP • {currentStreak} day streak (best: {longestStreak})
              </CardDescription>
            </div>
            <div className="p-4 rounded-full bg-primary/10">
              <Award className="w-8 h-8 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextLevelDef ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {nextLevelDef.level}</span>
                <span className="font-medium">{xpNeeded} XP remaining</span>
              </div>
              <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Next: {nextLevelDef.name} at {nextLevelDef.minXP.toLocaleString()} XP
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
              <span className="font-medium">Maximum level reached!</span>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground">Your Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>+{currentLevelDef?.earningsBoostPercent || 0}% Earnings Boost</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{currentLevelDef?.maxDailyAds || 50} Daily Ads Limit</span>
              </div>
              {currentLevelDef?.priorityAdReview && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Priority Ad Review</span>
                </div>
              )}
              {currentLevelDef?.prioritySupport && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Priority Support</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Levels */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => {
            const isUnlocked = currentXP >= level.minXP;
            const isCurrent = level.level === userLevel;

            return (
              <Card
                key={level.level}
                className={`${isCurrent ? "border-primary bg-primary/5" : isUnlocked ? "" : "opacity-60"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">Level {level.level}</CardTitle>
                        {isCurrent && <Badge variant="default" className="text-xs">Current</Badge>}
                      </div>
                      <CardDescription>{level.name}</CardDescription>
                    </div>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Required XP: </span>
                    <span className="font-medium">{level.minXP.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      <span>+{level.earningsBoostPercent}% earnings</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{level.maxDailyAds} ads/day</span>
                    </div>
                    {level.priorityAdReview && (
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span>Priority ad review</span>
                      </div>
                    )}
                    {level.prioritySupport && (
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span>Priority support</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
