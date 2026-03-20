import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2 } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  period: "daily" | "weekly" | "monthly";
  reward?: string;
}

interface GoalProgressProps {
  goals: Goal[];
}

export function GoalProgress({ goals }: GoalProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Your Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const isComplete = progress >= 100;

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete && <CheckCircle2 className="h-4 w-4 text-chart-2" />}
                  <p className="text-sm font-medium">{goal.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {goal.period}
                  </Badge>
                </div>
                <p className="text-sm font-bold">
                  {goal.current}/{goal.target} {goal.unit}
                </p>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
              {goal.reward && !isComplete && (
                <p className="text-xs text-muted-foreground">Reward: {goal.reward}</p>
              )}
              {isComplete && (
                <p className="text-xs text-chart-2 font-medium">
                  ✓ Goal completed! {goal.reward && `Earned: ${goal.reward}`}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
