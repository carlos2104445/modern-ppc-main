import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface Referral {
  id: string;
  name: string;
  earnings: string;
  level: number;
  children?: Referral[];
}

interface ReferralNodeProps {
  referral: Referral;
}

function ReferralNode({ referral }: ReferralNodeProps) {
  const levelColors = {
    1: "bg-primary",
    2: "bg-chart-3",
    3: "bg-chart-4",
  };

  const initials = referral.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="space-y-4">
      <Card className="hover-elevate">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={referral.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{referral.name}</p>
              <p className="text-sm text-muted-foreground">{referral.earnings} earned</p>
            </div>
            <Badge className={levelColors[referral.level as keyof typeof levelColors]}>
              L{referral.level}
            </Badge>
          </div>
        </CardContent>
      </Card>
      {referral.children && referral.children.length > 0 && (
        <div className="ml-8 space-y-4 border-l-2 border-border pl-4">
          {referral.children.map((child) => (
            <ReferralNode key={child.id} referral={child} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReferralTreeProps {
  referrals: Referral[];
}

export function ReferralTree({ referrals }: ReferralTreeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Referral Network
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {referrals.map((referral) => (
          <ReferralNode key={referral.id} referral={referral} />
        ))}
      </CardContent>
    </Card>
  );
}
