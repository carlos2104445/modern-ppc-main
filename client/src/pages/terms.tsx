import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Megaphone } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/register">
            <Button variant="ghost" className="mb-4" data-testid="button-back-to-signup">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Signup
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Megaphone className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">AdConnect</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground mt-2">Last updated: October 16, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using AdConnect ("the Platform"), you accept and agree to be bound
                by the terms and provisions of this agreement. If you do not agree to these terms,
                please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. User Eligibility</h2>
              <p className="text-muted-foreground">
                You must be at least 18 years of age to use this Platform. By using AdConnect, you
                represent and warrant that you are at least 18 years old and have the legal capacity
                to enter into this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground mb-3">
                When you create an account with us, you must provide accurate, complete, and current
                information. Failure to do so constitutes a breach of the Terms, which may result in
                immediate termination of your account.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You are responsible for safeguarding your password and account credentials</li>
                <li>You agree not to disclose your password to any third party</li>
                <li>You must notify us immediately of any unauthorized access to your account</li>
                <li>Each user may only maintain one account to prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Platform Services</h2>
              <p className="text-muted-foreground mb-3">AdConnect provides two primary services:</p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium mb-2">4.1 Pay-Per-Click (PPC) Advertising</h3>
                  <p className="text-muted-foreground">
                    Advertisers can create campaigns to promote their content, websites, or videos.
                    Payment is required upfront based on campaign budget and cost-per-click
                    settings.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">4.2 Paid-To-Click (PTC) Earning</h3>
                  <p className="text-muted-foreground">
                    Users can earn money by viewing approved advertisements. Earnings are credited
                    to your wallet and can be withdrawn subject to our withdrawal policies.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Financial Terms</h2>
              <p className="text-muted-foreground mb-3">
                All monetary transactions on the Platform use Ethiopian Birr (ETB).
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium mb-2">5.1 Payments</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Campaign budgets must be funded before ads go live</li>
                    <li>All payments are processed securely through our payment partners</li>
                    <li>Refunds are subject to our refund policy and campaign performance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">5.2 Withdrawals</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Minimum withdrawal amount and processing fees apply</li>
                    <li>All withdrawal requests require manual admin approval for security</li>
                    <li>KYC verification must be completed before first withdrawal</li>
                    <li>Withdrawals are typically processed within 3-5 business days</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. KYC Verification</h2>
              <p className="text-muted-foreground">
                Know Your Customer (KYC) verification is required for certain platform activities,
                including withdrawals. You agree to provide valid government-issued identification
                and other required documents. Failure to complete KYC may result in restricted
                account functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use automated bots or scripts to click ads or manipulate the system</li>
                <li>Create multiple accounts to abuse referral bonuses</li>
                <li>Submit false or misleading information during registration or KYC</li>
                <li>Advertise illegal, harmful, or fraudulent products/services</li>
                <li>Attempt to hack, disrupt, or compromise platform security</li>
                <li>Engage in click fraud or any form of fraudulent activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Account Suspension and Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate accounts that violate these Terms,
                engage in fraudulent activity, or otherwise misuse the Platform. Termination may
                result in forfeiture of account balance if fraudulent activity is confirmed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content, trademarks, and intellectual property on the Platform are owned by
                AdConnect or our licensors. You may not reproduce, distribute, or create derivative
                works without explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                AdConnect is provided "as is" without warranties of any kind. We are not liable for
                any indirect, incidental, or consequential damages arising from your use of the
                Platform. Our total liability shall not exceed the amount you paid to us in the past
                12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. Material changes will be
                notified via email or platform announcement. Your continued use of the Platform
                after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of
                Ethiopia. Any disputes shall be resolved in the courts of Ethiopia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-muted rounded-lg">
                <p className="font-medium">AdConnect Support</p>
                <p className="text-muted-foreground">Email: legal@adconnect.com</p>
                <p className="text-muted-foreground">Address: Addis Ababa, Ethiopia</p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground">
                By using AdConnect, you acknowledge that you have read, understood, and agree to be
                bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/privacy">
            <Button variant="outline" data-testid="link-privacy-policy">
              View Privacy Policy
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
