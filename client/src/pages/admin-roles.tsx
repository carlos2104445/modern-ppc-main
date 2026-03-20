import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Shield, Trash2 } from "lucide-react";
import { RoleEditorDialog } from "@/components/role-editor-dialog";
import { StaffEditorDialog } from "@/components/staff-editor-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Role, StaffMember, User } from "@shared/schema";

export default function AdminRoles() {
  const { toast } = useToast();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [selectedStaff, setSelectedStaff] = useState<
    (StaffMember & { user: User; role: Role }) | undefined
  >(undefined);

  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const { data: staffMembers = [], isLoading: staffLoading } = useQuery<StaffMember[]>({
    queryKey: ["/api/staff"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return await apiRequest(`/api/roles/${roleId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Role deleted",
        description: "Role has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      return await apiRequest(`/api/staff/${staffId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Staff member removed",
        description: "Staff member has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove staff member",
        variant: "destructive",
      });
    },
  });

  const staffWithDetails = staffMembers
    .map((staff) => {
      const user = users.find((u) => u.id === staff.userId);
      const role = roles.find((r) => r.id === staff.roleId);
      return {
        ...staff,
        user: user!,
        role: role!,
      };
    })
    .filter((s) => s.user && s.role);

  const getRoleUserCount = (roleId: string) => {
    return staffMembers.filter((s) => s.roleId === roleId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage staff roles and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedRole(undefined);
              setRoleDialogOpen(true);
            }}
            data-testid="button-create-role"
          >
            <Shield className="h-4 w-4 mr-2" />
            Create Role
          </Button>
          <Button
            onClick={() => {
              setSelectedStaff(undefined);
              setStaffDialogOpen(true);
            }}
            data-testid="button-add-staff"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Roles</h2>
          {rolesLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">Loading roles...</p>
              </CardContent>
            </Card>
          ) : roles.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  No roles found. Create your first role to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            roles.map((role) => (
              <Card key={role.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.description || "No description"}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {getRoleUserCount(role.id)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((perm, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {perm.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedRole(role);
                        setRoleDialogOpen(true);
                      }}
                      data-testid={`button-edit-role-${role.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
                          deleteRoleMutation.mutate(role.id);
                        }
                      }}
                      disabled={deleteRoleMutation.isPending}
                      data-testid={`button-delete-role-${role.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Staff Members</h2>
          {staffLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">Loading staff members...</p>
              </CardContent>
            </Card>
          ) : staffWithDetails.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  No staff members found. Add your first staff member to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            staffWithDetails.map((member) => (
              <Card key={member.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{member.user.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{member.user.email}</p>
                    </div>
                    <Badge variant={member.status === "active" ? "default" : "outline"}>
                      {member.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.role.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedStaff(member);
                        setStaffDialogOpen(true);
                      }}
                      data-testid={`button-edit-staff-${member.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to remove ${member.user.fullName} from staff?`
                          )
                        ) {
                          deleteStaffMutation.mutate(member.id);
                        }
                      }}
                      disabled={deleteStaffMutation.isPending}
                      data-testid={`button-remove-staff-${member.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <RoleEditorDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={selectedRole}
      />

      <StaffEditorDialog
        open={staffDialogOpen}
        onOpenChange={setStaffDialogOpen}
        staff={selectedStaff}
      />
    </div>
  );
}
