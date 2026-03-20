import { Switch, Route, useLocation, Router } from "wouter";
import React, { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminHeader } from "@/components/admin-header";
import { NotificationsBell } from "@/components/notifications-bell";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useUserAuth } from "@/hooks/use-user-auth";

const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/landing"));
const Pricing = lazy(() => import("@/pages/pricing"));
const About = lazy(() => import("@/pages/about"));
const SignIn = lazy(() => import("@/pages/signin"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Earn = lazy(() => import("@/pages/earn"));
const Campaigns = lazy(() => import("@/pages/campaigns"));
const Wallet = lazy(() => import("@/pages/wallet"));
const Referrals = lazy(() => import("@/pages/referrals"));
const Support = lazy(() => import("@/pages/support"));
const Settings = lazy(() => import("@/pages/settings"));
const Subscription = lazy(() => import("@/pages/subscription"));
const PaymentMethods = lazy(() => import("@/pages/payment-methods"));
const Achievements = lazy(() => import("@/pages/achievements"));
const Leaderboards = lazy(() => import("@/pages/leaderboards"));
const Challenges = lazy(() => import("@/pages/challenges"));
const Levels = lazy(() => import("@/pages/levels"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const AdminCustomers = lazy(() => import("@/pages/admin-customers"));
const AdminCustomersEnhanced = lazy(() => import("@/pages/admin-customers-enhanced"));
const AdminKYC = lazy(() => import("@/pages/admin-kyc"));
const AdminRoles = lazy(() => import("@/pages/admin-roles"));
const AdminAds = lazy(() => import("@/pages/admin-ads"));
const AdminFinancials = lazy(() => import("@/pages/admin-financials"));
const AdminReferralSettings = lazy(() => import("@/pages/admin-referral-settings"));
const AdminSubscriptionPlans = lazy(() => import("@/pages/admin/subscription-plans"));
const AdminTickets = lazy(() => import("@/pages/admin-tickets"));
const AdminCommunications = lazy(() => import("@/pages/admin-communications"));
const AdminBlog = lazy(() => import("@/pages/admin-blog"));
const AdminCampaigns = lazy(() => import("@/pages/admin-campaigns"));
const Blog = lazy(() => import("@/pages/blog"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const CookiePolicy = lazy(() => import("@/pages/cookie-policy"));
const GDPR = lazy(() => import("@/pages/gdpr"));
const FAQs = lazy(() => import("@/pages/faqs"));
const AdminFAQs = lazy(() => import("@/pages/admin-faqs"));
const AdminAuditLogs = lazy(() => import("@/pages/admin/audit-logs"));
const AdminGoals = lazy(() => import("@/pages/admin-goals"));
const AdminAchievements = lazy(() => import("@/pages/admin-achievements"));
const AdminFraudDetection = lazy(() => import("@/pages/admin-fraud-detection"));
const AdminAnalytics = lazy(() => import("@/pages/admin-analytics"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminPasswordResetRequest = lazy(() => import("@/pages/admin-password-reset-request"));
const AdminPasswordResetConfirm = lazy(() => import("@/pages/admin-password-reset-confirm"));
const Health = lazy(() => import("@/pages/health"));
const AdminHealth = lazy(() => import("@/pages/admin-health"));
const ChapaPayments = lazy(() => import("@/pages/chapa-payments"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const MaintenancePage = lazy(() => import("@/pages/maintenance"));
const Security = lazy(() => import("@/pages/security"));
const AdminGDPR = lazy(() => import("@/pages/admin-gdpr"));
const AdTrack = lazy(() => import("@/pages/ad-track"));
const Upgrades = lazy(() => import("@/pages/upgrades"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function AppContent() {
  const [location] = useLocation();
  useAdminAuth();
  useUserAuth();
  const isPublicRoute =
    location === "/" ||
    location === "/landing" ||
    location === "/signin" ||
    location === "/login" ||
    location === "/register" ||
    location === "/pricing" ||
    location === "/about" ||
    location === "/blog" ||
    location === "/privacy-policy" ||
    location === "/terms-of-service" ||
    location === "/cookie-policy" ||
    location === "/gdpr" ||
    location === "/faqs" ||
    location === "/health" ||
    location === "/admin/login" ||
    location === "/admin/password-reset-request" ||
    location === "/admin/password-reset-confirm" ||
    location === "/payment/success" ||
    location === "/maintenance" ||
    location.startsWith("/ad-track/");
  const isAdminRoute = location.startsWith("/admin");

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isPublicRoute) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/landing" component={Landing} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/about" component={About} />
          <Route path="/blog" component={Blog} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route path="/gdpr" component={GDPR} />
          <Route path="/faqs" component={FAQs} />
          <Route path="/health" component={Health} />
          <Route path="/signin" component={SignIn} />
          <Route path="/login">{() => { window.location.replace("/signin"); return null; }}</Route>
          <Route path="/register" component={Register} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/password-reset-request" component={AdminPasswordResetRequest} />
          <Route path="/admin/password-reset-confirm" component={AdminPasswordResetConfirm} />
          <Route path="/payment/success" component={PaymentSuccess} />
          <Route path="/maintenance" component={MaintenancePage} />
          <Route path="/ad-track/:token" component={AdTrack} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar isAdmin={isAdminRoute} />
        <div className="flex flex-col flex-1">
          {isAdminRoute ? (
            <AdminHeader />
          ) : (
            <header className="flex items-center justify-between border-b border-border p-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <NotificationsBell />
                <ThemeToggle />
              </div>
            </header>
          )}
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<LoadingFallback />}>
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/earn" component={Earn} />
                <Route path="/campaigns" component={Campaigns} />
                <Route path="/wallet" component={Wallet} />
                <Route path="/referrals" component={Referrals} />
                <Route path="/support" component={Support} />
                <Route path="/subscription" component={Subscription} />
                <Route path="/payment-methods" component={PaymentMethods} />
                <Route path="/achievements" component={Achievements} />
                <Route path="/leaderboards" component={Leaderboards} />
                <Route path="/challenges" component={Challenges} />
                <Route path="/levels" component={Levels} />
                <Route path="/upgrades" component={Upgrades} />
                <Route path="/settings" component={Settings} />
                <Route path="/security" component={Security} />
                <Route path="/chapa-payments" component={ChapaPayments} />
                <Route path="/admin/dashboard" component={AdminDashboard} />
                <Route path="/admin/gdpr" component={AdminGDPR} />
                <Route path="/admin/health" component={AdminHealth} />
                <Route path="/admin/customers-enhanced" component={AdminCustomersEnhanced} />
                <Route path="/admin/customers" component={AdminCustomers} />
                <Route path="/admin/kyc" component={AdminKYC} />
                <Route path="/admin/roles" component={AdminRoles} />
                <Route path="/admin/ads" component={AdminAds} />
                <Route path="/admin/financials" component={AdminFinancials} />
                <Route path="/admin/subscription-plans" component={AdminSubscriptionPlans} />
                <Route path="/admin/referral-settings" component={AdminReferralSettings} />
                <Route path="/admin/tickets" component={AdminTickets} />
                <Route path="/admin/communications" component={AdminCommunications} />
                <Route path="/admin/campaigns" component={AdminCampaigns} />
                <Route path="/admin/blog" component={AdminBlog} />
                <Route path="/admin/faqs" component={AdminFAQs} />
                <Route path="/admin/audit-logs" component={AdminAuditLogs} />
                <Route path="/admin/goals" component={AdminGoals} />
                <Route path="/admin/achievements" component={AdminAchievements} />
                <Route path="/admin/fraud-detection" component={AdminFraudDetection} />
                <Route path="/admin/analytics" component={AdminAnalytics} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="adconnect-theme">
        <TooltipProvider>
          <Router>
            <AppContent />
          </Router>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
