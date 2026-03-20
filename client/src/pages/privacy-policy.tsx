import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { Megaphone, Menu, X, Shield } from "lucide-react";

export default function PrivacyPolicy() {
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">Last Updated: October 15, 2025</p>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg">
                This Privacy Policy describes how we collect, use, and handle your personal
                information when you use our web application and services. By using our service, you
                agree to the collection and use of information in accordance with this policy.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">1. Information Collection and Use</h2>
              <p>
                We collect several different types of information for various purposes to provide
                and improve our service to you. This may include, but is not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Personal identification information (Name, email address, etc.)</li>
                <li>
                  Usage Data (such as your browser type, browser version, the pages of our service
                  that you visit, the time and date of your visit, the time spent on those pages,
                  unique device identifiers, and other diagnostic data).
                </li>
              </ul>

              <h2 className="text-2xl font-bold mt-12 mb-4">2. Use of Data</h2>
              <p>The data we collect is used in various ways, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>To provide and maintain our service.</li>
                <li>To notify you about changes to our service.</li>
                <li>To provide customer support.</li>
                <li>
                  To gather analysis or valuable information so that we can improve our service.
                </li>
                <li>To monitor the usage of our service.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-12 mb-4">3. Sharing Data with Third Parties</h2>
              <p>
                We may share your data with third-party companies and individuals to facilitate our
                service ("Service Providers"), to provide the service on our behalf, to perform
                service-related services, or to assist us in analyzing how our service is used.
              </p>
              <p className="mt-4">
                These third parties have access to your Personal Data only to perform these tasks on
                our behalf and are obligated not to disclose or use it for any other purpose. By
                using our service, you agree to this sharing of information.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">4. Data Security</h2>
              <p>
                The security of your data is important to us. We use industry-grade security
                measures and protections to prevent unauthorized access, use, or disclosure of your
                personal information. However, remember that no method of transmission over the
                Internet or method of electronic storage is 100% secure.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">5. Governing Law</h2>
              <p>
                This Privacy Policy is governed and construed in accordance with the laws of
                Ethiopia, without regard to its conflict of law provisions.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">6. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page. You are advised to review
                this Privacy Policy periodically for any changes.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">7. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us.</p>
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
