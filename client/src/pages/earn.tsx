import { useState, useEffect } from "react";
import { AdCard } from "@/components/ad-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, DollarSign, MousePointerClick, TrendingUp, Loader2 } from "lucide-react";
import { AdViewerDialog } from "@/components/ad-viewer-dialog";
import { useAuth } from "@/hooks/use-auth-context";

export default function Earn() {
  const { user } = useAuth();
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchAds() {
      try {
        // Fetch active campaigns that users can view as ads
        const res = await fetch("/api/v1/earn/ads", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setAds(data);
        }
      } catch (err) {
        console.error("Failed to fetch ads:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  const filteredAds = ads.filter((ad) =>
    ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    {
      title: "Today's Earnings",
      value: `ETB ${parseFloat(user?.lifetimeEarnings || "0").toFixed(2)}`,
      icon: DollarSign,
    },
    {
      title: "Available Ads",
      value: ads.length.toString(),
      icon: TrendingUp,
    },
    {
      title: "Your Balance",
      value: `ETB ${parseFloat(user?.balance || "0").toFixed(2)}`,
      icon: MousePointerClick,
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
        <Input
          placeholder="Search ads..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-ads"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Available Ads</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <div key={ad.id} onClick={() => handleAdClick(ad)}>
                <AdCard
                  id={ad.id}
                  title={ad.name || ad.title}
                  description={ad.description || "View this ad to earn"}
                  payout={`ETB ${parseFloat(ad.cpc || "0.05").toFixed(2)}`}
                  duration={ad.duration || 15}
                  advertiser={ad.advertiserName || "Advertiser"}
                  type={ad.type || "link"}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No ads available right now. Check back later!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedAd && (
        <AdViewerDialog
          open={viewerDialogOpen}
          onOpenChange={setViewerDialogOpen}
          ad={selectedAd}
          userId={user?.id || "demo-user"}
        />
      )}
    </div>
  );
}
