import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { CampaignCard } from "@/components/campaign-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, TrendingUp, DollarSign, MousePointerClick, Search } from "lucide-react";
import { CreateCampaignDialog } from "@/components/create-campaign-dialog";
import { CampaignDetailsDialog } from "@/components/campaign-details-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Campaigns() {
  const [, setLocation] = useLocation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "completed">(
    "all"
  );
  const [campaigns, setCampaigns] = useState([
    {
      id: "1",
      name: "Summer Sale Campaign",
      type: "link" as const,
      budget: "ETB 500.00",
      spent: "ETB 287.50",
      clicks: 1250,
      status: "active" as const,
    },
    {
      id: "2",
      name: "Product Launch 2024",
      type: "youtube" as const,
      budget: "ETB 1000.00",
      spent: "ETB 450.00",
      clicks: 890,
      status: "paused" as const,
    },
    {
      id: "3",
      name: "Brand Awareness",
      type: "banner" as const,
      budget: "ETB 750.00",
      spent: "ETB 750.00",
      clicks: 3200,
      status: "completed" as const,
    },
  ]);

  const handleViewDetails = (campaign: any) => {
    setSelectedCampaign(campaign);
    setDetailsDialogOpen(true);
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const stats = [
    {
      title: "Total Campaigns",
      value: campaigns.length.toString(),
      icon: TrendingUp,
    },
    {
      title: "Total Spent",
      value: "ETB 1,487.50",
      icon: DollarSign,
    },
    {
      title: "Total Clicks",
      value: "5,340",
      icon: MousePointerClick,
    },
  ];

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
              ETB 1,487.50
            </div>
          </CardContent>
        </Card>
        <Card
          className="hover-elevate cursor-pointer"
          onClick={() => setStatusFilter("active")}
          data-testid="card-stat-total-clicks"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-total-clicks">
              5,340
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
          onValueChange={(value) => setStatusFilter(value as any)}
          data-testid="tabs-campaign-filter"
        >
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-filter-all">
              All
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-filter-active">
              Active
            </TabsTrigger>
            <TabsTrigger value="paused" data-testid="tab-filter-paused">
              Paused
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
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                {...campaign}
                onViewDetails={() => handleViewDetails(campaign)}
                onDelete={() => handleDeleteCampaign(campaign.id)}
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

      <CreateCampaignDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

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
