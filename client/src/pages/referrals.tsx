import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  TrendingUp,
  UserPlus,
  Copy,
  Loader2,
  Share2,
  MessageCircle,
  Send,
  Smartphone,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-context";
import { useToast } from "@/hooks/use-toast";

interface ReferralNode {
  id: string;
  name: string;
  level: number;
  joinedAt: string;
  earnings: string;
  children: ReferralNode[];
}

interface CommissionEntry {
  id: string;
  amount: string;
  description: string;
  type: string;
  createdAt: string;
}

function ReferralTreeNode({ node, depth = 0 }: { node: ReferralNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`${depth > 0 ? "ml-6 border-l border-border pl-4" : ""}`}>
      <div
        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
          depth === 0 ? "bg-muted/30" : ""
        }`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {node.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">{node.name}</p>
            <p className="text-xs text-muted-foreground">
              Joined {new Date(node.joinedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs flex-shrink-0">
          Level {node.level}
        </Badge>

        <span className="text-sm font-semibold text-chart-2 flex-shrink-0">
          ETB {parseFloat(node.earnings || "0").toFixed(2)}
        </span>

        {hasChildren && (
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        )}
      </div>

      {expanded && hasChildren && (
        <div className="mt-1">
          {node.children.map((child) => (
            <ReferralTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const referralCode = referralData?.referralCode || user?.referralCode || "—";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
  const totalReferrals = referralData?.totalReferrals || 0;
  const directReferrals = referralData?.directReferrals || 0;
  const totalCommission = referralData?.totalCommission || "0.00";
  const tree: ReferralNode[] = referralData?.tree || [];
  const commissions: CommissionEntry[] = referralData?.recentCommissions || [];
  const commissionLevels = referralData?.commissionLevels || [];

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
  };

  const shareText = `Join AdConnect and start earning! Use my referral code: ${referralCode}\n${referralLink}`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
        `Join AdConnect with my code: ${referralCode}`
      )}`,
      "_blank"
    );
  };

  const shareSMS = () => {
    window.open(`sms:?body=${encodeURIComponent(shareText)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-referrals">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Referrals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Earn commissions when your referrals view ads
          </p>
        </div>
      </div>

      {/* Referral Code + Share Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Your Referral Code</p>
              <p className="text-3xl font-mono font-bold mt-1 tracking-wider">{referralCode}</p>
            </div>
            <Button
              variant="outline"
              onClick={copyCode}
              className="gap-2"
              data-testid="button-copy-code"
            >
              {copied ? <CheckCircle className="h-4 w-4 text-chart-2" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Code"}
            </Button>
          </div>

          {/* Referral Link */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm truncate font-mono">
              {referralLink}
            </div>
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-muted-foreground mr-1">
              <Share2 className="h-4 w-4 inline mr-1" /> Share via:
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={shareWhatsApp}
              className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
              data-testid="button-share-whatsapp"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareTelegram}
              className="gap-1.5 text-blue-500 border-blue-200 hover:bg-blue-50"
              data-testid="button-share-telegram"
            >
              <Send className="h-4 w-4" /> Telegram
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareSMS}
              className="gap-1.5"
              data-testid="button-share-sms"
            >
              <Smartphone className="h-4 w-4" /> SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Referrals"
          value={totalReferrals.toString()}
          description={`${directReferrals} direct`}
          icon={Users}
        />
        <StatCard
          title="Commission Earned"
          value={`ETB ${totalCommission}`}
          description="Lifetime commissions"
          icon={DollarSign}
        />
        <StatCard
          title="Signup Bonus"
          value="ETB 5.00"
          description="Per new referral"
          icon={TrendingUp}
        />
      </div>

      {/* Tabs: Tree + Commissions + Levels */}
      <Tabs defaultValue="tree" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tree" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Network
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> Commissions
          </TabsTrigger>
          <TabsTrigger value="levels" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Levels
          </TabsTrigger>
        </TabsList>

        {/* Referral Tree */}
        <TabsContent value="tree">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5" />
                Your Referral Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tree.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium">No referrals yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share your code to start building your network
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {tree.map((node) => (
                    <ReferralTreeNode key={node.id} node={node} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission History */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5" />
                Commission History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium">No commissions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You'll earn commissions when your referrals view ads
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {commissions.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                          variant="outline"
                          className={
                            c.type === "referral_bonus"
                              ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                              : "bg-green-500/10 text-green-700 border-green-500/20"
                          }
                        >
                          {c.type === "referral_bonus" ? "Bonus" : "Commission"}
                        </Badge>
                        <span className="font-bold text-chart-2">
                          +ETB {parseFloat(c.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Levels */}
        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5" />
                Commission Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {commissionLevels.length > 0 ? (
                commissionLevels.map((lvl: any) => {
                  const colors = [
                    "bg-primary/10 text-primary",
                    "bg-chart-2/10 text-chart-2",
                    "bg-chart-3/10 text-chart-3",
                    "bg-chart-4/10 text-chart-4",
                    "bg-chart-5/10 text-chart-5",
                  ];
                  const colorClass = colors[(lvl.level - 1) % colors.length];
                  return (
                    <div
                      key={lvl.level}
                      className={`flex items-center justify-between p-4 rounded-lg ${colorClass.split(" ")[0]}`}
                    >
                      <div>
                        <p className="font-semibold">Level {lvl.level}</p>
                        <p className="text-sm text-muted-foreground">
                          {lvl.level === 1
                            ? "Direct referrals"
                            : lvl.level === 2
                            ? "Referrals of your referrals"
                            : `${lvl.level} levels deep in your network`}
                        </p>
                      </div>
                      <p className={`text-2xl font-bold ${colorClass.split(" ")[1]}`}>
                        {lvl.percentage}%
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-3">
                  {[
                    { level: 1, pct: "10%", label: "Direct referrals" },
                    { level: 2, pct: "5%", label: "Indirect referrals" },
                    { level: 3, pct: "2%", label: "Extended network" },
                    { level: 4, pct: "1%", label: "Deep network" },
                    { level: 5, pct: "0.5%", label: "Super network" },
                  ].map((lvl) => (
                    <div
                      key={lvl.level}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-semibold">Level {lvl.level}</p>
                        <p className="text-sm text-muted-foreground">{lvl.label}</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">{lvl.pct}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-lg border border-border mt-4">
                <h4 className="font-medium mb-2">How it works</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• When your referral views an ad and earns, you get a commission</li>
                  <li>• Commissions are calculated from the viewer's earning amount</li>
                  <li>• Commissions stack up to 5 levels deep in your network</li>
                  <li>• You also get ETB 5.00 bonus for each new signup</li>
                  <li>• Commissions are credited automatically and instantly</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
