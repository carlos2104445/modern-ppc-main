import { useState } from "react";
import { AdCard } from "@/components/ad-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, DollarSign, MousePointerClick, TrendingUp } from "lucide-react";
import { AdViewerDialog } from "@/components/ad-viewer-dialog";
import { useUserAuth } from "@/hooks/use-user-auth";

export default function Earn() {
  const { getCurrentUser } = useUserAuth();
  const currentUser = getCurrentUser();
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);

  const ads = [
    {
      id: "1",
      title: "Premium Fitness App",
      description: "Discover the ultimate fitness tracking app with AI-powered workout plans",
      payout: "ETB 0.05",
      duration: 15,
      advertiser: "FitnessPro Inc",
      type: "link" as const,
      targetUrl: "https://fitness-pro.example.com",
    },
    {
      id: "2",
      title: "Online Learning Platform",
      description: "Learn new skills from industry experts with our comprehensive courses",
      payout: "ETB 0.08",
      duration: 20,
      advertiser: "EduMaster",
      type: "youtube" as const,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "3",
      title: "E-commerce Store Sale",
      description: "Get 50% off on all electronics this week only - limited time offer",
      payout: "ETB 0.03",
      duration: 10,
      advertiser: "TechDeals",
      type: "banner" as const,
      imageUrl: "https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=TechDeals+Sale",
    },
    {
      id: "4",
      title: "Travel Booking Platform",
      description: "Find the best deals on flights, hotels, and vacation packages",
      payout: "ETB 0.06",
      duration: 18,
      advertiser: "TravelHub",
      type: "link" as const,
      targetUrl: "https://travel-hub.example.com",
    },
    {
      id: "5",
      title: "Cloud Storage Service",
      description: "Secure cloud storage with 2TB free trial for new users",
      payout: "ETB 0.07",
      duration: 25,
      advertiser: "CloudVault",
      type: "youtube" as const,
      videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    },
    {
      id: "6",
      title: "Gaming Platform",
      description: "Play thousands of games with unlimited access subscription",
      payout: "ETB 0.04",
      duration: 12,
      advertiser: "GameZone",
      type: "banner" as const,
      imageUrl: "https://via.placeholder.com/800x400/10B981/FFFFFF?text=GameZone+Platform",
    },
  ];

  const stats = [
    {
      title: "Today's Earnings",
      value: "ETB 1.23",
      icon: DollarSign,
    },
    {
      title: "Ads Viewed Today",
      value: "15",
      icon: MousePointerClick,
    },
    {
      title: "Available Ads",
      value: ads.length.toString(),
      icon: TrendingUp,
    },
  ];

  const handleAdClick = (ad: any) => {
    setSelectedAd(ad);
    setViewerDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earn Money</h1>
        <p className="text-muted-foreground mt-1">View ads and earn rewards</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search ads..." className="pl-9" data-testid="input-search-ads" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Available Ads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} onClick={() => handleAdClick(ad)}>
              <AdCard {...ad} />
            </div>
          ))}
        </div>
      </div>

      {selectedAd && (
        <AdViewerDialog
          open={viewerDialogOpen}
          onOpenChange={setViewerDialogOpen}
          ad={selectedAd}
          userId={currentUser?.id || "demo-user"}
        />
      )}
    </div>
  );
}
