import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Link, Youtube, Image as ImageIcon } from "lucide-react";

interface AdCardProps {
  id: string;
  title: string;
  description: string;
  payout: string;
  duration: number;
  advertiser: string;
  type?: "link" | "youtube" | "banner";
}

export function AdCard({
  id,
  title,
  description,
  payout,
  duration,
  advertiser,
  type = "link",
}: AdCardProps) {
  const getIcon = () => {
    switch (type) {
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "banner":
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover-elevate cursor-pointer" data-testid={`card-ad-${id}`}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg" data-testid={`text-ad-title-${id}`}>
            {title}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            <DollarSign className="h-3 w-3 mr-1" />
            {payout}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{duration}s to view</span>
          {getIcon()}
          <span className="text-xs capitalize">{type}</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">by {advertiser}</div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" data-testid={`button-view-ad-${id}`}>
          View Ad & Earn {payout}
        </Button>
      </CardFooter>
    </Card>
  );
}
