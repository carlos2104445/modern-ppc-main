import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { Megaphone, Menu, X, Cookie } from "lucide-react";

export default function CookiePolicy() {
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
              <Cookie className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-lg text-muted-foreground">Last Updated: October 15, 2025</p>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg">
                This Cookie Policy explains what cookies are and how we use them on our web
                application. You should read this policy to understand what cookies are, how we use
                them, the types of cookies we use, the information we collect using cookies, and how
                that information is used.
              </p>
              <p className="mt-4">By using our service, you consent to the use of cookies.</p>

              <h2 className="text-2xl font-bold mt-12 mb-4">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your computer or mobile device when
                you visit a website. They allow the website to recognize your device and remember
                some information about your preferences or past actions.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">2. How We Use Cookies</h2>
              <p>We use cookies for a variety of reasons, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  <strong>Essential Cookies:</strong> To operate our service and provide you with
                  basic features.
                </li>
                <li>
                  <strong>Performance Cookies:</strong> To collect information about how you use our
                  website, like which pages you visited and which links you clicked on. This
                  information is aggregated and anonymized and used to help us improve our service.
                </li>
                <li>
                  <strong>Functionality Cookies:</strong> To remember choices you've made in the
                  past, like your language preference.
                </li>
                <li>
                  <strong>Third-Party Cookies:</strong> We may also use various third-party cookies
                  to report usage statistics of the service, deliver advertisements, and so on.
                </li>
              </ul>

              <h2 className="text-2xl font-bold mt-12 mb-4">3. Your Choices Regarding Cookies</h2>
              <p>
                If you'd like to delete cookies or instruct your web browser to delete or refuse
                cookies, please visit the help pages of your web browser. Please note, however, that
                if you delete cookies or refuse to accept them, you might not be able to use all of
                the features we offer, you may not be able to store your preferences, and some of
                our pages might not display properly.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">4. Changes to This Cookie Policy</h2>
              <p>
                We may update our Cookie Policy from time to time. We will notify you of any changes
                by posting the new Cookie Policy on this page.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">5. Contact Us</h2>
              <p>If you have any questions about this Cookie Policy, please contact us.</p>
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
