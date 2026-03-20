import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Menu, X, Target, Users, Shield, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import teamImage from "@assets/stock_images/professional_busines_015d88a0.jpg";
import networkImage from "@assets/stock_images/network_connection_p_7d08762e.jpg";

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const values = [
    {
      icon: Target,
      title: "Mission Driven",
      description:
        "Connecting advertisers with engaged audiences while creating earning opportunities for everyone.",
    },
    {
      icon: Users,
      title: "User First",
      description:
        "Every decision we make puts our users at the center, ensuring the best experience possible.",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "Bank-level security and transparent operations to protect your data and earnings.",
    },
    {
      icon: TrendingUp,
      title: "Continuous Growth",
      description: "Constantly innovating and improving our platform to deliver better results.",
    },
  ];

  const stats = [
    { value: "2019", label: "Founded" },
    { value: "50+", label: "Team Members" },
    { value: "100K+", label: "Active Users" },
    { value: "ETB 2M+", label: "Paid Out" },
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
              <Link href="/about">
                <a className="text-sm font-medium hover:text-primary transition-colors">About</a>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">About AdConnect</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We're building the future of digital advertising by creating a platform where
                everyone wins - advertisers reach their audience, and users earn money for their
                attention.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <img src={teamImage} alt="Our Team" className="rounded-lg shadow-xl" />
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-bold">Our Story</h2>
                <p className="text-lg text-muted-foreground">
                  Founded in 2019, AdConnect started with a simple idea: what if people could earn
                  money for the ads they already see every day? We believed there had to be a better
                  way to connect advertisers with audiences.
                </p>
                <p className="text-lg text-muted-foreground">
                  Today, we're proud to serve over 100,000 active users and have paid out millions
                  in earnings. Our platform has become the trusted choice for both advertisers
                  looking to reach engaged audiences and individuals seeking to earn passive income.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6">
                    <value.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                  <p className="text-sm md:text-base opacity-90">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold">Our Vision</h2>
                <p className="text-lg text-muted-foreground">
                  We envision a world where digital advertising is mutually beneficial for everyone
                  involved. Advertisers get genuine engagement, users are rewarded for their time
                  and attention, and the entire ecosystem becomes more transparent and fair.
                </p>
                <p className="text-lg text-muted-foreground">
                  Through innovation and user-focused design, we're making this vision a reality,
                  one click at a time.
                </p>
              </div>
              <div>
                <img src={networkImage} alt="Network Connection" className="rounded-lg shadow-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">Join Us on This Journey</h2>
            <p className="text-xl text-muted-foreground">
              Be part of the advertising revolution. Start earning or advertising today.
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 h-12">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AdConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
