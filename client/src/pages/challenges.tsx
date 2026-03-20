import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  CheckCircle2,
  Clock,
  Star,
  MousePointerClick,
  Users,
  Coins,
  TrendingUp,
  Calendar,
} from "lucide-react";

type Challenge = {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  icon: string;
  progress: number;
  target: number;
  rewardBirr: number;
  rewardXP: number;
  expiresAt: string;
  completed: boolean;
};

// Generate future expiry dates
const getTodayEnd = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

const getWeekEnd = () => {
  const date = new Date();
  const daysUntilSunday = (7 - date.getDay()) % 7;
  date.setDate(date.getDate() + daysUntilSunday);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

// Mock challenges data
const mockChallenges: Challenge[] = [
  {
    id: "1",
    title: "Daily Ad Viewer",
    description: "View 20 ads today",
    type: "daily",
    icon: "MousePointerClick",
    progress: 15,
    target: 20,
    rewardBirr: 25,
    rewardXP: 50,
    expiresAt: getTodayEnd(),
    completed: false,
  },
  {
    id: "2",
    title: "Quick Earner",
    description: "Earn 50 Birr today",
    type: "daily",
    icon: "Coins",
    progress: 35,
    target: 50,
    rewardBirr: 10,
    rewardXP: 30,
    expiresAt: getTodayEnd(),
    completed: false,
  },
  {
    id: "3",
    title: "Daily Streak",
    description: "Complete your daily streak",
    type: "daily",
    icon: "Target",
    progress: 1,
    target: 1,
    rewardBirr: 15,
    rewardXP: 25,
    expiresAt: getTodayEnd(),
    completed: true,
  },
  {
    id: "4",
    title: "Weekly Warrior",
    description: "View 150 ads this week",
    type: "weekly",
    icon: "TrendingUp",
    progress: 87,
    target: 150,
    rewardBirr: 150,
    rewardXP: 200,
    expiresAt: getWeekEnd(),
    completed: false,
  },
  {
    id: "5",
    title: "Social Connector",
    description: "Refer 3 new users this week",
    type: "weekly",
    icon: "Users",
    progress: 1,
    target: 3,
    rewardBirr: 100,
    rewardXP: 150,
    expiresAt: getWeekEnd(),
    completed: false,
  },
];

const iconMap = {
  MousePointerClick,
  Coins,
  Target,
  TrendingUp,
  Users,
};

const getTimeRemaining = (expiresAt: string) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
};

export default function Challenges() {
  const dailyChallenges = mockChallenges.filter((c) => c.type === "daily");
  const weeklyChallenges = mockChallenges.filter((c) => c.type === "weekly");

  const activeDailyChallenges = dailyChallenges.filter((c) => !c.completed);
  const completedDailyChallenges = dailyChallenges.filter((c) => c.completed);

  return (
    <div className="p-6 space-y-6" data-testid="page-challenges">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Daily Challenges
          </h1>
          <p className="text-sm text-muted-foreground">Complete challenges to earn bonus rewards</p>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold" data-testid="text-active-daily">
                  {activeDailyChallenges.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold" data-testid="text-completed-daily">
                  {completedDailyChallenges.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Active</p>
                <p className="text-2xl font-bold" data-testid="text-active-weekly">
                  {weeklyChallenges.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">Daily Challenges</h2>
          {dailyChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No daily challenges available</p>
                <p className="text-sm text-muted-foreground">
                  Check back tomorrow for new daily challenges
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyChallenges.map((challenge) => {
                const IconComponent = iconMap[challenge.icon as keyof typeof iconMap];
                const progressPercentage = (challenge.progress / challenge.target) * 100;

                return (
                  <Card
                    key={challenge.id}
                    className={challenge.completed ? "bg-green-500/5 border-green-500/20" : ""}
                    data-testid={`card-challenge-${challenge.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-lg ${
                              challenge.completed ? "bg-green-500/10" : "bg-primary/10"
                            }`}
                          >
                            {IconComponent ? (
                              <IconComponent
                                className={`w-5 h-5 ${
                                  challenge.completed
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-primary"
                                }`}
                              />
                            ) : (
                              <Target className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {challenge.title}
                              {challenge.completed && (
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {challenge.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                          data-testid={`badge-type-${challenge.id}`}
                        >
                          Daily
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Progress */}
                      {!challenge.completed && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span data-testid={`text-progress-${challenge.id}`}>
                              {challenge.progress}/{challenge.target}
                            </span>
                          </div>
                          <Progress
                            value={progressPercentage}
                            className="h-2"
                            data-testid={`progress-bar-${challenge.id}`}
                          />
                        </div>
                      )}

                      {/* Time Remaining */}
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span data-testid={`text-time-${challenge.id}`}>
                          {getTimeRemaining(challenge.expiresAt)}
                        </span>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-3 pt-2 border-t">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-muted-foreground">Reward:</span>
                          <span
                            className="font-semibold text-green-600 dark:text-green-400"
                            data-testid={`text-reward-birr-${challenge.id}`}
                          >
                            {challenge.rewardBirr} ETB
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span
                            className="font-semibold"
                            data-testid={`text-reward-xp-${challenge.id}`}
                          >
                            {challenge.rewardXP} XP
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly Challenges */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Weekly Challenges</h2>
          {weeklyChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No weekly challenges available</p>
                <p className="text-sm text-muted-foreground">
                  Check back next week for new weekly challenges
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weeklyChallenges.map((challenge) => {
                const IconComponent = iconMap[challenge.icon as keyof typeof iconMap];
                const progressPercentage = (challenge.progress / challenge.target) * 100;

                return (
                  <Card
                    key={challenge.id}
                    className={challenge.completed ? "bg-green-500/5 border-green-500/20" : ""}
                    data-testid={`card-challenge-${challenge.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-lg ${
                              challenge.completed ? "bg-green-500/10" : "bg-purple-500/10"
                            }`}
                          >
                            {IconComponent ? (
                              <IconComponent
                                className={`w-5 h-5 ${
                                  challenge.completed
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-purple-600 dark:text-purple-400"
                                }`}
                              />
                            ) : (
                              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {challenge.title}
                              {challenge.completed && (
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {challenge.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                          data-testid={`badge-type-${challenge.id}`}
                        >
                          Weekly
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Progress */}
                      {!challenge.completed && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span data-testid={`text-progress-${challenge.id}`}>
                              {challenge.progress}/{challenge.target}
                            </span>
                          </div>
                          <Progress
                            value={progressPercentage}
                            className="h-2"
                            data-testid={`progress-bar-${challenge.id}`}
                          />
                        </div>
                      )}

                      {/* Time Remaining */}
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span data-testid={`text-time-${challenge.id}`}>
                          {getTimeRemaining(challenge.expiresAt)}
                        </span>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-3 pt-2 border-t">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-muted-foreground">Reward:</span>
                          <span
                            className="font-semibold text-green-600 dark:text-green-400"
                            data-testid={`text-reward-birr-${challenge.id}`}
                          >
                            {challenge.rewardBirr} ETB
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span
                            className="font-semibold"
                            data-testid={`text-reward-xp-${challenge.id}`}
                          >
                            {challenge.rewardXP} XP
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
