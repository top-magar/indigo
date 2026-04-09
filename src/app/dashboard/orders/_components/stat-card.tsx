import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/shared/utils"

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  trend,
  loading,
}: {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down"
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 mt-2" />
          <Skeleton className="h-3 w-16 mt-1" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:ring-foreground/20 transition-colors duration-150">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="stat-value">{value}</span>
          {change && (
            <span className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {trend === "up" && <TrendingUp className="size-3.5" />}
              {trend === "down" && <TrendingDown className="size-3.5" />}
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
