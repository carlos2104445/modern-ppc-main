import { CampaignCard } from "../campaign-card";

export default function CampaignCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <CampaignCard
        id="1"
        name="Summer Sale Campaign"
        budget="ETB 500.00"
        spent="ETB 287.50"
        clicks={1250}
        status="active"
      />
      <CampaignCard
        id="2"
        name="Product Launch 2024"
        budget="ETB 1000.00"
        spent="ETB 450.00"
        clicks={890}
        status="paused"
      />
      <CampaignCard
        id="3"
        name="Brand Awareness"
        budget="ETB 750.00"
        spent="ETB 750.00"
        clicks={3200}
        status="completed"
      />
    </div>
  );
}
