import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { CampaignCard } from "@/components/campaign-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, TrendingUp, DollarSign, MousePointerClick, Search, Loader2 } from "lucide-react";
import { CreateCampaignDialog } from "@/components/create-campaign-dialog";
import { CampaignDetailsDialog } from "@/components/campaign-details-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Campaigns() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/campaigns", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Refresh campaigns when the create dialog closes (new campaign may have been created)
  const handleCreateDialogChange = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      fetchCampaigns();
    }
  };

  const handleViewDetails = (campaign: any) => {
    setSelectedCampaign(campaign);
    setDetailsDialogOpen(true);
  };

  const handleCancelCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/campaigns/${id}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Campaign cancelled",
          description: data.message || "Unspent escrow has been refunded to your balance.",
        });
        fetchCampaigns();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to cancel campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel campaign",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Campaign deleted",
          description: data.message || "Campaign has been deleted.",
        });
        fetchCampaigns();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const totalSpent = useMemo(() => {
    return campaigns.reduce((sum, c) => sum + parseFloat(c.spent || "0"), 0).toFixed(2);
  }, [campaigns]);

  const totalInEscrow = useMemo(() => {
    return campaigns
      .reduce((sum, c) => sum + (parseFloat(c.escrowAmount || "0") - parseFloat(c.spent || "0") - parseFloat(c.refundedAmount || "0")), 0)
      .toFixed(2);
  }, [campaigns]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage your advertising campaigns</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-campaign">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="hover-elevate cursor-pointer"
          onClick={() => setCreateDialogOpen(true)}
          data-testid="card-stat-total-campaigns"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-total-campaigns">
              {campaigns.length}
            </div>
          </CardContent>
        </Card>
        <Card
          className="hover-elevate cursor-pointer"
          onClick={() => setLocation("/wallet")}
          data-testid="card-stat-total-spent"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-total-spent">
              ETB {totalSpent}
            </div>
          </CardContent>
        </Card>
        <Card
          className="hover-elevate cursor-pointer"
          onClick={() => setStatusFilter("active")}
          data-testid="card-stat-in-escrow"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-in-escrow">
              ETB {totalInEscrow}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-campaigns"
          />
        </div>
        <Tabs
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
          data-testid="tabs-campaign-filter"
        >
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-filter-all">
              All
            </TabsTrigger>
            <TabsTrigger value="pending_review" data-testid="tab-filter-pending">
              Pending
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-filter-active">
              Active
            </TabsTrigger>
            <TabsTrigger value="cancelled" data-testid="tab-filter-cancelled">
              Cancelled
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-filter-rejected">
              Rejected
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-filter-completed">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Campaigns Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Campaigns</h2>
          <p className="text-sm text-muted-foreground" data-testid="text-campaign-count">
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""}
          </p>
        </div>
        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Loading campaigns...</p>
            </CardContent>
          </Card>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                id={campaign.id}
                name={campaign.name}
                type={campaign.type || "link"}
                budget={`ETB ${parseFloat(campaign.budget).toFixed(2)}`}
                spent={`ETB ${parseFloat(campaign.spent).toFixed(2)}`}
                clicks={0}
                status={campaign.status}
                onViewDetails={() => handleViewDetails(campaign)}
                onDelete={() => handleDeleteCampaign(campaign.id)}
                onCancel={["pending_review", "active", "paused"].includes(campaign.status) ? () => handleCancelCampaign(campaign.id) : undefined}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4" data-testid="text-no-campaigns">
                {searchQuery || statusFilter !== "all"
                  ? "No campaigns match your filters"
                  : "No campaigns yet"}
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                data-testid="button-create-first-campaign"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateCampaignDialog open={createDialogOpen} onOpenChange={handleCreateDialogChange} />

      {selectedCampaign && (
        <CampaignDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          campaign={selectedCampaign}
        />
      )}
    </div>
  );
}
