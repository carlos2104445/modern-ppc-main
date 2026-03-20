import { StatCard } from "../stat-card";
import { Wallet, TrendingUp, MousePointerClick, Users } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatCard
        title="Wallet Balance"
        value="ETB 1,234.56"
        description="Available for withdrawal"
        icon={Wallet}
      />
      <StatCard
        title="Lifetime Earnings"
        value="ETB 5,678.90"
        description="Total earned"
        icon={TrendingUp}
        trend={{ value: "12.5%", isPositive: true }}
      />
      <StatCard
        title="Ads Clicked Today"
        value="42"
        description="Daily clicks"
        icon={MousePointerClick}
      />
      <StatCard
        title="Referrals"
        value="23"
        description="Active referrals"
        icon={Users}
        trend={{ value: "3 new", isPositive: true }}
      />
    </div>
  );
}
