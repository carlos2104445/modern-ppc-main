import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Megaphone, Users, Flame, Crown, Loader2 } from "lucide-react";

type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  value: number;
  isCurrentUser?: boolean;
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Crown className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Crown className="w-5 h-5 text-amber-600" />;
  return null;
};

const getRankColor = (rank: number) => {
  if (rank === 1) return "text-amber-500";
  if (rank === 2) return "text-gray-400";
  if (rank === 3) return "text-amber-600";
  return "text-muted-foreground";
};

const formatValue = (value: number, type: string) => {
  switch (type) {
    case "earners":
    case "advertisers":
      return `${value.toLocaleString()} ETB`;
    case "referrers":
      return `${value} referrals`;
    case "streaks":
      return `${value} days`;
    default:
      return value.toString();
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  type: string;
  loading: boolean;
}

function LeaderboardList({ entries, type, loading }: LeaderboardListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No data yet. Be the first on the leaderboard!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <Card
          key={entry.userId}
          className={`${entry.isCurrentUser ? "border-primary bg-primary/5" : ""}`}
          data-testid={`leaderboard-entry-${entry.userId}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 flex-shrink-0">
                {getRankBadge(entry.rank) || (
                  <span className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                    {entry.rank}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={entry.avatar} alt={entry.name} />
                  <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.name}</p>
                  {entry.isCurrentUser && (
                    <Badge variant="outline" className="text-xs mt-1">You</Badge>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold">{formatValue(entry.value, type)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Leaderboards() {
  const [activeTab, setActiveTab] = useState("earners");
  const [data, setData] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/leaderboard/${activeTab}?limit=10`, {
          credentials: "include",
        });
        if (res.ok) {
          const entries = await res.json();
          setData((prev) => ({ ...prev, [activeTab]: entries }));
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  const currentData = data[activeTab] || [];

  const leaderboardIcons = {
    earners: TrendingUp,
    advertisers: Megaphone,
    referrers: Users,
    streaks: Flame,
  };

  const IconComponent = leaderboardIcons[activeTab as keyof typeof leaderboardIcons];

  return (
    <div className="p-6 space-y-6" data-testid="page-leaderboards">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Leaderboards</h1>
          <p className="text-sm text-muted-foreground">See how you rank against other users</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="earners" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Top</span> Earners
          </TabsTrigger>
          <TabsTrigger value="advertisers" className="gap-2">
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Top</span> Advertisers
          </TabsTrigger>
          <TabsTrigger value="referrers" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Top</span> Referrers
          </TabsTrigger>
          <TabsTrigger value="streaks" className="gap-2">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Longest</span> Streaks
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {activeTab === "earners" && "Top Earners"}
                    {activeTab === "advertisers" && "Top Advertisers"}
                    {activeTab === "referrers" && "Top Referrers"}
                    {activeTab === "streaks" && "Longest Streaks"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "earners" && "Users with the highest total earnings"}
                    {activeTab === "advertisers" && "Advertisers who spent the most on campaigns"}
                    {activeTab === "referrers" && "Users with the most active referrals"}
                    {activeTab === "streaks" && "Users with the longest consecutive daily activity"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <LeaderboardList entries={currentData} type={activeTab} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
