import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/shared/utils"

export function StatCard({
  title, value, change, changeType, icon: Icon, trend, loading,
}: {
  title: string; value: string | number; change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>; trend?: "up" | "down"; loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{title}</span>
          <Icon className="size-4 text-muted-foreground/50" />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight tabular-nums">{value}</span>
          {change && (
            <span className={cn(
              "flex items-center gap-0.5 text-xs",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {trend === "up" && <TrendingUp className="size-3" />}
              {trend === "down" && <TrendingDown className="size-3" />}
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
