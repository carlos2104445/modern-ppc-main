import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Megaphone, Users, Flame, Crown } from "lucide-react";

type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  value: number;
  isCurrentUser?: boolean;
};

// Mock data for different leaderboards
const topEarners: LeaderboardEntry[] = [
  { rank: 1, userId: "1", name: "Abebe Bekele", avatar: "", value: 12450, isCurrentUser: false },
  { rank: 2, userId: "2", name: "Tigist Haile", avatar: "", value: 10200, isCurrentUser: false },
  { rank: 3, userId: "3", name: "Dawit Alemayehu", avatar: "", value: 8750, isCurrentUser: true },
  { rank: 4, userId: "4", name: "Sara Negussie", avatar: "", value: 7800, isCurrentUser: false },
  { rank: 5, userId: "5", name: "Yohannes Tadesse", avatar: "", value: 6950, isCurrentUser: false },
  { rank: 6, userId: "6", name: "Mekdes Gebre", avatar: "", value: 5600, isCurrentUser: false },
  { rank: 7, userId: "7", name: "Kebede Mulugeta", avatar: "", value: 4780, isCurrentUser: false },
  { rank: 8, userId: "8", name: "Hana Tesfa", avatar: "", value: 4200, isCurrentUser: false },
  { rank: 9, userId: "9", name: "Solomon Assefa", avatar: "", value: 3850, isCurrentUser: false },
  { rank: 10, userId: "10", name: "Seble Worku", avatar: "", value: 3200, isCurrentUser: false },
];

const topAdvertisers: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "11",
    name: "TechCorp Ethiopia",
    avatar: "",
    value: 45000,
    isCurrentUser: false,
  },
  { rank: 2, userId: "12", name: "Addis Digital", avatar: "", value: 38500, isCurrentUser: false },
  {
    rank: 3,
    userId: "13",
    name: "Sheger Solutions",
    avatar: "",
    value: 32000,
    isCurrentUser: false,
  },
  { rank: 4, userId: "14", name: "Blue Nile Ads", avatar: "", value: 28900, isCurrentUser: false },
  {
    rank: 5,
    userId: "15",
    name: "Ethiopian Ventures",
    avatar: "",
    value: 24500,
    isCurrentUser: true,
  },
  {
    rank: 6,
    userId: "16",
    name: "Habesha Marketing",
    avatar: "",
    value: 21000,
    isCurrentUser: false,
  },
  {
    rank: 7,
    userId: "17",
    name: "Rift Valley Media",
    avatar: "",
    value: 18700,
    isCurrentUser: false,
  },
  {
    rank: 8,
    userId: "18",
    name: "Lalibela Promotions",
    avatar: "",
    value: 15400,
    isCurrentUser: false,
  },
  { rank: 9, userId: "19", name: "Meskel Ads", avatar: "", value: 12800, isCurrentUser: false },
  {
    rank: 10,
    userId: "20",
    name: "Tana Advertising",
    avatar: "",
    value: 9500,
    isCurrentUser: false,
  },
];

const topReferrers: LeaderboardEntry[] = [
  { rank: 1, userId: "21", name: "Zelalem Desta", avatar: "", value: 156, isCurrentUser: false },
  { rank: 2, userId: "22", name: "Hirut Asfaw", avatar: "", value: 143, isCurrentUser: false },
  { rank: 3, userId: "23", name: "Berhanu Mekonnen", avatar: "", value: 128, isCurrentUser: false },
  { rank: 4, userId: "24", name: "Aster Girma", avatar: "", value: 97, isCurrentUser: true },
  { rank: 5, userId: "25", name: "Getachew Bahiru", avatar: "", value: 84, isCurrentUser: false },
  { rank: 6, userId: "26", name: "Rahel Tesfaye", avatar: "", value: 76, isCurrentUser: false },
  { rank: 7, userId: "27", name: "Mulugeta Alemu", avatar: "", value: 62, isCurrentUser: false },
  { rank: 8, userId: "28", name: "Bethlehem Tadesse", avatar: "", value: 54, isCurrentUser: false },
  { rank: 9, userId: "29", name: "Fitsum Negash", avatar: "", value: 48, isCurrentUser: false },
  { rank: 10, userId: "30", name: "Samrawit Yosef", avatar: "", value: 41, isCurrentUser: false },
];

const longestStreaks: LeaderboardEntry[] = [
  { rank: 1, userId: "31", name: "Daniel Teshome", avatar: "", value: 87, isCurrentUser: false },
  { rank: 2, userId: "32", name: "Marta Wolde", avatar: "", value: 76, isCurrentUser: false },
  { rank: 3, userId: "33", name: "Yared Kebede", avatar: "", value: 68, isCurrentUser: false },
  { rank: 4, userId: "34", name: "Tsion Abraha", avatar: "", value: 54, isCurrentUser: false },
  { rank: 5, userId: "35", name: "Elias Gezahegn", avatar: "", value: 49, isCurrentUser: false },
  { rank: 6, userId: "36", name: "Rediet Hailu", avatar: "", value: 42, isCurrentUser: true },
  { rank: 7, userId: "37", name: "Fasil Bekele", avatar: "", value: 38, isCurrentUser: false },
  { rank: 8, userId: "38", name: "Almaz Ayele", avatar: "", value: 31, isCurrentUser: false },
  { rank: 9, userId: "39", name: "Tesfaye Admasu", avatar: "", value: 27, isCurrentUser: false },
  { rank: 10, userId: "40", name: "Eden Tefera", avatar: "", value: 22, isCurrentUser: false },
];

const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return <Crown className="w-5 h-5 text-amber-500" />;
  }
  if (rank === 2) {
    return <Crown className="w-5 h-5 text-gray-400" />;
  }
  if (rank === 3) {
    return <Crown className="w-5 h-5 text-amber-600" />;
  }
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
      return `${value.toLocaleString()} ETB`;
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
}

function LeaderboardList({ entries, type }: LeaderboardListProps) {
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
              {/* Rank */}
              <div className="flex items-center justify-center w-12 flex-shrink-0">
                {getRankBadge(entry.rank) || (
                  <span className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={entry.avatar} alt={entry.name} />
                  <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" data-testid={`text-name-${entry.userId}`}>
                    {entry.name}
                  </p>
                  {entry.isCurrentUser && (
                    <Badge
                      variant="outline"
                      className="text-xs mt-1"
                      data-testid={`badge-you-${entry.userId}`}
                    >
                      You
                    </Badge>
                  )}
                </div>
              </div>

              {/* Value */}
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold" data-testid={`text-value-${entry.userId}`}>
                  {formatValue(entry.value, type)}
                </p>
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

  const leaderboardData = {
    earners: topEarners,
    advertisers: topAdvertisers,
    referrers: topReferrers,
    streaks: longestStreaks,
  };

  const leaderboardIcons = {
    earners: TrendingUp,
    advertisers: Megaphone,
    referrers: Users,
    streaks: Flame,
  };

  const currentData = leaderboardData[activeTab as keyof typeof leaderboardData];
  const IconComponent = leaderboardIcons[activeTab as keyof typeof leaderboardIcons];

  return (
    <div className="p-6 space-y-6" data-testid="page-leaderboards">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Leaderboards
          </h1>
          <p className="text-sm text-muted-foreground">See how you rank against other users</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList
          className="grid w-full grid-cols-2 lg:grid-cols-4"
          data-testid="tabs-leaderboard-types"
        >
          <TabsTrigger value="earners" className="gap-2" data-testid="tab-earners">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Top</span> Earners
          </TabsTrigger>
          <TabsTrigger value="advertisers" className="gap-2" data-testid="tab-advertisers">
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Top</span> Advertisers
          </TabsTrigger>
          <TabsTrigger value="referrers" className="gap-2" data-testid="tab-referrers">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Top</span> Referrers
          </TabsTrigger>
          <TabsTrigger value="streaks" className="gap-2" data-testid="tab-streaks">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Longest</span> Streaks
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Current Tab Header */}
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

          {/* Leaderboard List */}
          <LeaderboardList entries={currentData} type={activeTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
