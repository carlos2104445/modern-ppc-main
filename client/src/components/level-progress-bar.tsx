import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";

interface LevelProgressBarProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

export function LevelProgressBar({
  level,
  currentXP,
  xpToNextLevel,
  totalXP,
}: LevelProgressBarProps) {
  const progress = (currentXP / xpToNextLevel) * 100;

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/20">
              <Star className="h-4 w-4 text-primary" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-medium">Level {level}</p>
              <p className="text-xs text-muted-foreground">
                {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {totalXP.toLocaleString()} Total XP
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {(xpToNextLevel - currentXP).toLocaleString()} XP to Level {level + 1}
        </p>
      </CardContent>
    </Card>
  );
}
