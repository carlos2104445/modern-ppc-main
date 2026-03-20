import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Eye, Megaphone, DollarSign, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import type { AdminCampaign } from "@shared/schema";

export default function AdminCampaigns() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<AdminCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "link" as "link" | "video" | "banner",
    url: "",
    title: "",
    description: "",
    budget: "",
    cpc: "",
    duration: "15",
    imageUrl: "",
    status: "active" as "active" | "paused" | "completed",
  });
  const { toast } = useToast();

  const { data: campaigns = [], isLoading } = useQuery<AdminCampaign[]>({
    queryKey: ["/api/admin-campaigns"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/admin-campaigns", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-campaigns"] });
      toast({
        title: "Campaign created",
        description: "The admin campaign has been created successfully.",
      });
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/admin-campaigns/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-campaigns"] });
      toast({
        title: "Campaign updated",
        description: "The campaign has been updated successfully.",
      });
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update campaign.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/admin-campaigns/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-campaigns"] });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete campaign.",
        variant: "destructive",
      });
    },
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    totalBudget: campaigns.reduce((acc, c) => acc + parseFloat(String(c.budget)), 0),
  };

  const handleCreateNew = () => {
    setSelectedCampaign(null);
    setFormData({
      name: "",
      type: "link",
      url: "",
      title: "",
      description: "",
      budget: "",
      cpc: "",
      duration: "15",
      imageUrl: "",
      status: "active",
    });
    setDialogOpen(true);
  };

  const handleEdit = (campaign: AdminCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      type: campaign.type as "link" | "video" | "banner",
      url: campaign.url,
      title: campaign.title,
      description: campaign.description,
      budget: String(campaign.budget),
      cpc: String(campaign.cpc),
      duration: String(campaign.duration),
      imageUrl: campaign.imageUrl || "",
      status: campaign.status as "active" | "paused" | "completed",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.url || !formData.title || !formData.budget || !formData.cpc) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const campaignData = {
      name: formData.name,
      type: formData.type,
      url: formData.url,
      title: formData.title,
      description: formData.description,
      budget: formData.budget,
      cpc: formData.cpc,
      duration: parseInt(formData.duration),
      imageUrl: formData.imageUrl || undefined,
      status: formData.status,
    };

    if (selectedCampaign) {
      updateMutation.mutate({ id: selectedCampaign.id, data: campaignData });
    } else {
      createMutation.mutate(campaignData);
    }
  };

  const handleStatusChange = (id: string, status: "active" | "paused" | "completed") => {
    updateMutation.mutate({ id, data: { status } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Campaigns</h1>
            <p className="text-muted-foreground">
              Create and manage platform-wide campaigns for users
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage platform-wide campaigns for users
          </p>
        </div>
        <Button onClick={handleCreateNew} data-testid="button-create-admin-campaign">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-campaigns">
              {stats.total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-campaigns">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-budget">
              {formatCurrency(stats.totalBudget)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="pt-6">
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found. Create your first admin campaign to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>CPC</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                    <TableCell className="font-medium" data-testid={`text-name-${campaign.id}`}>
                      {campaign.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" data-testid={`badge-type-${campaign.id}`}>
                        {campaign.type}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-title-${campaign.id}`}>
                      {campaign.title}
                    </TableCell>
                    <TableCell data-testid={`text-budget-${campaign.id}`}>
                      {formatCurrency(campaign.budget)}
                    </TableCell>
                    <TableCell data-testid={`text-cpc-${campaign.id}`}>
                      {formatCurrency(campaign.cpc)}
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-1"
                        data-testid={`text-clicks-${campaign.id}`}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {campaign.clicks}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={campaign.status}
                        onValueChange={(value: any) => handleStatusChange(campaign.id, value)}
                      >
                        <SelectTrigger
                          className="w-[120px]"
                          data-testid={`select-status-${campaign.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active" data-testid={`option-active-${campaign.id}`}>
                            Active
                          </SelectItem>
                          <SelectItem value="paused" data-testid={`option-paused-${campaign.id}`}>
                            Paused
                          </SelectItem>
                          <SelectItem
                            value="completed"
                            data-testid={`option-completed-${campaign.id}`}
                          >
                            Completed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-actions-${campaign.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(campaign)}
                            data-testid={`button-edit-${campaign.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(campaign.id)}
                            className="text-destructive"
                            data-testid={`button-delete-${campaign.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Campaign Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCampaign ? "Edit Admin Campaign" : "Create Admin Campaign"}
            </DialogTitle>
            <DialogDescription>
              Create campaigns that will be displayed to all users on the platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Platform Introduction"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-campaign-name"
                />
              </div>
              <div>
                <Label htmlFor="type">Ad Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type" data-testid="select-campaign-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link" data-testid="option-type-link">
                      Link Ad
                    </SelectItem>
                    <SelectItem value="video" data-testid="option-type-video">
                      YouTube Video
                    </SelectItem>
                    <SelectItem value="banner" data-testid="option-type-banner">
                      Banner Image
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder={
                  formData.type === "video"
                    ? "https://youtube.com/watch?v=..."
                    : "https://example.com"
                }
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                data-testid="input-campaign-url"
              />
            </div>

            <div>
              <Label htmlFor="title">Ad Title *</Label>
              <Input
                id="title"
                placeholder="Enter a catchy title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-campaign-title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your campaign..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                data-testid="textarea-campaign-description"
              />
            </div>

            {formData.type === "banner" && (
              <div>
                <Label htmlFor="imageUrl">Banner Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  data-testid="input-campaign-image"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget">Total Budget (ETB) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="1000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  data-testid="input-campaign-budget"
                />
              </div>
              <div>
                <Label htmlFor="cpc">Cost Per Click (ETB) *</Label>
                <Input
                  id="cpc"
                  type="number"
                  step="0.01"
                  placeholder="5.00"
                  value={formData.cpc}
                  onChange={(e) => setFormData({ ...formData, cpc: e.target.value })}
                  data-testid="input-campaign-cpc"
                />
              </div>
              <div>
                <Label htmlFor="duration">View Duration *</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value: string) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger id="duration" data-testid="select-campaign-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15" data-testid="option-duration-15">
                      15 seconds
                    </SelectItem>
                    <SelectItem value="30" data-testid="option-duration-30">
                      30 seconds
                    </SelectItem>
                    <SelectItem value="45" data-testid="option-duration-45">
                      45 seconds
                    </SelectItem>
                    <SelectItem value="60" data-testid="option-duration-60">
                      1 minute
                    </SelectItem>
                    <SelectItem value="120" data-testid="option-duration-120">
                      2 minutes
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-testid="button-cancel-campaign"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-campaign"
            >
              {selectedCampaign ? "Update Campaign" : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
