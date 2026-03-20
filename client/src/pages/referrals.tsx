import { useState } from "react";
import { ReferralTree } from "@/components/referral-tree";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, UserPlus } from "lucide-react";
import { InviteReferralDialog } from "@/components/invite-referral-dialog";

export default function Referrals() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const referrals = [
    {
      id: "1",
      name: "Alice Johnson",
      earnings: "ETB 125.50",
      level: 1,
      children: [
        {
          id: "2",
          name: "Bob Smith",
          earnings: "ETB 45.20",
          level: 2,
          children: [
            {
              id: "3",
              name: "Charlie Brown",
              earnings: "ETB 12.30",
              level: 3,
            },
          ],
        },
        {
          id: "4",
          name: "Diana Prince",
          earnings: "ETB 78.90",
          level: 2,
        },
      ],
    },
    {
      id: "5",
      name: "Eve Wilson",
      earnings: "ETB 89.40",
      level: 1,
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Referrals" value="23" description="Across all levels" icon={Users} />
        <StatCard
          title="Commission Earned"
          value="ETB 351.30"
          description="Lifetime commissions"
          icon={DollarSign}
          trend={{ value: "8.2%", isPositive: true }}
        />
        <StatCard
          title="This Month"
          value="ETB 87.50"
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
