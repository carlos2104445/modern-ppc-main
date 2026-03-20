import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star } from "lucide-react";
import { SubscriptionPaymentDialog } from "@/components/subscription-payment-dialog";

export default function Subscription() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Current subscription (mock data)
  const currentSubscription = {
    plan: "Free",
    status: "active",
    expiresAt: null,
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "ETB 0",
      period: "forever",
      icon: Star,
      description: "Perfect for getting started",
      features: [
        "View up to 10 ads per day",
        "Basic campaign creation",
        "Standard support",
        "Basic analytics",
        "Community access",
      ],
      current: currentSubscription.plan === "Free",
    },
    {
      id: "premium",
      name: "Premium",
      price: "ETB 29",
      period: "per month",
      icon: Zap,
      description: "For serious earners and advertisers",
      features: [
        "Unlimited ad views",
        "Advanced campaign creation",
        "Priority support",
        "Advanced analytics",
        "Early access to new features",
        "5% bonus on earnings",
        "Remove platform fees",
      ],
      popular: true,
      current: currentSubscription.plan === "Premium",
    },
    {
      id: "business",
      name: "Business",
      price: "ETB 99",
      period: "per month",
      icon: Crown,
      description: "For agencies and power users",
      features: [
        "Everything in Premium",
        "Dedicated account manager",
        "Custom campaign strategies",
        "API access",
        "White-label options",
        "10% bonus on earnings",
        "Advanced targeting options",
        "Bulk campaign management",
      ],
      current: currentSubscription.plan === "Business",
    },
  ];

  const handleSelectPlan = (plan: any) => {
    if (plan.id === "free") {
      // Free plan - no payment needed
      console.log("Switching to free plan");
      return;
    }
    setSelectedPlan(plan);
    setPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and billing</p>
      </div>

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold" data-testid="text-current-plan-name">
                  {currentSubscription.plan}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-chart-2/20"
                  data-testid="badge-subscription-status"
                >
                  {currentSubscription.status}
                </Badge>
              </div>
              <p
                className="text-sm text-muted-foreground mt-1"
                data-testid="text-subscription-details"
              >
                {currentSubscription.plan === "Free"
                  ? "Upgrade to unlock more features"
                  : `Renews on ${currentSubscription.expiresAt || "Never"}`}
              </p>
            </div>
            {currentSubscription.plan !== "Free" && (
              <Button variant="outline" data-testid="button-manage-subscription">
                Manage Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-primary border-2" : ""} ${plan.current ? "bg-muted/30" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon
                      className={`h-8 w-8 ${plan.current ? "text-primary" : "text-muted-foreground"}`}
                    />
                    {plan.current && (
                      <Badge variant="outline" className="bg-chart-2/20">
                        Current
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl" data-testid={`text-plan-name-${plan.id}`}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription data-testid={`text-plan-description-${plan.id}`}>
                    {plan.description}
                  </CardDescription>
                  <div className="pt-4">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-3xl font-bold"
                        data-testid={`text-plan-price-${plan.id}`}
                      >
                        {plan.price}
                      </span>
                      <span
                        className="text-sm text-muted-foreground"
                        data-testid={`text-plan-period-${plan.id}`}
                      >
                        /{plan.period}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={plan.current}
                    data-testid={`button-select-plan-${plan.id}`}
                  >
                    {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Manage your payment methods and billing history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Payment Method</p>
              <p className="text-sm text-muted-foreground" data-testid="text-payment-method">
                {currentSubscription.plan === "Free"
                  ? "No payment method on file"
                  : "Wallet Balance"}
              </p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-update-payment">
              Update
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help with your subscription?{" "}
              <Button variant="ghost" className="h-auto p-0" data-testid="link-contact-support">
                Contact Support
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>

      {selectedPlan && (
        <SubscriptionPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          plan={selectedPlan}
        />
      )}
    </div>
  );
}
