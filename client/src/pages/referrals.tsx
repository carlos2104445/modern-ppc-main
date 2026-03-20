import { useState, useEffect } from "react";
import { ReferralTree } from "@/components/referral-tree";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, UserPlus, Copy, Loader2 } from "lucide-react";
import { InviteReferralDialog } from "@/components/invite-referral-dialog";
import { useAuth } from "@/hooks/use-auth-context";
import { useToast } from "@/hooks/use-toast";

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReferrals() {
      try {
        const res = await fetch("/api/v1/user/referrals", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setReferralData(data);
        }
      } catch (err) {
        console.error("Failed to fetch referral data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchReferrals();
  }, [user]);

  const copyReferralCode = () => {
    const code = referralData?.referralCode || user?.referralCode || "";
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Referral code ${code} copied to clipboard` });
  };

  const referralCode = referralData?.referralCode || user?.referralCode || "—";
  const totalReferrals = referralData?.totalReferrals || 0;
  const totalCommission = referralData?.totalCommission || "0.00";

  // Build referral tree from flat referral list
  const referrals = (referralData?.referrals || []).map((r: any, i: number) => ({
    id: r.id,
    name: r.name,
    earnings: `ETB ${parseFloat(r.earnings || "0").toFixed(2)}`,
    level: 1,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Referrals</h1>
          <p className="text-muted-foreground mt-1">Track your referral network and earnings</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} data-testid="button-invite-referral">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Friends
        </Button>
      </div>

      {/* Referral Code Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Referral Code</p>
              <p className="text-3xl font-mono font-bold mt-1">{referralCode}</p>
            </div>
            <Button variant="outline" onClick={copyReferralCode}>
              <Copy className="h-4 w-4 mr-2" /> Copy Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Referrals"
          value={totalReferrals.toString()}
          description="Direct referrals"
          icon={Users}
        />
        <StatCard
          title="Commission Earned"
          value={`ETB ${totalCommission}`}
          description="Lifetime commissions"
          icon={DollarSign}
        />
        <StatCard
          title="This Month"
          value={`ETB ${totalCommission}`}
          description="Current month earnings"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReferralTree referrals={referrals} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Commission Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <div>
                  <p className="font-semibold">Level 1</p>
                  <p className="text-sm text-muted-foreground">Direct referrals</p>
                </div>
                <p className="text-lg font-bold text-primary">10%</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-chart-3/10">
                <div>
                  <p className="font-semibold">Level 2</p>
                  <p className="text-sm text-muted-foreground">Indirect referrals</p>
                </div>
                <p className="text-lg font-bold text-chart-3">5%</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-chart-4/10">
                <div>
                  <p className="font-semibold">Level 3</p>
                  <p className="text-sm text-muted-foreground">Extended network</p>
                </div>
                <p className="text-lg font-bold text-chart-4">2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <InviteReferralDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </div>
  );
}
