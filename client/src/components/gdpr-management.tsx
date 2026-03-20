import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function GDPRManagement() {
  const [userId, setUserId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExportData = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gdpr/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: parseInt(userId) }),
      });

      if (!response.ok) {
        throw new Error("Failed to export user data");
      }

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-data-${userId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "User data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete all data for user ${userId}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gdpr/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: parseInt(userId), reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user data");
      }

      toast({
        title: "Success",
        description: "User data deleted successfully",
      });

      setUserId("");
      setReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymizeData = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        `Are you sure you want to anonymize all data for user ${userId}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gdpr/anonymize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: parseInt(userId), reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to anonymize user data");
      }

      toast({
        title: "Success",
        description: "User data anonymized successfully",
      });

      setUserId("");
      setReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to anonymize user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>GDPR Data Management</CardTitle>
        <CardDescription>Manage user data in compliance with GDPR regulations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="export">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="delete">Delete Data</TabsTrigger>
            <TabsTrigger value="anonymize">Anonymize Data</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-user-id">User ID</Label>
              <Input
                id="export-user-id"
                type="number"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Export all personal data associated with this user account. The data will be
              downloaded as a JSON file.
            </p>
            <Button onClick={handleExportData} disabled={loading}>
              {loading ? "Exporting..." : "Export User Data"}
            </Button>
          </TabsContent>

          <TabsContent value="delete" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-user-id">User ID</Label>
              <Input
                id="delete-user-id"
                type="number"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-reason">Reason (Optional)</Label>
              <Textarea
                id="delete-reason"
                placeholder="Enter reason for deletion"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                All user data including profile, transactions, and activity history will be
                permanently deleted.
              </p>
            </div>
            <Button onClick={handleDeleteData} disabled={loading} variant="destructive">
              {loading ? "Deleting..." : "Delete User Data"}
            </Button>
          </TabsContent>

          <TabsContent value="anonymize" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anonymize-user-id">User ID</Label>
              <Input
                id="anonymize-user-id"
                type="number"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anonymize-reason">Reason (Optional)</Label>
              <Textarea
                id="anonymize-reason"
                placeholder="Enter reason for anonymization"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Anonymize user data by replacing personal information with pseudonymized values.
              Transaction history will be preserved but dissociated from the user.
            </p>
            <div className="rounded-lg bg-yellow-500/10 p-4">
              <p className="text-sm font-medium text-yellow-600">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Personal identifiable information will be replaced with anonymized values.
              </p>
            </div>
            <Button onClick={handleAnonymizeData} disabled={loading} variant="secondary">
              {loading ? "Anonymizing..." : "Anonymize User Data"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
