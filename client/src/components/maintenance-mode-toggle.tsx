import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceSettings {
  id: string;
  enabled: boolean;
  message: string | null;
  enabledAt: string | null;
  enabledBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export function MaintenanceModeToggle() {
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/maintenance/status");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setEnabled(data.enabled);
        setMessage(data.message || "");
      }
    } catch (error) {
      console.error("Failed to fetch maintenance settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setUpdating(true);
    try {
      const adminUser = localStorage.getItem("adminUser");
      const adminData = adminUser ? JSON.parse(adminUser) : null;

      const response = await fetch("/api/maintenance/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": adminData?.id || "",
        },
        body: JSON.stringify({
          enabled: checked,
          message: message || null,
          enabledBy: adminData?.id || null,
          adminEmail: adminData?.email || "unknown",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setEnabled(data.enabled);
        toast({
          title: checked ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
          description: checked
            ? "The system is now in maintenance mode. Only admins can access it."
            : "The system is now accessible to all users.",
        });
      } else {
        throw new Error("Failed to update maintenance mode");
      }
    } catch (error) {
      console.error("Failed to update maintenance mode:", error);
      toast({
        title: "Error",
        description: "Failed to update maintenance mode. Please try again.",
        variant: "destructive",
      });
      setEnabled(!checked);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateMessage = async () => {
    setUpdating(true);
    try {
      const adminUser = localStorage.getItem("adminUser");
      const adminData = adminUser ? JSON.parse(adminUser) : null;

      const response = await fetch("/api/maintenance/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": adminData?.id || "",
        },
        body: JSON.stringify({
          message: message || null,
          enabledBy: adminData?.id || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        toast({
          title: "Message Updated",
          description: "Maintenance message has been updated successfully.",
        });
      } else {
        throw new Error("Failed to update message");
      }
    } catch (error) {
      console.error("Failed to update message:", error);
      toast({
        title: "Error",
        description: "Failed to update maintenance message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Maintenance Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Maintenance Mode
        </CardTitle>
        <CardDescription>
          Enable maintenance mode to halt all operations for regular users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
            <p className="text-sm text-muted-foreground">
              Only admins and staff will be able to access the system
            </p>
          </div>
          <Switch
            id="maintenance-mode"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={updating}
          />
        </div>

        {enabled && (
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              placeholder="Enter a custom message to display to users (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={updating}
            />
            <Button onClick={handleUpdateMessage} disabled={updating} size="sm" className="w-full">
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Message"
              )}
            </Button>
          </div>
        )}

        {settings?.enabledAt && enabled && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Enabled at: {new Date(settings.enabledAt).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
