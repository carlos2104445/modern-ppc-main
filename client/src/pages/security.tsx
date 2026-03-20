import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MFASetup } from "@/components/mfa-setup";

export default function Security() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and two-factor authentication
        </p>
      </div>

      <MFASetup />

      <Card>
        <CardHeader>
          <CardTitle>Security Tips</CardTitle>
          <CardDescription>Keep your account secure with these best practices</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Use a strong, unique password for your account</li>
            <li>• Enable two-factor authentication for extra security</li>
            <li>• Never share your password or MFA codes with anyone</li>
            <li>• Regularly review your account activity</li>
            <li>• Keep your email address and phone number up to date</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
