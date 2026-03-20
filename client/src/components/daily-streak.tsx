import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Zap } from "lucide-react";

interface DailyStreakProps {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
}

export function DailyStreak({ currentStreak, longestStreak, streakFreezes }: DailyStreakProps) {
  const isOnFire = currentStreak >= 7;
  const isRecord = currentStreak === longestStreak && currentStreak > 0;

  return (
    <Card
      className={`border-2 ${isOnFire ? "border-orange-500/50 bg-orange-500/5" : "border-border"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isOnFire ? "bg-orange-500/20" : "bg-muted"}`}>
              <Flame
                className={`h-6 w-6 ${isOnFire ? "text-orange-500" : "text-muted-foreground"}`}
                fill={isOnFire ? "currentColor" : "none"}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{currentStreak}</p>
                <p className="text-sm text-muted-foreground">day streak</p>
                {isRecord && (
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    Record!
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Longest: {longestStreak} days</p>
            </div>
          </div>
          {streakFreezes > 0 && (
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              {streakFreezes} freeze{streakFreezes !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        {isOnFire && (
          <div className="mt-3 p-2 bg-orange-500/10 rounded-md border border-orange-500/20">
            <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
              🔥 You're on fire! Keep it up!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
