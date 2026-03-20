import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StaffMember, Role, User } from "@shared/schema";

interface StaffEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffMember & { user: User; role: Role };
}

export function StaffEditorDialog({ open, onOpenChange, staff }: StaffEditorDialogProps) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState(staff?.userId || "");
  const [selectedRoleId, setSelectedRoleId] = useState(staff?.roleId || "");
  const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive">("active");

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (open && staff) {
      setSelectedUserId(staff.userId);
      setSelectedRoleId(staff.roleId);
      setSelectedStatus(staff.status as "active" | "inactive");
    } else if (open && !staff) {
      setSelectedUserId("");
      setSelectedRoleId("");
      setSelectedStatus("active");
    }
  }, [open, staff]);

  const createStaffMutation = useMutation({
    mutationFn: async (data: { userId: string; roleId: string; status: string }) => {
      return await apiRequest("/api/staff", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Staff member added",
        description: "Staff member has been added successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
      });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (data: { roleId: string; status: string }) => {
      return await apiRequest(`/api/staff/${staff?.id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Staff member updated",
        description: "Staff member has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff member",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!selectedUserId && !staff) {
      toast({
        title: "User required",
        description: "Please select a user.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRoleId) {
      toast({
        title: "Role required",
        description: "Please select a role.",
        variant: "destructive",
      });
      return;
    }

    if (staff) {
      updateStaffMutation.mutate({
        roleId: selectedRoleId,
        status: selectedStatus,
      });
    } else {
      createStaffMutation.mutate({
        userId: selectedUserId,
        roleId: selectedRoleId,
        status: selectedStatus,
      });
    }
  };

  const isPending = createStaffMutation.isPending || updateStaffMutation.isPending;
  const isSaveDisabled = isPending || !selectedRoleId || (!staff && !selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {staff ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {staff ? "Update staff member role and status" : "Assign a role to a user"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Selection (only for new staff) */}
          {!staff && (
            <div>
              <Label htmlFor="user">
                User <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user" data-testid="select-staff-user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger id="role" data-testid="select-staff-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Selection */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(val) => setSelectedStatus(val as "active" | "inactive")}
            >
              <SelectTrigger id="status" data-testid="select-staff-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              data-testid="button-cancel-staff"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaveDisabled} data-testid="button-save-staff">
              {isPending ? "Saving..." : staff ? "Update" : "Add Staff"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
