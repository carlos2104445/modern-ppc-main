import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Mail, Share2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteReferralDialog({ open, onOpenChange }: InviteReferralDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const referralLink = "https://adconnect.app/ref/JD123456";
  const referralCode = "JD123456";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Referral link has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Code copied!",
      description: "Referral code has been copied to clipboard.",
    });
  };

  const handleSendEmail = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    console.log("Sending referral to:", email);
    toast({
      title: "Invitation sent!",
      description: `Referral invitation has been sent to ${email}.`,
    });
    setEmail("");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Join AdConnect",
          text: `Join me on AdConnect and start earning! Use my referral code: ${referralCode}`,
          url: referralLink,
        })
        .catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <DialogDescription>Share your referral link and earn rewards</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Referral Link */}
          <div>
            <Label>Your Referral Link</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono text-sm"
                data-testid="input-referral-link"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                data-testid="button-copy-link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <Label>Your Referral Code</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={referralCode}
                readOnly
                className="font-mono text-sm"
                data-testid="input-referral-code"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                data-testid="button-copy-code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Email Invitation */}
          <div>
            <Label htmlFor="email">Invite via Email</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-invite-email"
              />
              <Button onClick={handleSendEmail} data-testid="button-send-invite">
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>

          {/* Share Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleShare}
            data-testid="button-share-referral"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Referral Link
          </Button>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-1">Referral Rewards</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Earn 10% of your referrals' earnings</li>
              <li>• Get ETB 5 bonus for each new signup</li>
              <li>• Unlimited referrals allowed</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
