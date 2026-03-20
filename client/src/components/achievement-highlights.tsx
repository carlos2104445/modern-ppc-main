import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Lock, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  reward: string;
}

interface AchievementHighlightsProps {
  achievements: Achievement[];
}

const rarityColors = {
  common: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/30",
  rare: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  epic: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
  legendary: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

export function AchievementHighlights({ achievements }: AchievementHighlightsProps) {
  const [, setLocation] = useLocation();
  const recentUnlocked = achievements.filter((a) => a.unlocked).slice(0, 2);
  const nearCompletion = achievements
    .filter((a) => !a.unlocked && a.progress / a.target >= 0.5)
    .sort((a, b) => b.progress / b.target - a.progress / a.target)
    .slice(0, 2);

  const displayAchievements = [...recentUnlocked, ...nearCompletion].slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/achievements")}>
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg border-2 ${rarityColors[achievement.rarity]} ${achievement.unlocked ? "" : "opacity-75"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${achievement.unlocked ? "bg-chart-2/20" : "bg-muted"}`}
              >
                {achievement.unlocked ? (
                  <Trophy className="h-4 w-4 text-chart-2" fill="currentColor" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">{achievement.title}</p>
                  {achievement.unlocked && <Sparkles className="h-3 w-3 text-chart-2" />}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                {!achievement.unlocked && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {achievement.progress}/{achievement.target}
                    </p>
                  </div>
                )}
                {achievement.unlocked && (
                  <Badge variant="secondary" className="text-xs">
                    {achievement.reward}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
