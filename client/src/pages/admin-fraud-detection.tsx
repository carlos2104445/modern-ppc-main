import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Shield, TrendingUp, Users, Eye } from "lucide-react";
import { useFraudAlerts } from "@/hooks/use-fraud-alerts";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface FraudDetectionSettings {
  id: string;
  maxViewsPerUserPerDay: number;
  maxViewsPerIpPerDay: number;
  maxViewsPerCampaignPerUser: number;
  minViewDurationSeconds: number;
  suspiciousUserAgentPatterns: string[];
  blockVpnProxies: boolean;
  autoFlagThreshold: number;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

interface FlaggedAdView {
  id: string;
  userId: string;
  campaignId: string;
  trackingToken: string;
  viewStarted: string;
  viewCompleted: string | null;
  linkClicked: boolean;
  linkClickedAt: string | null;
  rewardClaimed: boolean;
  rewardClaimedAt: string | null;
  rewardAmount: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  fraudScore: number;
  flaggedAsFraud: boolean;
  fraudReason: string | null;
  createdAt: string;
}

export default function AdminFraudDetection() {
  const { toast } = useToast();
  const { getAdminUser } = useAdminAuth();
  const adminUser = getAdminUser();
  const { alerts } = useFraudAlerts(adminUser?.id || null, true);
  const [settings, setSettings] = useState<FraudDetectionSettings | null>(null);
  const [flaggedViews, setFlaggedViews] = useState<FlaggedAdView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchFlaggedViews();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/fraud/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch fraud detection settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedViews = async () => {
    try {
      const response = await fetch("/api/admin/fraud/flagged");
      if (response.ok) {
        const data = await response.json();
        setFlaggedViews(data);
      }
    } catch (error) {
      console.error("Failed to fetch flagged views:", error);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/fraud/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Fraud detection settings have been updated successfully.",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save fraud detection settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getFraudScoreBadge = (score: number) => {
    if (score >= 80) {
      return <Badge variant="destructive">High Risk ({score})</Badge>;
    } else if (score >= 50) {
      return (
        <Badge variant="default" className="bg-orange-500">
          Medium Risk ({score})
        </Badge>
      );
    } else {
      return <Badge variant="secondary">Low Risk ({score})</Badge>;
    }
  };

  if (loading || !settings) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fraud Detection</h1>
          <p className="text-muted-foreground">Monitor and manage suspicious ad viewing patterns</p>
        </div>
        <Shield className="h-12 w-12 text-primary" />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Views</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedViews.length}</div>
            <p className="text-xs text-muted-foreground">Suspicious activities detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Flag Threshold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.autoFlagThreshold}</div>
            <p className="text-xs text-muted-foreground">Fraud score threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Views/User/Day</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.maxViewsPerUserPerDay}</div>
            <p className="text-xs text-muted-foreground">Daily user limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Status</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.enabled ? "Active" : "Inactive"}</div>
            <p className="text-xs text-muted-foreground">System status</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fraud Detection Settings</CardTitle>
          <CardDescription>
            Configure rules and thresholds for detecting suspicious ad viewing behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Fraud Detection</Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect and flag suspicious ad views
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxViewsPerUserPerDay">Max Views Per User Per Day</Label>
              <Input
                id="maxViewsPerUserPerDay"
                type="number"
                value={settings.maxViewsPerUserPerDay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxViewsPerUserPerDay: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxViewsPerIpPerDay">Max Views Per IP Per Day</Label>
              <Input
                id="maxViewsPerIpPerDay"
                type="number"
                value={settings.maxViewsPerIpPerDay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxViewsPerIpPerDay: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxViewsPerCampaignPerUser">Max Views Per Campaign Per User</Label>
              <Input
                id="maxViewsPerCampaignPerUser"
                type="number"
                value={settings.maxViewsPerCampaignPerUser}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxViewsPerCampaignPerUser: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minViewDurationSeconds">Min View Duration (seconds)</Label>
              <Input
                id="minViewDurationSeconds"
                type="number"
                value={settings.minViewDurationSeconds}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minViewDurationSeconds: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoFlagThreshold">Auto-Flag Threshold</Label>
              <Input
                id="autoFlagThreshold"
                type="number"
                value={settings.autoFlagThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoFlagThreshold: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Views with fraud score above this will be blocked
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="blockVpnProxies"
                checked={settings.blockVpnProxies}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, blockVpnProxies: checked })
                }
              />
              <Label htmlFor="blockVpnProxies">Block VPN/Proxy Connections</Label>
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Ad Views</CardTitle>
          <CardDescription>Recent ad views that have been flagged as suspicious</CardDescription>
        </CardHeader>
        <CardContent>
          {flaggedViews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No flagged ad views found</p>
          ) : (
            <div className="space-y-4">
              {flaggedViews.map((view) => (
                <div key={view.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">User: {view.userId}</p>
                      <p className="text-sm text-muted-foreground">Campaign: {view.campaignId}</p>
                    </div>
                    {getFraudScoreBadge(view.fraudScore)}
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">IP:</span> {view.ipAddress || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Reason:</span>{" "}
                      {view.fraudReason || "No reason provided"}
                    </p>
                    <p>
                      <span className="font-medium">Started:</span>{" "}
                      {new Date(view.viewStarted).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
