import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Link } from "wouter";

export function AdminHeader() {
  const { logout, getAdminUser } = useAdminAuth();
  const adminUser = getAdminUser();

  const notificationCount = 3;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  data-testid="badge-notification-count"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem
                className="flex flex-col items-start gap-1 p-3"
                data-testid="notification-item-1"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">New withdrawal request</span>
                  <span className="text-xs text-muted-foreground">2m ago</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  User #1234 requested ETB 500 withdrawal
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex flex-col items-start gap-1 p-3"
                data-testid="notification-item-2"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">KYC document submitted</span>
                  <span className="text-xs text-muted-foreground">15m ago</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  New KYC verification pending review
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex flex-col items-start gap-1 p-3"
                data-testid="notification-item-3"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">Support ticket escalated</span>
                  <span className="text-xs text-muted-foreground">1h ago</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Ticket #567 requires immediate attention
                </span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-primary"
              data-testid="button-view-all-notifications"
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Admin Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              data-testid="button-admin-profile"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={adminUser?.avatarUrl} alt={adminUser?.fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {adminUser ? getInitials(adminUser.fullName) : "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex sm:flex-col sm:items-start">
                <span className="text-sm font-medium">{adminUser?.fullName || "Admin"}</span>
                <span className="text-xs text-muted-foreground">
                  {adminUser?.role === "admin" ? "Administrator" : "Staff"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-testid="menu-item-profile">
              <Link href="/admin/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild data-testid="menu-item-settings">
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
              data-testid="menu-item-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
