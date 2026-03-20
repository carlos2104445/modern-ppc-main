import { AdCard } from "../ad-card";

export default function AdCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <AdCard
        id="1"
        title="Premium Fitness App"
        description="Discover the ultimate fitness tracking app with AI-powered workout plans"
        payout="ETB 0.05"
        duration={15}
        advertiser="FitnessPro Inc"
      />
      <AdCard
        id="2"
        title="Online Learning Platform"
        description="Learn new skills from industry experts with our comprehensive courses"
        payout="ETB 0.08"
        duration={20}
        advertiser="EduMaster"
      />
      <AdCard
        id="3"
        title="E-commerce Store Sale"
        description="Get 50% off on all electronics this week only - limited time offer"
        payout="ETB 0.03"
        duration={10}
        advertiser="TechDeals"
      />
    </div>
  );
}
