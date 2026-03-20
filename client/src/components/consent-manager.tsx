import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ConsentPreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function ConsentManager() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [_hasExistingConsent, setHasExistingConsent] = useState(false);

  useEffect(() => {
    fetchConsentPreferences();
  }, []);

  const fetchConsentPreferences = async () => {
    try {
      const response = await fetch("/api/gdpr/consent", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
          setHasExistingConsent(true);
        }
      }
    } catch (_error) {
      console.error("Failed to fetch consent preferences:", _error);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gdpr/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        toast({
          title: "Preferences saved",
          description: "Your consent preferences have been updated successfully.",
        });
        setHasExistingConsent(true);
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (_error) {
      console.error("Failed to save consent preferences:", _error);
      toast({
        title: "Error",
        description: "Failed to save consent preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    setPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/gdpr/export", {
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `user-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Data exported",
          description: "Your data has been exported successfully.",
        });
      } else {
        throw new Error("Failed to export data");
      }
    } catch (_error) {
      console.error("Failed to export data:", _error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestDeletion = async () => {
    if (
      !confirm("Are you sure you want to request account deletion? This action cannot be undone.")
    ) {
      return;
    }

    try {
      const response = await fetch("/api/gdpr/delete", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Deletion requested",
          description:
            "Your account deletion request has been submitted. You will receive a confirmation email.",
        });
      } else {
        throw new Error("Failed to request deletion");
      }
    } catch (_error) {
      console.error("Failed to request account deletion:", _error);
      toast({
        title: "Error",
        description: "Failed to request account deletion. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences">Consent Preferences</TabsTrigger>
          <TabsTrigger value="data">Your Data</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Cookie & Privacy Preferences</CardTitle>
              <CardDescription>
                Manage your consent preferences for data processing and cookies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="necessary" className="text-base font-medium">
                      Necessary Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Essential for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <Switch id="necessary" checked={preferences.necessary} disabled />
                </div>

                <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="functional" className="text-base font-medium">
                      Functional Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable enhanced functionality and personalization, such as remembering your
                      preferences.
                    </p>
                  </div>
                  <Switch
                    id="functional"
                    checked={preferences.functional}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, functional: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="analytics" className="text-base font-medium">
                      Analytics Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how visitors interact with our website by collecting and
                      reporting information anonymously.
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, analytics: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="marketing" className="text-base font-medium">
                      Marketing Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Used to track visitors across websites to display relevant advertisements and
                      marketing campaigns.
                    </p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, marketing: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="space-x-2">
                <Button variant="outline" onClick={handleRejectAll}>
                  Reject All
                </Button>
                <Button variant="outline" onClick={handleAcceptAll}>
                  Accept All
                </Button>
              </div>
              <Button onClick={handleSavePreferences} disabled={loading}>
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Your Data</CardTitle>
              <CardDescription>
                Access and manage your personal data stored in our system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Data Portability</h3>
                <p className="text-sm text-muted-foreground">
                  You have the right to receive a copy of your personal data in a structured,
                  commonly used, and machine-readable format.
                </p>
                <Button onClick={handleExportData} variant="outline">
                  Export My Data
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Data We Collect</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Account information (email, username, name)</li>
                  <li>Campaign and advertisement data</li>
                  <li>Transaction and payment history</li>
                  <li>Ad viewing history and interactions</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights">
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
              <CardDescription>
                Under GDPR and other privacy regulations, you have certain rights regarding your
                personal data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Right to Access</h3>
                <p className="text-sm text-muted-foreground">
                  You can request access to your personal data and information about how we process
                  it.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Right to Rectification</h3>
                <p className="text-sm text-muted-foreground">
                  You can request correction of inaccurate or incomplete personal data.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Right to Erasure</h3>
                <p className="text-sm text-muted-foreground">
                  You can request deletion of your personal data under certain circumstances.
                </p>
                <Button onClick={handleRequestDeletion} variant="destructive">
                  Request Account Deletion
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Right to Object</h3>
                <p className="text-sm text-muted-foreground">
                  You can object to certain types of processing, including direct marketing.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Right to Data Portability</h3>
                <p className="text-sm text-muted-foreground">
                  You can receive your personal data in a portable format and transmit it to another
                  controller.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Contact Us</h3>
                <p className="text-sm text-muted-foreground">
                  If you have questions about your privacy rights or wish to exercise them, please
                  contact our Data Protection Officer at privacy@modernppc.com
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
