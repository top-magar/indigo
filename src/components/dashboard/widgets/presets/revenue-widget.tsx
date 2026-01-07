"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowUp01Icon,
    ArrowDown01Icon,
    MinusSignIcon,
    RefreshIcon,
} from "@hugeicons/core-free-icons";
import {
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/shared/utils";
import { getRevenueData, type DashboardPeriod } from "@/app/dashboard/actions";
import { useCachedQuery } from "@/shared/hooks/use-cached-query";
import {
    WIDGET_CACHE_KEYS,
    getWidgetCacheKey,
    getWidgetCacheConfig,
} from "@/infrastructure/cache/widget-cache";
import type { RevenueByPeriod } from "@/features/analytics/repositories/analytics-types";

// Chart configuration
const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "var(--chart-1)",
    },
};

// Period options
const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "90d", label: "90D" },
    { value: "1y", label: "1Y" },
];

interface RevenueWidgetProps {
    /** Initial period */
    initialPeriod?: DashboardPeriod;
    /** Currency for formatting */
    currency?: string;
    /** Height of the chart */
    height?: number;
    /** Show period selector */
    showPeriodSelector?: boolean;
    /** Show comparison with previous period */
    showComparison?: boolean;
    /** Additional class names */
    className?: string;
}

export function RevenueWidget({
    initialPeriod = "30d",
    currency = "USD",
    height = 200,
    showPeriodSelector = true,
    showComparison = true,
    className,
}: RevenueWidgetProps) {
    const [period, setPeriod] = useState<DashboardPeriod>(initialPeriod);

    // Generate cache key with period parameter
    const cacheKey = getWidgetCacheKey(WIDGET_CACHE_KEYS.REVENUE_DATA, { period });
    const cacheConfig = getWidgetCacheConfig(WIDGET_CACHE_KEYS.REVENUE_DATA);

    // Use cached query for data fetching
    const {
        data,
        isLoading,
        isStale,
        isFetching,
        error,
        refetch,
    } = useCachedQuery<RevenueByPeriod>(
        cacheKey,
        useCallback(() => getRevenueData(period), [period]),
        {
            ...cacheConfig,
            onError: (err) => console.error("Failed to fetch revenue data:", err),
        }
    );

    // Handle period change
    const handlePeriodChange = (newPeriod: DashboardPeriod) => {
        setPeriod(newPeriod);
    };

    // Loading state
    if (isLoading) {
        return <RevenueWidgetSkeleton height={height} />;
    }

    // Error state
    if (error && !data) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full", className)}>
                <p className="text-sm text-muted-foreground">Failed to load revenue data</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                    Retry
                </Button>
            </div>
        );
    }

    // Empty state
    if (!data || data.data.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full", className)}>
                <p className="text-sm text-muted-foreground">No revenue data available</p>
            </div>
        );
    }

    // Format chart data
    const chartData = data.data.map((point) => ({
        ...point,
        formattedDate: format(new Date(point.date), period === "1y" ? "MMM" : "MMM d"),
    }));

    // Calculate trend
    const revenueChange = data.comparison?.revenueChange ?? 0;
    const trend = revenueChange > 0.5 ? "up" : revenueChange < -0.5 ? "down" : "neutral";

    return (
        <div className={cn("space-y-3", className)}>
            {/* Header with stats */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">
                            {formatCurrency(data.totals.revenue, currency)}
                        </p>
                        {/* Stale indicator */}
                        {isStale && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[10px] px-1.5 py-0 h-5 gap-1",
                                    isFetching && "animate-pulse"
                                )}
                            >
                                <HugeiconsIcon
                                    icon={RefreshIcon}
                                    className={cn("w-2.5 h-2.5", isFetching && "animate-spin")}
                                />
                                {isFetching ? "Updating" : "Stale"}
                            </Badge>
                        )}
                    </div>
                    {showComparison && data.comparison && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-xs px-1.5 py-0 gap-0.5 border-0",
                                    trend === "up" && "bg-chart-2/10 text-chart-2",
                                    trend === "down" && "bg-destructive/10 text-destructive",
                                    trend === "neutral" && "bg-muted text-muted-foreground"
                                )}
                            >
                                <HugeiconsIcon
                                    icon={
                                        trend === "up"
                                            ? ArrowUp01Icon
                                            : trend === "down"
                                            ? ArrowDown01Icon
                                            : MinusSignIcon
                                    }
                                    className="w-2.5 h-2.5"
                                />
                                {Math.abs(revenueChange).toFixed(1)}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">vs previous period</span>
                        </div>
                    )}
                </div>

                {/* Period selector */}
                {showPeriodSelector && (
                    <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
                        {PERIOD_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-6 px-2 text-xs",
                                    period === option.value && "bg-background shadow-sm"
                                )}
                                onClick={() => handlePeriodChange(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Chart */}
            <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="revenueWidgetFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} className="stroke-muted" />
                    <XAxis
                        dataKey="formattedDate"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="text-muted-foreground text-[10px]"
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                            return value.toString();
                        }}
                        className="text-muted-foreground text-[10px]"
                        width={40}
                    />
                    <ChartTooltip
                        content={
                            <ChartTooltipContent
                                formatter={(value) => formatCurrency(value as number, currency)}
                            />
                        }
                    />
                    <Area
                        dataKey="revenue"
                        type="monotone"
                        fill="url(#revenueWidgetFill)"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ChartContainer>

            {/* Summary stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div>
                    <span className="font-medium text-foreground">{data.totals.orders}</span> orders
                </div>
                <div>
                    AOV: <span className="font-medium text-foreground">
                        {formatCurrency(data.totals.avgOrderValue, currency)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function RevenueWidgetSkeleton({ height = 200 }: { height?: number }) {
    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-24 mt-2" />
                </div>
                <Skeleton className="h-7 w-28" />
            </div>
            <Skeleton className="w-full" style={{ height }} />
            <div className="flex items-center justify-between pt-2 border-t">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}

export { RevenueWidgetSkeleton };
