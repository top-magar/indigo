"use client";

import { useCallback } from "react";
import {
    Eye,
    ShoppingCart,
    CreditCard,
    CheckCircle,
    ChevronDown,
    RefreshCw,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/shared/utils";
import { getConversionFunnel } from "@/app/dashboard/actions";
import { useCachedQuery } from "@/shared/hooks/use-cached-query";
import {
    WIDGET_CACHE_KEYS,
    getWidgetCacheKey,
    getWidgetCacheConfig,
} from "@/infrastructure/cache/widget-cache";
import type { ConversionFunnelData, FunnelStage } from "@/features/analytics/repositories/analytics-types";

// Stage configuration
const STAGE_CONFIG: Record<FunnelStage, {
    icon: LucideIcon;
    color: string;
    bgColor: string;
}> = {
    views: {
        icon: Eye,
        color: "text-chart-1",
        bgColor: "bg-chart-1/10",
    },
    cart: {
        icon: ShoppingCart,
        color: "text-chart-2",
        bgColor: "bg-chart-2/10",
    },
    checkout: {
        icon: CreditCard,
        color: "text-chart-3",
        bgColor: "bg-chart-3/10",
    },
    purchase: {
        icon: CheckCircle,
        color: "text-chart-4",
        bgColor: "bg-chart-4/10",
    },
};

interface ConversionWidgetProps {
    /** Currency for formatting */
    currency?: string;
    /** Additional class names */
    className?: string;
}

export function ConversionWidget({
    currency = "USD",
    className,
}: ConversionWidgetProps) {
    // Generate cache key
    const cacheKey = getWidgetCacheKey(WIDGET_CACHE_KEYS.CONVERSION_FUNNEL);
    const cacheConfig = getWidgetCacheConfig(WIDGET_CACHE_KEYS.CONVERSION_FUNNEL);

    // Use cached query for data fetching
    const {
        data,
        isLoading,
        isStale,
        isFetching,
        error,
        refetch,
    } = useCachedQuery<ConversionFunnelData>(
        cacheKey,
        useCallback(() => getConversionFunnel(), []),
        {
            ...cacheConfig,
            onError: (err) => console.error("Failed to fetch conversion data:", err),
        }
    );

    // Loading state
    if (isLoading) {
        return <ConversionWidgetSkeleton />;
    }

    // Error state
    if (error && !data) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full", className)}>
                <p className="text-sm text-muted-foreground">Failed to load conversion data</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                    Retry
                </Button>
            </div>
        );
    }

    // Empty state
    if (!data || data.stages.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full py-8", className)}>
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                    <ShoppingCart className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No funnel data available</p>
            </div>
        );
    }

    const maxCount = Math.max(...data.stages.map((s) => s.count));

    return (
        <div className={cn("space-y-2", className)}>
            {/* Overall conversion rate header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Overall Conversion</span>
                <div className="flex items-center gap-2">
                    {/* Stale indicator */}
                    {isStale && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] px-1.5 py-0 h-5 gap-1",
                                isFetching && "animate-pulse"
                            )}
                        >
                            <RefreshCw
                                className={cn("w-2.5 h-2.5", isFetching && "animate-spin")}
                            />
                            {isFetching ? "Updating" : "Stale"}
                        </Badge>
                    )}
                    <span className="text-sm font-semibold text-chart-4">
                        {data.overallConversionRate.toFixed(2)}%
                    </span>
                </div>
            </div>

            {/* Funnel stages */}
            {data.stages.map((stage, index) => {
                const config = STAGE_CONFIG[stage.stage];
                const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
                const isLast = index === data.stages.length - 1;

                return (
                    <div key={stage.stage}>
                        {/* Stage bar */}
                        <div
                            className={cn(
                                "relative h-12 rounded-xl transition-all duration-300",
                                config.bgColor
                            )}
                            style={{ width: `${Math.max(widthPercent, 25)}%` }}
                        >
                            <div className="absolute inset-0 flex items-center justify-between px-3">
                                {/* Left - icon and label */}
                                <div className="flex items-center gap-2">
                                    <config.icon
                                        className={cn("w-4 h-4", config.color)}
                                    />
                                    <div>
                                        <p className="text-xs font-medium">{stage.label}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {stage.count.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Right - conversion rate */}
                                <span className={cn("text-xs font-semibold", config.color)}>
                                    {stage.conversionRate.toFixed(0)}%
                                </span>
                            </div>
                        </div>

                        {/* Dropoff indicator */}
                        {!isLast && stage.dropoffRate > 0 && (
                            <div className="flex items-center gap-1 py-0.5 pl-3">
                                <ChevronDown
                                    className="w-2.5 h-2.5 text-muted-foreground"
                                />
                                <span className="text-[10px] text-muted-foreground">
                                    {stage.dropoffRate.toFixed(0)}% drop
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Purchase value */}
            {data.stages.find(s => s.stage === "purchase")?.value ? (
                <div className="pt-2 border-t mt-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Purchase Value</span>
                        <span className="font-medium">
                            {formatCurrency(
                                data.stages.find(s => s.stage === "purchase")?.value || 0,
                                currency
                            )}
                        </span>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function ConversionWidgetSkeleton() {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12" />
            </div>
            {[100, 70, 45, 25].map((width, i) => (
                <div key={i}>
                    <Skeleton className="h-12 rounded-xl" style={{ width: `${width}%` }} />
                    {i < 3 && <Skeleton className="h-3 w-16 mt-1 ml-3" />}
                </div>
            ))}
        </div>
    );
}

export { ConversionWidgetSkeleton };
