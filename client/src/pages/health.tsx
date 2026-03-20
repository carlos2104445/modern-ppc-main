import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  message?: string;
}

export default function Health() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>("");

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const data = await apiClient.get("/v1/health", { showErrorToast: false });

      const servicesList: ServiceStatus[] = [
        {
          name: "API",
          status: data.services?.api === "operational" ? "operational" : "down",
          message:
            data.services?.api === "operational"
              ? "All systems running smoothly"
              : "Service unavailable",
        },
        {
          name: "Platform",
          status: data.status === "healthy" ? "operational" : "degraded",
          message:
            data.status === "healthy"
              ? "Platform is fully operational"
              : "Platform experiencing issues",
        },
      ];

      setServices(servicesList);
      setLastCheck(new Date().toLocaleString());
    } catch (error) {
      setServices([
        {
          name: "API",
          status: "down",
          message: "Unable to connect to API",
        },
        {
          name: "Platform",
          status: "down",
          message: "Platform is unreachable",
        },
      ]);
      setLastCheck(new Date().toLocaleString());
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case "down":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Loader2 className="h-6 w-6 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Degraded</Badge>;
      case "down":
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const overallStatus = services.every((s) => s.status === "operational")
    ? "operational"
    : services.some((s) => s.status === "down")
      ? "down"
      : "degraded";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground mt-2">Real-time status of our services and platform</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overall Status</CardTitle>
              <CardDescription>Last checked: {lastCheck || "Checking..."}</CardDescription>
            </div>
            {getStatusBadge(overallStatus)}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Checking system health...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
          <CardDescription>Important details about our platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Platform Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Auto-refresh</span>
            <span className="font-medium">Every 30 seconds</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Security</span>
            <span className="font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              SSL Enabled
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
