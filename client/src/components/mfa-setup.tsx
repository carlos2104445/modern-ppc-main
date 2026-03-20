import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MFASetupProps {
  onComplete?: () => void;
}

export function MFASetup({ onComplete }: MFASetupProps) {
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [secret, setSecret] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to setup MFA");
      }

      const data = await response.json();
      setSecret(data.secret);
      setQrCode(data.qrCode);
      setStep("verify");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to setup MFA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (token.length !== 6) {
      toast({
        title: "Invalid Token",
        description: "Please enter a 6-digit token",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/mfa/enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ secret, token }),
      });

      if (!response.ok) {
        throw new Error("Invalid MFA token");
      }

      toast({
        title: "Success",
        description: "MFA has been enabled successfully",
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify MFA token",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "setup") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication (2FA) adds an additional layer of security to your account
              by requiring a verification code from your authenticator app in addition to your
              password.
            </p>
            <Button onClick={handleSetup} disabled={loading}>
              {loading ? "Setting up..." : "Start Setup"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan QR Code</CardTitle>
        <CardDescription>Use your authenticator app to scan this QR code</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <img src={qrCode} alt="QR Code" className="w-64 h-64" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Or enter this code manually:</p>
            <code className="block p-2 bg-muted rounded text-sm font-mono break-all">{secret}</code>
          </div>

          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium">
              Enter the 6-digit code from your authenticator app:
            </label>
            <Input
              id="token"
              type="text"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setStep("setup")} variant="outline" disabled={loading}>
              Back
            </Button>
            <Button
              onClick={handleVerify}
              disabled={loading || token.length !== 6}
              className="flex-1"
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
