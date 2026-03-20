import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { Megaphone, Menu, X, ShieldCheck } from "lucide-react";

export default function GDPR() {
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
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              General Data Protection Regulation (GDPR) Statement
            </h1>
            <p className="text-lg text-muted-foreground">Last Updated: October 15, 2025</p>
            <p className="text-lg text-muted-foreground mt-2">
              This statement is for users accessing our service from the European Economic Area
              (EEA).
            </p>
          </div>
        </section>

        {/* GDPR Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mt-12 mb-4">1. Our Commitment</h2>
              <p>
                While our operations are based in Ethiopia, we are committed to protecting the
                privacy of all our users. For users from the EEA, we process your personal data in
                compliance with the principles of the General Data Protection Regulation (GDPR).
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">2. Lawful Basis for Processing</h2>
              <p>
                We process your personal data based on your consent. By using our service and
                agreeing to our Privacy Policy and Terms of Service, you are giving us your explicit
                consent to process your personal data for the purposes outlined in those documents.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">3. Your Rights Under GDPR</h2>
              <p>As a user from the EEA, you have certain rights concerning your personal data:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>The right to access, update, or delete the information we have on you.</li>
                <li>The right of rectification.</li>
                <li>The right to object.</li>
                <li>The right of restriction.</li>
                <li>The right to data portability.</li>
                <li>The right to withdraw consent.</li>
              </ul>
              <p className="mt-4">To exercise any of these rights, please contact us.</p>

              <h2 className="text-2xl font-bold mt-12 mb-4">
                4. International Data Transfers and Third-Party Sharing
              </h2>
              <p>
                Please be aware that your information may be transferred to, stored, and processed
                in Ethiopia, where our servers are located and our central database is operated. The
                data protection laws of Ethiopia may differ from those of your country of residence.
              </p>
              <p className="mt-4">
                Furthermore, as stated in our Privacy Policy, your data may be shared with third
                parties who assist us in providing our service. By using our service, you consent to
                these data transfers and sharing arrangements.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">5. Contact Us</h2>
              <p>
                If you have any questions about this GDPR Statement or our data practices, please
                contact us.
              </p>
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
