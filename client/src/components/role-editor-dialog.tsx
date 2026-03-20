import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Role } from "@shared/schema";

interface RoleEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role;
}

export function RoleEditorDialog({ open, onOpenChange, role }: RoleEditorDialogProps) {
  const { toast } = useToast();
  const [roleName, setRoleName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [permissions, setPermissions] = useState<string[]>(role?.permissions || []);

  useEffect(() => {
    if (open && role) {
      setRoleName(role.name);
      setDescription(role.description || "");
      setPermissions(role.permissions);
    } else if (open && !role) {
      setRoleName("");
      setDescription("");
      setPermissions([]);
    }
  }, [open, role]);

  const availablePermissions = [
    { id: "view_users", label: "View Users" },
    { id: "manage_users", label: "Manage Users" },
    { id: "view_financials", label: "View Financials" },
    { id: "process_withdrawals", label: "Process Withdrawals" },
    { id: "manage_deposits", label: "Manage Deposits" },
    { id: "review_ads", label: "Review Ads" },
    { id: "approve_publishers", label: "Approve Publishers" },
    { id: "view_tickets", label: "View Support Tickets" },
    { id: "reply_tickets", label: "Reply to Tickets" },
    { id: "manage_roles", label: "Manage Roles & Staff" },
    { id: "send_communications", label: "Send Communications" },
    { id: "view_analytics", label: "View Analytics" },
  ];

  const togglePermission = (permissionId: string) => {
    setPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((p) => p !== permissionId) : [...prev, permissionId]
    );
  };

  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; permissions: string[] }) => {
      return await apiRequest("/api/roles", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Role created",
        description: `${roleName} has been created successfully.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; permissions: string[] }) => {
      return await apiRequest(`/api/roles/${role?.id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Role updated",
        description: `${roleName} has been updated successfully.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!roleName.trim()) {
      toast({
        title: "Role name required",
        description: "Please provide a name for this role.",
        variant: "destructive",
      });
      return;
    }

    if (permissions.length === 0) {
      toast({
        title: "Permissions required",
        description: "Please select at least one permission.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name: roleName,
      description: description || "",
      permissions,
    };

    if (role) {
      updateRoleMutation.mutate(data);
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const isPending = createRoleMutation.isPending || updateRoleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {role ? "Edit Role" : "Create New Role"}
          </DialogTitle>
          <DialogDescription>
            {role ? "Update role permissions and settings" : "Define permissions for a new role"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Name */}
          <div>
            <Label htmlFor="role-name">
              Role Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role-name"
              placeholder="e.g., Customer Support Agent"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              data-testid="input-role-name"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of this role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-role-description"
            />
          </div>

          {/* Permissions */}
          <div>
            <Label className="mb-3 block">
              Permissions <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border border-border">
              {availablePermissions.map((perm) => (
                <div key={perm.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={perm.id}
                    checked={permissions.includes(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                    data-testid={`checkbox-${perm.id}`}
                  />
                  <label
                    htmlFor={perm.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {perm.label}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {permissions.length} permission{permissions.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              data-testid="button-cancel-role"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending} data-testid="button-save-role">
              {isPending ? "Saving..." : role ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
