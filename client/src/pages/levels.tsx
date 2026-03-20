import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Award, Zap, CheckCircle2, Lock } from "lucide-react";

type Level = {
  level: number;
  name: string;
  minXP: number;
  maxXP: number | null;
  earningsBoostPercent: number;
  maxDailyAds: number;
  priorityAdReview: boolean;
  prioritySupport: boolean;
};

// Mock user data
const mockUserProgress = {
  currentLevel: 3,
  currentXP: 750,
  totalXPEarned: 750,
};

// Mock levels data
const mockLevels: Level[] = [
  {
    level: 1,
    name: "Beginner",
    minXP: 0,
    maxXP: 100,
    earningsBoostPercent: 0,
    maxDailyAds: 50,
    priorityAdReview: false,
    prioritySupport: false,
  },
  {
    level: 2,
    name: "Explorer",
    minXP: 100,
    maxXP: 300,
    earningsBoostPercent: 5,
    maxDailyAds: 75,
    priorityAdReview: false,
    prioritySupport: false,
  },
  {
    level: 3,
    name: "Achiever",
    minXP: 300,
    maxXP: 600,
    earningsBoostPercent: 10,
    maxDailyAds: 100,
    priorityAdReview: false,
    prioritySupport: false,
  },
  {
    level: 4,
    name: "Professional",
    minXP: 600,
    maxXP: 1000,
    earningsBoostPercent: 15,
    maxDailyAds: 150,
    priorityAdReview: true,
    prioritySupport: false,
  },
  {
    level: 5,
    name: "Expert",
    minXP: 1000,
    maxXP: 1500,
    earningsBoostPercent: 20,
    maxDailyAds: 200,
    priorityAdReview: true,
    prioritySupport: true,
  },
  {
    level: 6,
    name: "Master",
    minXP: 1500,
    maxXP: null,
    earningsBoostPercent: 25,
    maxDailyAds: 300,
    priorityAdReview: true,
    prioritySupport: true,
  },
];

const getCurrentLevel = (xp: number): Level => {
  for (let i = mockLevels.length - 1; i >= 0; i--) {
    if (xp >= mockLevels[i].minXP) {
      return mockLevels[i];
    }
  }
  return mockLevels[0];
};

const getNextLevel = (currentLevel: number): Level | null => {
  const nextLevelData = mockLevels.find((l) => l.level === currentLevel + 1);
  return nextLevelData || null;
};

const getLevelProgress = (xp: number, currentLevel: Level, nextLevel: Level | null): number => {
  if (!nextLevel) return 100; // Max level
  const xpInCurrentLevel = xp - currentLevel.minXP;
  const xpNeededForNext = (nextLevel.minXP || 0) - currentLevel.minXP;
  return (xpInCurrentLevel / xpNeededForNext) * 100;
};

export default function Levels() {
  const currentLevel = getCurrentLevel(mockUserProgress.currentXP);
  const nextLevel = getNextLevel(currentLevel.level);
  const progressPercentage = getLevelProgress(mockUserProgress.currentXP, currentLevel, nextLevel);
  const xpNeededForNext = nextLevel ? nextLevel.minXP - mockUserProgress.currentXP : 0;

  return (
    <div className="p-6 space-y-6" data-testid="page-levels">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Star className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Level & Progress
          </h1>
          <p className="text-sm text-muted-foreground">Track your XP and unlock new benefits</p>
        </div>
      </div>

      {/* Current Level Card */}
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl" data-testid="text-current-level">
                Level {currentLevel.level}: {currentLevel.name}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {mockUserProgress.currentXP.toLocaleString()} XP
              </CardDescription>
            </div>
            <div className="p-4 rounded-full bg-primary/10">
              <Award className="w-8 h-8 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress to Next Level */}
          {nextLevel ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {nextLevel.level}</span>
                <span className="font-medium" data-testid="text-xp-remaining">
                  {xpNeededForNext} XP remaining
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" data-testid="progress-level" />
              <p className="text-xs text-muted-foreground">
                Next: {nextLevel.name} at {nextLevel.minXP.toLocaleString()} XP
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
              <span className="font-medium">Maximum level reached!</span>
            </div>
          )}

          {/* Current Benefits */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground">Your Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span data-testid="text-earnings-boost">
                  +{currentLevel.earningsBoostPercent}% Earnings Boost
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span data-testid="text-max-daily-ads">
                  {currentLevel.maxDailyAds} Daily Ads Limit
                </span>
              </div>
              {currentLevel.priorityAdReview && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Priority Ad Review</span>
                </div>
              )}
              {currentLevel.prioritySupport && (
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
          {mockLevels.map((level) => {
            const isUnlocked = mockUserProgress.currentXP >= level.minXP;
            const isCurrent = level.level === currentLevel.level;

            return (
              <Card
                key={level.level}
                className={`${
                  isCurrent ? "border-primary bg-primary/5" : isUnlocked ? "" : "opacity-60"
                }`}
                data-testid={`card-level-${level.level}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">Level {level.level}</CardTitle>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
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
                    <span className="font-medium" data-testid={`text-xp-required-${level.level}`}>
                      {level.minXP.toLocaleString()}
                    </span>
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
