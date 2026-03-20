import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { Megaphone, Menu, X, FileText } from "lucide-react";

export default function TermsOfService() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <Link href="/blog">
                <a className="text-sm font-medium hover:text-primary transition-colors">Blog</a>
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
                <div className="flex gap-2 pt-3 border-t border-border mt-3">
                  <Link href="/signin">
                    <Button variant="ghost" size="sm" className="flex-1">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="flex-1">
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
        <section className="py-16 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">Last Updated: October 15, 2025</p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg">
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before
                using our web application (the "Service").
              </p>
              <p className="mt-4">
                Your access to and use of the Service is conditioned on your acceptance of and
                compliance with these Terms. These Terms apply to all visitors, users, and others
                who access or use the Service.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms. If you
                disagree with any part of the terms, then you may not access the Service.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">2. Use of Service</h2>
              <p>
                You agree to use the Service only for lawful purposes and in a way that does not
                infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the
                Service.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">3. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will
                remain the exclusive property of the company and its licensors.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">4. No Refund Policy</h2>
              <p>
                All purchases and payments made through the Service are final and non-refundable. We
                do not issue refunds or credits for any reason. By making a purchase, you
                acknowledge and agree to this no-refund policy.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">5. Limitation of Liability</h2>
              <p>
                In no event shall the company, nor its directors, employees, partners, agents,
                suppliers, or affiliates, be liable for any indirect, incidental, special,
                consequential, or punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses, resulting from your access to or
                use of or inability to access or use the Service.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">6. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of Ethiopia,
                without regard to its conflict of law provisions.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">7. Changes</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at
                any time. We will provide at least 30 days' notice prior to any new terms taking
                effect. What constitutes a material change will be determined at our sole
                discretion.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">8. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">AdConnect</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering advertisers and earners worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/landing#features">
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Features
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/pricing">
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Pricing
                    </a>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about">
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      About
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/blog">
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Blog
                    </a>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy">
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Privacy Policy
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service">
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Terms of Service
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy">
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Cookie Policy
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/gdpr">
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      GDPR
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground text-center">
              &copy; 2024 AdConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
