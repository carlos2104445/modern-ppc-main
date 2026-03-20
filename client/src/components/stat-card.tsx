import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "highlighted" | "primary";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const isHighlighted = variant === "highlighted";
  const isPrimary = variant === "primary";

  return (
    <Card
      className={cn(
        "hover-elevate transition-all duration-200",
        isHighlighted && "border-primary/50 bg-primary/5",
        isPrimary && "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle
          className={cn("font-medium", isHighlighted || isPrimary ? "text-base" : "text-sm")}
        >
          {title}
        </CardTitle>
        <div
          className={cn(
            "rounded-lg flex items-center justify-center transition-colors",
            isHighlighted || isPrimary ? "h-12 w-12 bg-primary/10" : "h-10 w-10 bg-muted"
          )}
        >
          <Icon
            className={cn(
              isHighlighted || isPrimary ? "h-6 w-6 text-primary" : "h-5 w-5 text-muted-foreground"
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn("font-bold mb-1", isHighlighted || isPrimary ? "text-4xl" : "text-3xl")}
          data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {value}
        </div>
        {description && (
          <p
            className={cn(
              "text-muted-foreground mt-1",
              isHighlighted || isPrimary ? "text-sm" : "text-xs"
            )}
          >
            {description}
          </p>
        )}
        {trend && (
          <p
            className={cn(
              "font-medium mt-2",
              isHighlighted || isPrimary ? "text-sm" : "text-xs",
              trend.isPositive ? "text-chart-2" : "text-destructive"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
