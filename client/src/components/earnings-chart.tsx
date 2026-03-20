import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface EarningsChartProps {
  data: Array<{ date: string; earnings: number; clicks: number }>;
  period?: "7d" | "30d" | "90d";
}

export function EarningsChart({ data, period = "7d" }: EarningsChartProps) {
  const totalEarnings = data.reduce((sum, item) => sum + item.earnings, 0);
  const avgEarnings = totalEarnings / data.length;
  const lastWeekAvg =
    data.slice(0, Math.floor(data.length / 2)).reduce((sum, item) => sum + item.earnings, 0) /
    Math.floor(data.length / 2);
  const thisWeekAvg =
    data.slice(Math.floor(data.length / 2)).reduce((sum, item) => sum + item.earnings, 0) /
    Math.ceil(data.length / 2);
  const trend = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;
  const isPositive = trend >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>
              Last {period === "7d" ? "7 days" : period === "30d" ? "30 days" : "90 days"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-chart-2" />
            ) : (
              <TrendingDown className="h-4 w-4 text-chart-1" />
            )}
            <span className={`text-sm font-medium ${isPositive ? "text-chart-2" : "text-chart-1"}`}>
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fill="url(#colorEarnings)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
            <p className="text-lg font-bold">ETB {totalEarnings.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Daily Average</p>
            <p className="text-lg font-bold">ETB {avgEarnings.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
