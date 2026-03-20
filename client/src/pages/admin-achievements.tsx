import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Trophy, Edit, Save, Loader2, Star, Zap, TrendingUp,
  Target, Clock, Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  target: number;
  rewardBirr: number;
  rewardXP: number;
  checkType: string;
}

interface LevelDef {
  level: number;
  name: string;
  minXP: number;
  maxXP: number | null;
  earningsBoostPercent: number;
  maxDailyAds: number;
  priorityAdReview: boolean;
  prioritySupport: boolean;
}

interface ChallengeDef {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  target: number;
  rewardBirr: number;
  rewardXP: number;
  checkType: string;
}

export default function AdminAchievements() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("achievements");
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [levels, setLevels] = useState<LevelDef[]>([]);
  const [challenges, setChallenges] = useState<ChallengeDef[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/gamification", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
        setLevels(data.levels || []);
        setChallenges(data.challenges || []);
      } else {
        toast({ title: "Error", description: "Failed to load gamification data", variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to fetch gamification data:", err);
    } finally {
      setLoading(false);
    }
  }

  const rarityColors: Record<string, string> = {
    common: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
    rare: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    epic: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    legendary: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gamification Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure achievements, levels, and challenges
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Trophy className="h-4 w-4 mr-2" />
          {achievements.length} Achievements • {levels.length} Levels • {challenges.length} Challenges
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements ({achievements.length})
          </TabsTrigger>
          <TabsTrigger value="levels">
            <Star className="h-4 w-4 mr-2" />
            Levels ({levels.length})
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2" />
            Challenges ({challenges.length})
          </TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Achievements</CardTitle>
              <CardDescription>
                Achievements are defined in the gamification service. Users unlock them automatically based on their activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Rarity</TableHead>
                    <TableHead>Reward (ETB)</TableHead>
                    <TableHead>Reward (XP)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.map((ach) => (
                    <TableRow key={ach.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ach.name}</p>
                          <p className="text-sm text-muted-foreground">{ach.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ach.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ach.checkType}</TableCell>
                      <TableCell className="font-mono">{ach.target}</TableCell>
                      <TableCell>
                        <Badge className={rarityColors[ach.rarity]}>{ach.rarity}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600 dark:text-green-400">
                        {ach.rewardBirr} ETB
                      </TableCell>
                      <TableCell className="font-semibold">
                        {ach.rewardXP} XP
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Levels Tab */}
        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Level System</CardTitle>
              <CardDescription>
                Level definitions and their benefits. Users level up automatically as they earn XP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Min XP</TableHead>
                    <TableHead>Max XP</TableHead>
                    <TableHead>Earnings Boost</TableHead>
                    <TableHead>Daily Ads</TableHead>
                    <TableHead>Priority Review</TableHead>
                    <TableHead>Priority Support</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels.map((level) => (
                    <TableRow key={level.level}>
                      <TableCell className="font-bold text-lg">{level.level}</TableCell>
                      <TableCell className="font-medium">{level.name}</TableCell>
                      <TableCell className="font-mono">{level.minXP.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">
                        {level.maxXP ? level.maxXP.toLocaleString() : "∞"}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-300">
                          +{level.earningsBoostPercent}%
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{level.maxDailyAds}</TableCell>
                      <TableCell>
                        {level.priorityAdReview ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {level.prioritySupport ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily & Weekly Challenges</CardTitle>
              <CardDescription>
                Challenges reset daily/weekly. Users can claim rewards for completed challenges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Check Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Reward (ETB)</TableHead>
                    <TableHead>Reward (XP)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenges.map((ch) => (
                    <TableRow key={ch.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ch.title}</p>
                          <p className="text-sm text-muted-foreground">{ch.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ch.type === "daily"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                          : "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                        }>
                          {ch.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ch.checkType}</TableCell>
                      <TableCell className="font-mono">{ch.target}</TableCell>
                      <TableCell className="font-semibold text-green-600 dark:text-green-400">
                        {ch.rewardBirr} ETB
                      </TableCell>
                      <TableCell className="font-semibold">
                        {ch.rewardXP} XP
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
