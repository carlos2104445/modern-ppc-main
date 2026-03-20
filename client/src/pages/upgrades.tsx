import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Clock, Eye, Star, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdViewingUpgrade {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: number;
  rewardMultiplier: string;
  dailyAdViewBonus: number;
  viewDurationReduction: number;
  priorityAccess: boolean;
  icon: string | null;
  color: string | null;
  status: string;
  displayOrder: number;
}

interface UserAdViewingUpgrade {
  id: string;
  userId: string;
  upgradeId: string;
  purchaseDate: Date;
  expiryDate: Date;
  status: string;
  upgrade?: AdViewingUpgrade;
}

export default function Upgrades() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: upgrades, isLoading: upgradesLoading } = useQuery<AdViewingUpgrade[]>({
    queryKey: ["/api/ad-viewing-upgrades"],
  });

  const { data: userUpgrades, isLoading: userUpgradesLoading } = useQuery<UserAdViewingUpgrade[]>({
    queryKey: ["/api/user/ad-viewing-upgrades"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (upgradeId: string) => {
      return apiRequest("/api/ad-viewing-upgrades/purchase", "POST", { upgradeId });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Upgrade purchased successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/ad-viewing-upgrades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activeUpgrade = userUpgrades?.find(
    (u) => u.status === "active" && new Date(u.expiryDate) > new Date()
  );

  if (upgradesLoading || userUpgradesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ad Viewing Upgrades</h1>
        <p className="text-muted-foreground mt-2">
          Boost your earnings with premium ad viewing upgrades
        </p>
      </div>

      {activeUpgrade && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Active Upgrade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold text-lg">{activeUpgrade.upgrade?.name}</p>
              <p className="text-sm text-muted-foreground">
                Expires: {new Date(activeUpgrade.expiryDate).toLocaleDateString()}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {activeUpgrade.upgrade && (
                  <>
                    <Badge variant="secondary">
                      <Zap className="h-3 w-3 mr-1" />
                      {parseFloat(activeUpgrade.upgrade.rewardMultiplier)}x Rewards
                    </Badge>
                    {activeUpgrade.upgrade.viewDurationReduction > 0 && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />-
                        {activeUpgrade.upgrade.viewDurationReduction}s Timer
                      </Badge>
                    )}
                    {activeUpgrade.upgrade.dailyAdViewBonus > 0 && (
                      <Badge variant="secondary">
                        <Eye className="h-3 w-3 mr-1" />+{activeUpgrade.upgrade.dailyAdViewBonus}{" "}
                        Daily Views
                      </Badge>
                    )}
                    {activeUpgrade.upgrade.priorityAccess && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Priority Access
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upgrades?.map((upgrade) => (
          <Card key={upgrade.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {upgrade.icon && <span className="text-2xl">{upgrade.icon}</span>}
                {upgrade.name}
              </CardTitle>
              <CardDescription>{upgrade.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div className="text-3xl font-bold">{parseFloat(upgrade.price).toFixed(2)} ETB</div>
                <div className="text-sm text-muted-foreground">
                  Duration: {upgrade.duration} days
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      {parseFloat(upgrade.rewardMultiplier)}x Reward Multiplier
                    </span>
                  </div>
                  {upgrade.viewDurationReduction > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        {upgrade.viewDurationReduction}s Reduced Timer
                      </span>
                    </div>
                  )}
                  {upgrade.dailyAdViewBonus > 0 && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="text-sm">+{upgrade.dailyAdViewBonus} Daily Ad Views</span>
                    </div>
                  )}
                  {upgrade.priorityAccess && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Priority Access to High-Paying Ads</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => purchaseMutation.mutate(upgrade.id)}
                disabled={!!activeUpgrade || purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Purchasing...
                  </>
                ) : activeUpgrade ? (
                  "Already Active"
                ) : (
                  "Purchase Upgrade"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {(!upgrades || upgrades.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No upgrades available at the moment. Check back later!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
