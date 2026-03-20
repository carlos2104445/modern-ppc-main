import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Lock, CheckCircle2, Star, TrendingUp, Users, Award,
  HandHeart, Target, Zap, Crown, Coins, Flame, UserPlus, BadgeCheck,
  Rocket, BarChart3, Swords, Gem, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-context";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, any> = {
  HandHeart, Target, Zap, Trophy, Coins, Flame, UserPlus,
  BadgeCheck, Rocket, BarChart3, Swords, Gem, Crown,
};

const rarityColors: Record<string, string> = {
  common: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20",
  rare: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  epic: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  legendary: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
};

export default function Achievements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch("/api/v1/user/achievements", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setAchievements(data.achievements || []);
          // Notify about newly unlocked achievements
          if (data.newlyUnlocked?.length > 0) {
            const names = data.newlyUnlocked.map((id: string) => {
              const ach = data.achievements.find((a: any) => a.id === id);
              return ach?.name || id;
            });
            toast({
              title: "🏆 Achievement Unlocked!",
              description: names.join(", "),
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchAchievements();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const totalBonusEarned = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (a.rewardBirr || 0), 0);

  const filtered = achievements.filter((a) => {
    if (activeTab === "unlocked") return a.unlocked;
    if (activeTab === "locked") return !a.unlocked;
    return true;
  });

  return (
    <div className="p-6 space-y-6" data-testid="page-achievements">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Your Achievements</h1>
        <p className="text-sm text-muted-foreground">
          Unlock badges and earn rewards by completing challenges
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{unlockedCount}/{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Bonus Earned</p>
                <p className="text-2xl font-bold">{totalBonusEarned.toLocaleString()} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Next Unlock</p>
                <p className="text-2xl font-bold">
                  {achievements.find((a) => !a.unlocked && a.progress > 0)?.name || "Keep going!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked ({unlockedCount})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({totalCount - unlockedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ach) => {
              const IconComponent = iconMap[ach.icon] || Trophy;
              return (
                <Card
                  key={ach.id}
                  className={`relative overflow-hidden ${ach.unlocked ? "" : "opacity-75"}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${ach.unlocked ? "bg-primary/10" : "bg-muted opacity-50"}`}>
                          <IconComponent className={`w-6 h-6 ${ach.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {ach.name}
                            {ach.unlocked && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />}
                          </CardTitle>
                          <CardDescription className="text-sm">{ach.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={rarityColors[ach.rarity] || ""}>
                        {ach.rarity?.charAt(0).toUpperCase() + ach.rarity?.slice(1)}
                      </Badge>
                    </div>

                    {!ach.unlocked && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{ach.progress}/{ach.target}</span>
                        </div>
                        <Progress value={(ach.progress / ach.target) * 100} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="text-muted-foreground">Reward:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {ach.rewardBirr} ETB
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold">{ach.rewardXP} XP</span>
                      </div>
                    </div>

                    {!ach.unlocked && ach.progress === 0 && (
                      <div className="absolute top-4 right-4">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No achievements found</p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "unlocked"
                    ? "You haven't unlocked any achievements yet. Keep earning to unlock badges!"
                    : "All achievements unlocked! Great job!"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
