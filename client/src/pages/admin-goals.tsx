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
import { Plus, Edit, Trash2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  unit: string;
  period: "daily" | "weekly" | "monthly";
  reward: string;
  active: boolean;
  createdAt: string;
}

export default function AdminGoals() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Daily Ad Views",
      description: "Complete 50 ad views in a single day",
      target: 50,
      unit: "ads",
      period: "daily",
      reward: "ETB 5 bonus",
      active: true,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Weekly Earnings",
      description: "Earn ETB 500 in a week",
      target: 500,
      unit: "ETB",
      period: "weekly",
      reward: "ETB 25 bonus",
      active: true,
      createdAt: "2024-01-15",
    },
    {
      id: "3",
      title: "Monthly Referrals",
      description: "Refer 5 new users in a month",
      target: 5,
      unit: "referrals",
      period: "monthly",
      reward: "Premium Badge",
      active: true,
      createdAt: "2024-01-15",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    unit: "",
    period: "daily" as "daily" | "weekly" | "monthly",
    reward: "",
  });

  const handleCreateGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      target: parseInt(formData.target),
      unit: formData.unit,
      period: formData.period,
      reward: formData.reward,
      active: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setGoals([...goals, newGoal]);
    setIsDialogOpen(false);
    resetForm();
    toast({
      title: "Goal created",
      description: "The new goal has been created successfully.",
    });
  };

  const handleUpdateGoal = () => {
    if (!editingGoal) return;

    setGoals(
      goals.map((goal) =>
        goal.id === editingGoal.id
          ? {
              ...goal,
              title: formData.title,
              description: formData.description,
              target: parseInt(formData.target),
              unit: formData.unit,
              period: formData.period,
              reward: formData.reward,
            }
          : goal
      )
    );

    setIsDialogOpen(false);
    setEditingGoal(null);
    resetForm();
    toast({
      title: "Goal updated",
      description: "The goal has been updated successfully.",
    });
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
    toast({
      title: "Goal deleted",
      description: "The goal has been deleted successfully.",
    });
  };

  const handleToggleActive = (id: string) => {
    setGoals(goals.map((goal) => (goal.id === id ? { ...goal, active: !goal.active } : goal)));
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      target: goal.target.toString(),
      unit: goal.unit,
      period: goal.period,
      reward: goal.reward,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      target: "",
      unit: "",
      period: "daily",
      reward: "",
    });
    setEditingGoal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage user goals</p>
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
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
              <DialogDescription>
                {editingGoal
                  ? "Update the goal details below."
                  : "Create a new goal for users to complete."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Daily Ad Views"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Complete 50 ad views in a single day"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="ads"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period">Period</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value: "daily" | "weekly" | "monthly") =>
                    setFormData({ ...formData, period: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reward">Reward</Label>
                <Input
                  id="reward"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  placeholder="ETB 5 bonus"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}>
                {editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Goals</CardTitle>
          <CardDescription>Manage goals that users can complete</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {goal.target} {goal.unit}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{goal.period}</Badge>
                  </TableCell>
                  <TableCell>{goal.reward}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleActive(goal.id)}>
                      <Badge variant={goal.active ? "default" : "secondary"}>
                        {goal.active ? "Active" : "Inactive"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>{goal.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
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
