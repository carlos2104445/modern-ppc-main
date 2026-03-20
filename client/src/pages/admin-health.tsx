import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Database,
  Zap,
  Server,
  Activity,
} from "lucide-react";
import apiClient from "@/lib/api-client";

interface DetailedHealth {
  status: string;
  timestamp: string;
  version?: string;
  services: {
    api: {
      status: string;
      uptime?: number;
    };
    database: {
      status: string;
      latency?: string;
      type?: string;
    };
    cache: {
      status: string;
      latency?: string;
      type?: string;
    };
  };
  system?: {
    memory?: {
      used: number;
      total: number;
      unit: string;
    };
    cpu?: any;
  };
}

export default function AdminHealth() {
  const [health, setHealth] = useState<DetailedHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>("");

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/v1/health/detailed", { showErrorToast: false });
      setHealth(data);
      setLastCheck(new Date().toLocaleString());
    } catch (error) {
      setHealth(null);
      setLastCheck(new Date().toLocaleString());
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
      case "healthy":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case "down":
      case "unhealthy":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Loader2 className="h-6 w-6 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
      case "healthy":
        return <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Degraded</Badge>;
      case "down":
      case "unhealthy":
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Detailed health status and monitoring for all services
          </p>
        </div>
        <Button onClick={checkHealth} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overall System Status</CardTitle>
              <CardDescription>Last checked: {lastCheck || "Checking..."}</CardDescription>
            </div>
            {health && getStatusBadge(health.status)}
          </div>
        </CardHeader>
        <CardContent>
          {loading && !health ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Checking system health...</span>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Server className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">API Service</p>
                        <p className="text-xs text-muted-foreground">REST API</p>
                      </div>
                    </div>
                    {getStatusIcon(health.services.api.status)}
                  </div>
                  {health.services.api.uptime !== undefined && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Uptime: </span>
                      <span className="font-medium">
                        {formatUptime(health.services.api.uptime)}
                      </span>
                    </div>
                  )}
                  <div className="mt-2">{getStatusBadge(health.services.api.status)}</div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Database</p>
                        <p className="text-xs text-muted-foreground">
                          {health.services.database.type || "PostgreSQL"}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(health.services.database.status)}
                  </div>
                  {health.services.database.latency && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Latency: </span>
                      <span className="font-medium">{health.services.database.latency}</span>
                    </div>
                  )}
                  <div className="mt-2">{getStatusBadge(health.services.database.status)}</div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Cache</p>
                        <p className="text-xs text-muted-foreground">
                          {health.services.cache.type || "Redis"}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(health.services.cache.status)}
                  </div>
                  {health.services.cache.latency && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Latency: </span>
                      <span className="font-medium">{health.services.cache.latency}</span>
                    </div>
                  )}
                  <div className="mt-2">{getStatusBadge(health.services.cache.status)}</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold">Unable to fetch health data</p>
              <p className="text-muted-foreground">Please check your connection and try again</p>
            </div>
          )}
        </CardContent>
      </Card>

      {health?.system && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {health.system.memory && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used</span>
                    <span className="font-medium">
                      {health.system.memory.used.toFixed(2)} {health.system.memory.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">
                      {health.system.memory.total.toFixed(2)} {health.system.memory.unit}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${(health.system.memory.used / health.system.memory.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {((health.system.memory.used / health.system.memory.total) * 100).toFixed(1)}%
                    utilized
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Platform Version</span>
                <span className="font-medium">{health.version || "1.0.0"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </span>
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
      )}
    </div>
  );
}
