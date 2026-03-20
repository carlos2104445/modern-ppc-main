import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit, Trash2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  active: boolean;
  createdAt: string;
}

export default function AdminAchievements() {
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "First Click",
      description: "Complete your first ad view",
      target: 1,
      reward: "+50 XP",
      rarity: "common",
      active: true,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Century Club",
      description: "Earn ETB 100 in total",
      target: 100,
      reward: "+200 XP",
      rarity: "rare",
      active: true,
      createdAt: "2024-01-15",
    },
    {
      id: "3",
      title: "Referral Master",
      description: "Refer 10 active users",
      target: 10,
      reward: "Premium Badge",
      rarity: "epic",
      active: true,
      createdAt: "2024-01-15",
    },
    {
      id: "4",
      title: "Streak Champion",
      description: "Maintain a 30-day streak",
      target: 30,
      reward: "+1000 XP",
      rarity: "legendary",
      active: true,
      createdAt: "2024-01-15",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    reward: "",
    rarity: "common" as "common" | "rare" | "epic" | "legendary",
  });

  const handleCreateAchievement = () => {
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      target: parseInt(formData.target),
      reward: formData.reward,
      rarity: formData.rarity,
      active: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setAchievements([...achievements, newAchievement]);
    setIsDialogOpen(false);
    resetForm();
    toast({
      title: "Achievement created",
      description: "The new achievement has been created successfully.",
    });
  };

  const handleUpdateAchievement = () => {
    if (!editingAchievement) return;

    setAchievements(
      achievements.map((achievement) =>
        achievement.id === editingAchievement.id
          ? {
              ...achievement,
              title: formData.title,
              description: formData.description,
              target: parseInt(formData.target),
              reward: formData.reward,
              rarity: formData.rarity,
            }
          : achievement
      )
    );

    setIsDialogOpen(false);
    setEditingAchievement(null);
    resetForm();
    toast({
      title: "Achievement updated",
      description: "The achievement has been updated successfully.",
    });
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements(achievements.filter((achievement) => achievement.id !== id));
    toast({
      title: "Achievement deleted",
      description: "The achievement has been deleted successfully.",
    });
  };

  const handleToggleActive = (id: string) => {
    setAchievements(
      achievements.map((achievement) =>
        achievement.id === id ? { ...achievement, active: !achievement.active } : achievement
      )
    );
  };

  const openEditDialog = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      target: achievement.target.toString(),
      reward: achievement.reward,
      rarity: achievement.rarity,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      target: "",
      reward: "",
      rarity: "common",
    });
    setEditingAchievement(null);
  };

  const rarityColors = {
    common: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
    rare: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    epic: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    legendary: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Achievements Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage user achievements</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAchievement ? "Edit Achievement" : "Create New Achievement"}
              </DialogTitle>
              <DialogDescription>
                {editingAchievement
                  ? "Update the achievement details below."
                  : "Create a new achievement for users to unlock."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., First Click"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Complete your first ad view"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rarity">Rarity</Label>
                <Select
                  value={formData.rarity}
                  onValueChange={(value: "common" | "rare" | "epic" | "legendary") =>
                    setFormData({ ...formData, rarity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reward">Reward</Label>
                <Input
                  id="reward"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  placeholder="+50 XP"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={editingAchievement ? handleUpdateAchievement : handleCreateAchievement}
              >
                {editingAchievement ? "Update Achievement" : "Create Achievement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Achievements</CardTitle>
          <CardDescription>Manage achievements that users can unlock</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Rarity</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{achievement.target}</TableCell>
                  <TableCell>
                    <Badge className={rarityColors[achievement.rarity]}>{achievement.rarity}</Badge>
                  </TableCell>
                  <TableCell>{achievement.reward}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(achievement.id)}
                    >
                      <Badge variant={achievement.active ? "default" : "secondary"}>
                        {achievement.active ? "Active" : "Inactive"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>{achievement.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(achievement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAchievement(achievement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
