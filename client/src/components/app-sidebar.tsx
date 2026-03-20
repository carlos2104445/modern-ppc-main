import {
  LayoutDashboard,
  MousePointerClick,
  Megaphone,
  Wallet,
  Users,
  HelpCircle,
  Settings,
  ShieldCheck,
  UserCog,
  BadgeDollarSign,
  TicketIcon,
  MessageSquare,
  CreditCard,
  FileText,
  LogOut,
  GitBranch,
  ChevronDown,
  Package,
  Shield,
  Trophy,
  Target,
  Star,
  Activity,
  AlertTriangle,
  BarChart3,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const userMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Earn Money", url: "/earn", icon: MousePointerClick },
  { title: "Campaigns", url: "/campaigns", icon: Megaphone },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Referrals", url: "/referrals", icon: Users },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Leaderboards", url: "/leaderboards", icon: Trophy },
  { title: "Challenges", url: "/challenges", icon: Target },
  { title: "Levels", url: "/levels", icon: Star },
  { title: "Upgrades", url: "/upgrades", icon: Zap },
  { title: "Support", url: "/support", icon: HelpCircle },
  { title: "Subscription", url: "/subscription", icon: CreditCard },
  { title: "Payment Methods", url: "/payment-methods", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminMenuSections = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "User Management",
    items: [
      { title: "Customers", url: "/admin/customers", icon: Users },
      { title: "KYC Management", url: "/admin/kyc", icon: ShieldCheck },
      { title: "Roles & Staff", url: "/admin/roles", icon: UserCog },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Ad Management", url: "/admin/ads", icon: Megaphone },
      { title: "Admin Campaigns", url: "/admin/campaigns", icon: Megaphone },
      { title: "Blog", url: "/admin/blog", icon: FileText },
      { title: "FAQs", url: "/admin/faqs", icon: HelpCircle },
    ],
  },
  {
    label: "Financial",
    items: [
      { title: "Financials", url: "/admin/financials", icon: BadgeDollarSign },
      { title: "Subscription Plans", url: "/admin/subscription-plans", icon: Package },
      { title: "Referral Settings", url: "/admin/referral-settings", icon: GitBranch },
    ],
  },
  {
    label: "Support",
    items: [
      { title: "Support Tickets", url: "/admin/tickets", icon: TicketIcon },
      { title: "Communications", url: "/admin/communications", icon: MessageSquare },
    ],
  },
  {
    label: "Analytics & Security",
    items: [
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
      { title: "Fraud Detection", url: "/admin/fraud-detection", icon: AlertTriangle },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Health Monitor", url: "/admin/health", icon: Activity },
      { title: "Audit Logs", url: "/admin/audit-logs", icon: Shield },
    ],
  },
];

interface AppSidebarProps {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  const [location] = useLocation();
  const { logout: adminLogout, getAdminUser } = useAdminAuth();
  const { logout: userLogout, getCurrentUser } = useUserAuth();
  const adminUser = isAdmin ? getAdminUser() : null;
  const currentUser = !isAdmin ? getCurrentUser() : null;

  // Track which sections are open (default all open)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    adminMenuSections.reduce(
      (acc, section) => {
        acc[section.label] = true;
        return acc;
      },
      {} as Record<string, boolean>
    )
  );

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Megaphone className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AdConnect</h2>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Admin Panel" : "User Dashboard"}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isAdmin ? (
          // Admin menu with collapsible sections
          <>
            {adminMenuSections.map((section) => (
              <Collapsible
                key={section.label}
                open={openSections[section.label]}
                onOpenChange={() => toggleSection(section.label)}
              >
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel
                      className="group/label flex w-full items-center justify-between hover-elevate active-elevate-2 cursor-pointer rounded-md px-2 py-2"
                      data-testid={`button-toggle-${section.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <span>{section.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openSections[section.label] ? "" : "-rotate-90"}`}
                      />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={location === item.url}>
                              <Link
                                href={item.url}
                                data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ))}
          </>
        ) : (
          // User menu (no collapsible sections)
          <SidebarGroup>
            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link
                        href={item.url}
                        data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt="User" />
            <AvatarFallback>
              {isAdmin && adminUser
                ? adminUser.fullName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : currentUser
                  ? `${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}`.toUpperCase()
                  : "JD"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {isAdmin && adminUser
                ? adminUser.fullName
                : currentUser
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : "John Doe"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {isAdmin ? "Administrator" : "Premium Member"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={isAdmin ? adminLogout : userLogout}
            data-testid="button-logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
