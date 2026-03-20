import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Megaphone } from "lucide-react";

export default function Privacy() {
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground mt-2">Last updated: October 16, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                AdConnect ("we," "our," or "us") is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our Platform. Please read this policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">2.1 Personal Information</h3>
                  <p className="text-muted-foreground mb-2">When you register, we collect:</p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Full name (first and last name)</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Username</li>
                    <li>Date of birth (optional)</li>
                    <li>Password (encrypted)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">2.2 KYC Information</h3>
                  <p className="text-muted-foreground mb-2">
                    For verification purposes, we may collect:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Government-issued identification documents</li>
                    <li>Proof of address</li>
                    <li>Selfie photos for identity verification</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">2.3 Financial Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Payment method details (processed securely by payment providers)</li>
                    <li>Transaction history</li>
                    <li>Bank account information for withdrawals</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">2.4 Usage Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent on the Platform</li>
                    <li>Ad viewing and clicking behavior</li>
                    <li>Campaign performance data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage your account</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Send administrative notifications and updates</li>
                <li>Respond to customer support requests</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Comply with legal obligations and enforce our Terms</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-3">We may share your information with:</p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium mb-2">4.1 Service Providers</h3>
                  <p className="text-muted-foreground">
                    Third-party vendors who perform services on our behalf (payment processing, KYC
                    verification, email delivery) under strict confidentiality agreements.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">4.2 Legal Requirements</h3>
                  <p className="text-muted-foreground">
                    When required by law, court order, or government authorities, or to protect our
                    rights and safety.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">4.3 Business Transfers</h3>
                  <p className="text-muted-foreground">
                    In connection with a merger, acquisition, or sale of assets, your information
                    may be transferred to the acquiring entity.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">4.4 With Your Consent</h3>
                  <p className="text-muted-foreground">
                    We may share information for other purposes with your explicit consent.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mt-3">
                We do NOT sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-muted-foreground mb-3">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Encryption of sensitive data in transit (SSL/TLS) and at rest</li>
                <li>Secure password hashing using industry best practices</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls limiting employee access to personal data</li>
                <li>Two-factor authentication for account protection</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                However, no method of transmission over the internet is 100% secure. We cannot
                guarantee absolute security but continuously work to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze site traffic and user behavior</li>
                <li>Personalize content and advertisements</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You can control cookie preferences through your browser settings, but disabling
                cookies may limit platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Your Privacy Rights</h2>
              <p className="text-muted-foreground mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Access:</strong> Request a copy of the personal data we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account and personal data
                  (subject to legal obligations)
                </li>
                <li>
                  <strong>Data Portability:</strong> Receive your data in a structured,
                  machine-readable format
                </li>
                <li>
                  <strong>Opt-out:</strong> Unsubscribe from marketing communications at any time
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Revoke consent for data processing where
                  applicable
                </li>
              </ul>
              <p className="text-muted-foreground mt-3">
                To exercise these rights, contact us at privacy@adconnect.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your information for as long as your account is active or as needed to
                provide services. After account deletion, we may retain certain information for
                legal compliance, fraud prevention, and resolving disputes. Financial transaction
                records are retained for 7 years as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Platform is not intended for users under 18 years of age. We do not knowingly
                collect personal information from children. If we discover we have collected
                information from a child, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than
                Ethiopia. We ensure appropriate safeguards are in place to protect your data in
                accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically. Material changes will be notified
                via email or prominent notice on the Platform. Your continued use after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground mb-3">
                If you have questions or concerns about this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="mt-3 p-4 bg-muted rounded-lg">
                <p className="font-medium">AdConnect Privacy Team</p>
                <p className="text-muted-foreground">Email: privacy@adconnect.com</p>
                <p className="text-muted-foreground">Address: Addis Ababa, Ethiopia</p>
                <p className="text-muted-foreground mt-2">Response time: Within 48 hours</p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground">
                By using AdConnect, you acknowledge that you have read and understood this Privacy
                Policy and consent to our data practices as described.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/terms">
            <Button variant="outline" data-testid="link-terms-of-service">
              View Terms of Service
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
