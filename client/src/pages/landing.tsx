import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  DollarSign,
  Users,
  Shield,
  TrendingUp,
  Zap,
  Menu,
  X,
  Lock,
  CreditCard,
  Award,
  CheckCircle2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import heroIllustration from "@assets/generated_images/Platform_workflow_hero_illustration_fb2f65e6.png";
import earningImage from "@assets/stock_images/happy_person_earning_4b52f3d3.jpg";
import networkImage from "@assets/stock_images/network_connection_p_7d08762e.jpg";
import teamImage from "@assets/stock_images/professional_busines_015d88a0.jpg";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: DollarSign,
      title: "Earn Money Daily",
      description:
        "View ads and earn real money instantly. Get paid for every click with our transparent reward system.",
    },
    {
      icon: Megaphone,
      title: "Advertise Effectively",
      description:
        "Create targeted campaigns and reach real users. Track performance with detailed analytics.",
    },
    {
      icon: Users,
      title: "Multi-Level Referrals",
      description:
        "Earn commissions from 3 levels of referrals. Build your network and maximize passive income.",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description:
        "Bank-level security with KYC verification. Your funds and data are always protected.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Monitor your earnings and campaign performance with comprehensive dashboards.",
    },
    {
      icon: Zap,
      title: "Instant Withdrawals",
      description:
        "Fast payout processing with multiple withdrawal methods. Get your money when you need it.",
    },
  ];

  const stats = [
    { value: "12,453", label: "Active Users" },
    { value: "ETB 45,678", label: "Paid Out This Month" },
    { value: "342", label: "Active Campaigns" },
    { value: "99.9%", label: "Uptime" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Digital Marketer",
      comment:
        "AdConnect has transformed how I manage my advertising campaigns. The analytics are incredible!",
    },
    {
      name: "Michael Chen",
      role: "Part-time Earner",
      comment:
        "I've earned over ETB 500 in passive income just by viewing ads. It's completely legitimate!",
    },
    {
      name: "Emily Rodriguez",
      role: "E-commerce Owner",
      comment:
        "Best advertising platform I've used. The ROI is amazing and the support team is fantastic.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/landing">
              <div className="flex items-center gap-2 cursor-pointer hover-elevate px-3 py-2 rounded-md">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">AdConnect</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                How It Works
              </a>
              <Link href="/pricing">
                <a className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
              </Link>
              <Link href="/about">
                <a className="text-sm font-medium hover:text-primary transition-colors">About</a>
              </Link>
              <Link href="/blog">
                <a className="text-sm font-medium hover:text-primary transition-colors">Blog</a>
              </Link>
            </nav>

            {/* Desktop Actions */}
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

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col gap-3">
                <a
                  href="#features"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                >
                  How It Works
                </a>
                <Link href="/pricing">
                  <a className="text-sm font-medium hover:text-primary transition-colors py-2">
                    Pricing
                  </a>
                </Link>
                <Link href="/about">
                  <a className="text-sm font-medium hover:text-primary transition-colors py-2">
                    About
                  </a>
                </Link>
                <Link href="/blog">
                  <a className="text-sm font-medium hover:text-primary transition-colors py-2">
                    Blog
                  </a>
                </Link>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/signin">
                    <Button variant="outline" className="w-full" data-testid="button-signin-mobile">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full" data-testid="button-register-mobile">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Earn Money by Viewing Ads or Advertise Your Business
                </h1>
                <p className="text-xl text-muted-foreground">
                  The complete PPC & PTC platform connecting advertisers with engaged users. Earn
                  passive income or grow your business with our powerful advertising tools.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="text-lg px-8 h-12"
                      data-testid="button-get-started-hero"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 h-12"
                      data-testid="button-sign-in-hero"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img
                  src={heroIllustration}
                  alt="Platform Workflow Illustration"
                  className="rounded-lg"
                  data-testid="img-hero-illustration"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center" data-testid={`stat-${index}`}>
                  <p className="text-4xl md:text-5xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm md:text-base text-muted-foreground mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Badges Section */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted & Secure Platform</h2>
              <p className="text-lg text-muted-foreground">
                Your security and trust are our top priorities
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Card className="hover-elevate" data-testid="trust-badge-security">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Bank-Level Security</h3>
                  <p className="text-sm text-muted-foreground">256-bit SSL encryption</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate" data-testid="trust-badge-payment">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">PCI DSS compliant</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate" data-testid="trust-badge-verified">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">KYC Verified</h3>
                  <p className="text-sm text-muted-foreground">All users verified</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate" data-testid="trust-badge-certified">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Certified Platform</h3>
                  <p className="text-sm text-muted-foreground">Industry standards</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose AdConnect?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to earn or advertise in one powerful platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground">
                Simple steps to start earning or advertising
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <img src={earningImage} alt="Earn Money Online" className="rounded-lg shadow-xl" />
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Create Account</h3>
                    <p className="text-muted-foreground">
                      Sign up for free in less than 2 minutes. No credit card required.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Choose Your Path</h3>
                    <p className="text-muted-foreground">
                      Start earning by viewing ads or create targeted advertising campaigns.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Get Results</h3>
                    <p className="text-muted-foreground">
                      Earn money daily or grow your business with real, measurable results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-xl text-muted-foreground">Join thousands of satisfied users</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.comment}"</p>
                    <div className="border-t border-border pt-4">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-muted-foreground">Choose the plan that fits your needs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover-elevate" data-testid="pricing-card-free">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">Free</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold">ETB 0</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-muted-foreground">Perfect for getting started</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">View up to 10 ads/day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Basic referral system</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Standard withdrawal</span>
                    </li>
                  </ul>
                  <Link href="/register">
                    <Button className="w-full" variant="outline" data-testid="button-pricing-free">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-elevate border-primary" data-testid="pricing-card-premium">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Badge className="mb-3" data-testid="badge-popular">
                      Popular
                    </Badge>
                    <h3 className="text-2xl font-bold mb-2">Premium</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold">ETB 29</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-muted-foreground">For serious earners</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Unlimited ad views</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Advanced referral bonuses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Fast withdrawals</span>
                    </li>
                  </ul>
                  <Link href="/register">
                    <Button className="w-full" data-testid="button-pricing-premium">
                      Choose Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="pricing-card-business">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">Business</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold">ETB 99</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-muted-foreground">For advertisers & agencies</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Everything in Premium</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Advanced campaign tools</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Dedicated account manager</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">API access</span>
                    </li>
                  </ul>
                  <Link href="/register">
                    <Button
                      className="w-full"
                      variant="outline"
                      data-testid="button-pricing-business"
                    >
                      Choose Business
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Link href="/pricing">
                <Button variant="ghost" data-testid="button-view-all-pricing">
                  View detailed pricing →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl opacity-90">
              Join thousands of users already earning and advertising on our platform
            </p>
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 h-12"
                data-testid="button-join-cta"
              >
                Join Now - It's Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border">
        <div className="bg-muted/50">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
              {/* Brand */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <Megaphone className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-2xl font-bold">AdConnect</span>
                </div>
                <p className="text-muted-foreground max-w-md">
                  The premier PPC & PTC advertising platform connecting earners and advertisers
                  across Ethiopia. Join thousands of users earning and growing their businesses
                  daily.
                </p>
                <div className="flex gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover-elevate"
                    data-testid="social-facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover-elevate"
                    data-testid="social-twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover-elevate"
                    data-testid="social-linkedin"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover-elevate"
                    data-testid="social-instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Product */}
              <div>
                <h3 className="font-bold text-lg mb-6">Product</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="#features"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="link-footer-features"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <Link href="/pricing">
                      <a
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-footer-pricing"
                      >
                        Pricing
                      </a>
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#how-it-works"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="link-footer-how-it-works"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#testimonials"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="link-footer-testimonials"
                    >
                      Testimonials
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-bold text-lg mb-6">Company</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/about">
                      <a
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-footer-about"
                      >
                        About Us
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog">
                      <a
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-footer-blog"
                      >
                        Blog
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/faqs">
                      <a
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-footer-faqs"
                      >
                        FAQs
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="font-bold text-lg mb-6">Legal</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/privacy-policy">
                      <a
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-footer-privacy"
                      >
                        Privacy Policy
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service">
                      <a
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-footer-terms"
                      >
                        Terms of Service
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookie-policy">
                      <a
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-footer-cookie"
                      >
                        Cookie Policy
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/gdpr">
                      <a
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-footer-gdpr"
                      >
                        GDPR
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; 2024 AdConnect. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>Made with ❤️ in Ethiopia</span>
                <span>ETB Currency</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
