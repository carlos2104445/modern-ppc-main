import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaintenancePage() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await fetch("/api/maintenance/status");
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch maintenance status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-yellow-500/10 p-3">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">System Under Maintenance</CardTitle>
          <CardDescription>
            {loading
              ? "Loading maintenance information..."
              : message
                ? message
                : "We're currently performing scheduled maintenance to improve your experience. Please check back shortly."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>We apologize for any inconvenience.</p>
            <p className="mt-2">Our team is working to restore service as quickly as possible.</p>
          </div>
          <Button onClick={handleRefresh} className="w-full" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
