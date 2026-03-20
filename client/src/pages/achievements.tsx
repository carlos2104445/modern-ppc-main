import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Lock,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  Award,
  HandHeart,
  Target,
  Zap,
  Crown,
  Coins,
  Flame,
  UserPlus,
  BadgeCheck,
  Rocket,
  BarChart3,
  Swords,
  Gem,
} from "lucide-react";

// Icon mapping for achievements
const iconMap = {
  HandHeart,
  Target,
  Zap,
  Trophy,
  Coins,
  Flame,
  UserPlus,
  BadgeCheck,
  Rocket,
  BarChart3,
  Swords,
  Gem,
};

// Mock achievements data
const mockAchievements = [
  {
    id: "1",
    name: "Welcome Earner",
    description: "View your first ad",
    icon: "HandHeart",
    category: "earner",
    rarity: "common",
    progress: 1,
    target: 1,
    rewardBirr: 5,
    rewardXP: 10,
    unlocked: true,
    unlockedAt: "2024-10-15T10:30:00",
  },
  {
    id: "2",
    name: "Consistent Clicker",
    description: "View 10 ads",
    icon: "Target",
    category: "earner",
    rarity: "common",
    progress: 10,
    target: 10,
    rewardBirr: 10,
    rewardXP: 25,
    unlocked: true,
    unlockedAt: "2024-10-16T14:20:00",
  },
  {
    id: "3",
    name: "Dedicated Worker",
    description: "View 100 ads",
    icon: "Zap",
    category: "earner",
    rarity: "rare",
    progress: 67,
    target: 100,
    rewardBirr: 50,
    rewardXP: 100,
    unlocked: false,
  },
  {
    id: "4",
    name: "Ad Master",
    description: "View 1,000 ads",
    icon: "Trophy",
    category: "earner",
    rarity: "epic",
    progress: 0,
    target: 1000,
    rewardBirr: 500,
    rewardXP: 500,
    unlocked: false,
  },
  {
    id: "5",
    name: "Earnings Milestone",
    description: "Earn 100 Birr total",
    icon: "Coins",
    category: "earner",
    rarity: "rare",
    progress: 45,
    target: 100,
    rewardBirr: 25,
    rewardXP: 75,
    unlocked: false,
  },
  {
    id: "6",
    name: "Streak Master",
    description: "View ads 7 days in a row",
    icon: "Flame",
    category: "earner",
    rarity: "rare",
    progress: 3,
    target: 7,
    rewardBirr: 100,
    rewardXP: 150,
    unlocked: false,
  },
  {
    id: "7",
    name: "Social Influencer",
    description: "Refer 5 active users",
    icon: "UserPlus",
    category: "both",
    rarity: "epic",
    progress: 2,
    target: 5,
    rewardBirr: 200,
    rewardXP: 250,
    unlocked: false,
  },
  {
    id: "8",
    name: "Verified User",
    description: "Complete KYC verification",
    icon: "BadgeCheck",
    category: "both",
    rarity: "rare",
    progress: 0,
    target: 1,
    rewardBirr: 100,
    rewardXP: 200,
    unlocked: false,
  },
  {
    id: "9",
    name: "Campaign Creator",
    description: "Launch your first campaign",
    icon: "Rocket",
    category: "advertiser",
    rarity: "common",
    progress: 0,
    target: 1,
    rewardBirr: 0,
    rewardXP: 50,
    unlocked: false,
  },
  {
    id: "10",
    name: "Popular Advertiser",
    description: "Get 100 clicks on your ads",
    icon: "BarChart3",
    category: "advertiser",
    rarity: "rare",
    progress: 0,
    target: 100,
    rewardBirr: 50,
    rewardXP: 100,
    unlocked: false,
  },
  {
    id: "11",
    name: "Monthly Warrior",
    description: "View ads 30 days in a row",
    icon: "Swords",
    category: "earner",
    rarity: "legendary",
    progress: 0,
    target: 30,
    rewardBirr: 500,
    rewardXP: 1000,
    unlocked: false,
  },
  {
    id: "12",
    name: "Big Earner",
    description: "Earn 1,000 Birr total",
    icon: "Gem",
    category: "earner",
    rarity: "legendary",
    progress: 0,
    target: 1000,
    rewardBirr: 200,
    rewardXP: 500,
    unlocked: false,
  },
];

const rarityColors = {
  common: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20",
  rare: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  epic: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  legendary: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
};

const rarityLabels = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export default function Achievements() {
  const [activeTab, setActiveTab] = useState("all");

  const unlockedCount = mockAchievements.filter((a) => a.unlocked).length;
  const totalCount = mockAchievements.length;
  const totalBonusEarned = mockAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.rewardBirr, 0);

  const filteredAchievements = mockAchievements.filter((achievement) => {
    if (activeTab === "unlocked") return achievement.unlocked;
    if (activeTab === "locked") return !achievement.unlocked;
    return true;
  });

  return (
    <div className="p-6 space-y-6" data-testid="page-achievements">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2" data-testid="text-page-title">
          Your Achievements
        </h1>
        <p className="text-sm text-muted-foreground">
          Unlock badges and earn rewards by completing challenges
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-achievement-stats-progress">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold" data-testid="text-achievement-progress">
                  {unlockedCount}/{totalCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-achievement-stats-bonus">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Bonus Earned</p>
                <p className="text-2xl font-bold" data-testid="text-bonus-earned">
                  {totalBonusEarned.toLocaleString()} ETB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-achievement-stats-next">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Next Unlock</p>
                <p className="text-2xl font-bold" data-testid="text-next-unlock">
                  {mockAchievements.find((a) => !a.unlocked && a.progress > 0)?.name ||
                    "Keep going!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList data-testid="tabs-achievements-filter">
          <TabsTrigger value="all" data-testid="tab-all">
            All
          </TabsTrigger>
          <TabsTrigger value="unlocked" data-testid="tab-unlocked">
            Unlocked ({unlockedCount})
          </TabsTrigger>
          <TabsTrigger value="locked" data-testid="tab-locked">
            Locked ({totalCount - unlockedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`relative overflow-hidden ${achievement.unlocked ? "" : "opacity-75"}`}
                data-testid={`card-achievement-${achievement.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg ${
                          achievement.unlocked ? "bg-primary/10" : "bg-muted opacity-50"
                        }`}
                      >
                        {(() => {
                          const IconComponent = iconMap[achievement.icon as keyof typeof iconMap];
                          return IconComponent ? (
                            <IconComponent
                              className={`w-6 h-6 ${
                                achievement.unlocked ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                          ) : (
                            <Trophy className="w-6 h-6 text-muted-foreground" />
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {achievement.name}
                          {achievement.unlocked && (
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {achievement.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-6">
                  {/* Rarity Badge */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={rarityColors[achievement.rarity as keyof typeof rarityColors]}
                      data-testid={`badge-rarity-${achievement.id}`}
                    >
                      {rarityLabels[achievement.rarity as keyof typeof rarityLabels]}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span data-testid={`text-progress-${achievement.id}`}>
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                      <Progress
                        value={(achievement.progress / achievement.target) * 100}
                        className="h-2"
                        data-testid={`progress-bar-${achievement.id}`}
                      />
                    </div>
                  )}

                  {/* Unlocked Date */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p
                      className="text-xs text-muted-foreground"
                      data-testid={`text-unlocked-date-${achievement.id}`}
                    >
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}

                  {/* Rewards */}
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-muted-foreground">Reward:</span>
                      <span
                        className="font-semibold text-green-600 dark:text-green-400"
                        data-testid={`text-reward-birr-${achievement.id}`}
                      >
                        {achievement.rewardBirr} ETB
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span
                        className="font-semibold"
                        data-testid={`text-reward-xp-${achievement.id}`}
                      >
                        {achievement.rewardXP} XP
                      </span>
                    </div>
                  </div>

                  {/* Locked Overlay */}
                  {!achievement.unlocked && achievement.progress === 0 && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAchievements.length === 0 && (
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
