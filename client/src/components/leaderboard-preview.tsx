import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Medal, Award } from "lucide-react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar?: string;
  earnings: string;
  isCurrentUser?: boolean;
}

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
  userRank: number;
  totalUsers: number;
}

export function LeaderboardPreview({ entries, userRank, totalUsers }: LeaderboardPreviewProps) {
  const [, setLocation] = useLocation();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-amber-500" fill="currentColor" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" fill="currentColor" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-700" fill="currentColor" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            You're #{userRank} of {totalUsers.toLocaleString()} users
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/leaderboards")}>
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              entry.isCurrentUser
                ? "bg-primary/10 border-2 border-primary/20"
                : "hover-elevate active-elevate-2"
            }`}
          >
            <div className="w-6 flex items-center justify-center">{getRankIcon(entry.rank)}</div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={entry.avatar} />
              <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {entry.username}
                {entry.isCurrentUser && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    You
                  </Badge>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-chart-2">{entry.earnings}</p>
              <p className="text-xs text-muted-foreground">earned</p>
            </div>
          </div>
        ))}
        {userRank > 5 && (
          <div className="pt-2 mt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setLocation("/leaderboards")}
            >
              <TrendingUp className="h-3 w-3 mr-2" />
              Climb the ranks!
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
