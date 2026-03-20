import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Megaphone, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

export default function Pricing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "ETB 0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "View up to 10 ads per day",
        "Basic campaign creation",
        "Standard referral commissions",
        "Email support",
        "Basic analytics",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "ETB 29",
      period: "per month",
      description: "Best for serious earners",
      features: [
        "Unlimited ad viewing",
        "Advanced campaign tools",
        "Enhanced referral rates",
        "Priority support",
        "Advanced analytics",
        "API access",
        "Custom withdrawal limits",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Business",
      price: "ETB 99",
      period: "per month",
      description: "For agencies and teams",
      features: [
        "Everything in Pro",
        "Team management",
        "White-label options",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "Advanced fraud protection",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Can I change my plan later?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and cryptocurrency payments.",
    },
    {
      question: "Is there a long-term commitment?",
      answer: "No, all plans are month-to-month. Cancel anytime with no penalties.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee on all paid plans.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/landing">
              <div className="flex items-center gap-2 cursor-pointer hover-elevate px-3 py-2 rounded-md">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">AdConnect</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/landing#features">
                <a className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              </Link>
              <Link href="/pricing">
                <a className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Link href="/signin">
                <Button variant="ghost" data-testid="button-signin-header">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button data-testid="button-register-header">Get Started</Button>
              </Link>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col gap-3">
                <Link href="/landing#features">
                  <a className="text-sm font-medium hover:text-primary transition-colors py-2">
                    Features
                  </a>
                </Link>
                <Link href="/pricing">
                  <a className="text-sm font-medium hover:text-primary transition-colors py-2">
                    Pricing
                  </a>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">Simple, Transparent Pricing</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the perfect plan for your needs. Upgrade or downgrade anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative hover-elevate ${plan.popular ? "border-primary shadow-lg" : ""}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register">
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        data-testid={`button-${plan.name.toLowerCase()}`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="hover-elevate">
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl opacity-90">
              Join thousands of users already earning and advertising on our platform
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 h-12">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AdConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
