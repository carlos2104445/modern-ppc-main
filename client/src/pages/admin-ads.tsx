import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Eye, Search, Link, Youtube, Image as ImageIcon } from "lucide-react";
import { AdminAdPreviewDialog } from "@/components/admin-ad-preview-dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminAds() {
  const { toast } = useToast();
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);

  const [ads, setAds] = useState([
    {
      id: "1",
      title: "Premium Fitness App",
      description: "Discover the ultimate fitness tracking app with AI-powered workout plans",
      advertiser: "FitnessPro Inc",
      campaign: "Summer Sale",
      payout: "ETB 0.05",
      duration: 15,
      status: "pending",
      type: "link" as const,
      targetUrl: "https://fitness-pro.example.com",
      submittedDate: "2024-01-15",
    },
    {
      id: "2",
      title: "Online Learning Platform",
      description: "Learn new skills from industry experts with our comprehensive courses",
      advertiser: "EduMaster",
      campaign: "Product Launch",
      payout: "ETB 0.08",
      duration: 20,
      status: "pending",
      type: "youtube" as const,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      submittedDate: "2024-01-14",
    },
    {
      id: "3",
      title: "E-commerce Store Sale",
      description: "Get 50% off on all electronics this week only",
      advertiser: "TechDeals",
      campaign: "Brand Awareness",
      payout: "ETB 0.03",
      duration: 10,
      status: "active",
      type: "banner" as const,
      imageUrl: "https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=TechDeals+Sale",
      submittedDate: "2024-01-12",
    },
    {
      id: "4",
      title: "Travel Booking Platform",
      description: "Find the best deals on flights, hotels, and vacation packages",
      advertiser: "TravelHub",
      campaign: "New User Promo",
      payout: "ETB 0.06",
      duration: 18,
      status: "rejected",
      type: "link" as const,
      targetUrl: "https://travel-hub.example.com",
      submittedDate: "2024-01-10",
    },
  ]);

  const statusColors = {
    pending: "bg-chart-4",
    active: "bg-chart-2",
    rejected: "bg-destructive",
    paused: "bg-muted",
  };

  const handlePreview = (ad: any) => {
    setSelectedAd(ad);
    setPreviewDialogOpen(true);
  };

  const handleApprove = (id: string) => {
    setAds(ads.map((ad) => (ad.id === id ? { ...ad, status: "active" } : ad)));
    console.log("Approving ad:", id);
  };

  const handleReject = (id: string) => {
    setAds(ads.map((ad) => (ad.id === id ? { ...ad, status: "rejected" } : ad)));
    console.log("Rejecting ad:", id);
  };

  const handleQuickApprove = (id: string) => {
    handleApprove(id);
    toast({
      title: "Ad approved",
      description: "The ad has been approved and is now live.",
    });
  };

  const handleQuickReject = (id: string) => {
    handleReject(id);
    toast({
      title: "Ad rejected",
      description: "The ad has been rejected.",
      variant: "destructive",
    });
  };

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "banner":
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };

  const pendingCount = ads.filter((ad) => ad.status === "pending").length;
  const activeCount = ads.filter((ad) => ad.status === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ad Management</h1>
        <p className="text-muted-foreground mt-1">Review and manage advertising content</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ads..." className="pl-9" data-testid="input-search-ads" />
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-chart-4/20">
            {pendingCount} Pending
          </Badge>
          <Badge variant="outline" className="bg-chart-2/20">
            {activeCount} Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ads.map((ad) => (
          <Card key={ad.id} className="hover-elevate">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getAdTypeIcon(ad.type)}
                      {ad.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={statusColors[ad.status as keyof typeof statusColors]}
                    >
                      {ad.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {ad.type}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Advertiser</p>
                      <p className="font-medium">{ad.advertiser}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Campaign</p>
                      <p className="font-medium">{ad.campaign}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payout</p>
                      <p className="font-medium">{ad.payout}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{ad.duration}s</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Submitted: {ad.submittedDate}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(ad)}
                    data-testid={`button-view-ad-${ad.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  {ad.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-chart-2 border-chart-2"
                        onClick={() => handleQuickApprove(ad.id)}
                        data-testid={`button-approve-ad-${ad.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive"
                        onClick={() => handleQuickReject(ad.id)}
                        data-testid={`button-reject-ad-${ad.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {ad.status === "active" && (
                    <Button variant="outline" size="sm" data-testid={`button-pause-ad-${ad.id}`}>
                      Pause
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAd && (
        <AdminAdPreviewDialog
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          ad={selectedAd}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
