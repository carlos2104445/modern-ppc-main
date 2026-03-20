import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Info } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ReferralSettings } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminReferralSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<ReferralSettings>({
    queryKey: ["/api/referral-settings"],
  });

  const [level1, setLevel1] = useState("");
  const [level2, setLevel2] = useState("");
  const [level3, setLevel3] = useState("");
  const [level4, setLevel4] = useState("");
  const [level5, setLevel5] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [maxLevels, setMaxLevels] = useState("5");

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setLevel1(settings.level1Percentage);
      setLevel2(settings.level2Percentage);
      setLevel3(settings.level3Percentage);
      setLevel4(settings.level4Percentage);
      setLevel5(settings.level5Percentage);
      setEnabled(settings.enabled);
      setMaxLevels(settings.maxLevels.toString());
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ReferralSettings>) => {
      return await apiRequest("/api/referral-settings", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referral-settings"] });
      toast({
        title: "Settings updated",
        description: "Referral settings have been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update referral settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const maxLevelsNum = parseInt(maxLevels);

    // Client-side validation
    const percentages = [
      { value: level1, name: "Level 1" },
      { value: level2, name: "Level 2" },
      { value: level3, name: "Level 3" },
      { value: level4, name: "Level 4" },
      { value: level5, name: "Level 5" },
    ];

    for (const { value, name } of percentages) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 100) {
        toast({
          title: "Validation error",
          description: `${name} percentage must be between 0 and 100`,
          variant: "destructive",
        });
        return;
      }
    }

    if (isNaN(maxLevelsNum) || maxLevelsNum < 1 || maxLevelsNum > 5) {
      toast({
        title: "Validation error",
        description: "Maximum levels must be between 1 and 5",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      level1Percentage: level1,
      level2Percentage: level2,
      level3Percentage: level3,
      level4Percentage: level4,
      level5Percentage: level5,
      enabled,
      maxLevels: maxLevelsNum,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPercentage = (
    parseFloat(level1 || "0") +
    parseFloat(level2 || "0") +
    parseFloat(level3 || "0") +
    parseFloat(level4 || "0") +
    parseFloat(level5 || "0")
  ).toFixed(2);

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Referral Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure commission percentages for the multi-level referral system
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Enable or disable the referral system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Referral System</Label>
                <p className="text-sm text-muted-foreground">
                  {enabled ? "System is active" : "System is disabled"}
                </p>
              </div>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                data-testid="switch-referral-enabled"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxLevels">Maximum Referral Levels</Label>
              <Input
                id="maxLevels"
                type="number"
                min="1"
                max="5"
                value={maxLevels}
                onChange={(e) => setMaxLevels(e.target.value)}
                data-testid="input-max-levels"
              />
              <p className="text-sm text-muted-foreground">
                Number of referral levels to track (1-5)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Percentages</CardTitle>
            <CardDescription>Set the commission percentage for each referral level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Each percentage represents the commission earned from a referral's earnings at that
                level. Level 1 is direct referrals, Level 2 is referrals of your referrals, and so
                on.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level1">Level 1 Commission (%)</Label>
                <Input
                  id="level1"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={level1}
                  onChange={(e) => setLevel1(e.target.value)}
                  data-testid="input-level1"
                />
                <p className="text-sm text-muted-foreground">Direct referrals</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level2">Level 2 Commission (%)</Label>
                <Input
                  id="level2"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={level2}
                  onChange={(e) => setLevel2(e.target.value)}
                  data-testid="input-level2"
                />
                <p className="text-sm text-muted-foreground">Second-level referrals</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level3">Level 3 Commission (%)</Label>
                <Input
                  id="level3"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={level3}
                  onChange={(e) => setLevel3(e.target.value)}
                  data-testid="input-level3"
                />
                <p className="text-sm text-muted-foreground">Third-level referrals</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level4">Level 4 Commission (%)</Label>
                <Input
                  id="level4"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={level4}
                  onChange={(e) => setLevel4(e.target.value)}
                  data-testid="input-level4"
                />
                <p className="text-sm text-muted-foreground">Fourth-level referrals</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level5">Level 5 Commission (%)</Label>
                <Input
                  id="level5"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={level5}
                  onChange={(e) => setLevel5(e.target.value)}
                  data-testid="input-level5"
                />
                <p className="text-sm text-muted-foreground">Fifth-level referrals</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Commission Rate</span>
                <span className="text-2xl font-bold" data-testid="text-total-percentage">
                  {totalPercentage}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Combined percentage across all levels
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Statistics</CardTitle>
            <CardDescription>Overview of the referral system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold" data-testid="text-total-referrals">
                  0
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Commissions Paid</p>
                <p className="text-2xl font-bold" data-testid="text-total-commissions">
                  ETB 0.00
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Referrers</p>
                <p className="text-2xl font-bold" data-testid="text-active-referrers">
                  0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            data-testid="button-save-settings"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
