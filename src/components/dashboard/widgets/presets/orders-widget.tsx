"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Clock01Icon,
    CheckmarkCircle02Icon,
    TruckDeliveryIcon,
    PackageIcon,
    Cancel01Icon,
    RefreshIcon,
} from "@hugeicons/core-free-icons";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/shared/utils";
import { getOrdersByStatus } from "@/app/dashboard/actions";
import { useCachedQuery } from "@/shared/hooks/use-cached-query";
import {
    WIDGET_CACHE_KEYS,
    getWidgetCacheKey,
    getWidgetCacheConfig,
} from "@/infrastructure/cache/widget-cache";
import type { OrdersByStatusResponse } from "@/features/analytics/repositories/analytics-types";

// Status configuration
const STATUS_CONFIG: Record<string, { 
    icon: typeof Clock01Icon; 
    color: string; 
    bgColor: string;
    chartColor: string;
}> = {
    pending: {
        icon: Clock01Icon,
        color: "text-chart-4",
        bgColor: "bg-chart-4/10",
        chartColor: "hsl(var(--chart-4))",
    },
    confirmed: {
        icon: CheckmarkCircle02Icon,
        color: "text-chart-1",
        bgColor: "bg-chart-1/10",
        chartColor: "hsl(var(--chart-1))",
    },
    processing: {
        icon: PackageIcon,
        color: "text-chart-2",
        bgColor: "bg-chart-2/10",
        chartColor: "hsl(var(--chart-2))",
    },
    shipped: {
        icon: TruckDeliveryIcon,
        color: "text-chart-3",
        bgColor: "bg-chart-3/10",
        chartColor: "hsl(var(--chart-3))",
    },
    delivered: {
        icon: CheckmarkCircle02Icon,
        color: "text-chart-2",
        bgColor: "bg-chart-2/10",
        chartColor: "hsl(var(--chart-2))",
    },
    cancelled: {
        icon: Cancel01Icon,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        chartColor: "hsl(var(--destructive))",
    },
    refunded: {
        icon: Cancel01Icon,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        chartColor: "hsl(var(--muted-foreground))",
    },
};

interface OrdersWidgetProps {
    /** Currency for formatting */
    currency?: string;
    /** Enable click to filter */
    enableFilter?: boolean;
    /** Additional class names */
    className?: string;
}

// Custom active shape for donut chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
    const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        payload,
    } = props;

    return (
        <g>
            <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground text-lg font-bold">
                {payload.count}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" className="fill-muted-foreground text-xs">
                {payload.status}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 8}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
        </g>
    );
};

export function OrdersWidget({
    currency = "USD",
    enableFilter = true,
    className,
}: OrdersWidgetProps) {
    const router = useRouter();

    // Generate cache key
    const cacheKey = getWidgetCacheKey(WIDGET_CACHE_KEYS.ORDERS_BY_STATUS);
    const cacheConfig = getWidgetCacheConfig(WIDGET_CACHE_KEYS.ORDERS_BY_STATUS);

    // Use cached query for data fetching
    const {
        data,
        isLoading,
        isStale,
        isFetching,
        error,
        refetch,
    } = useCachedQuery<OrdersByStatusResponse>(
        cacheKey,
        useCallback(() => getOrdersByStatus(), []),
        {
            ...cacheConfig,
            onError: (err) => console.error("Failed to fetch orders data:", err),
        }
    );

    // Track active pie segment
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

    // Handle status click - navigate to filtered orders
    const handleStatusClick = useCallback(
        (status: string) => {
            if (enableFilter) {
                router.push(`/dashboard/orders?status=${status}`);
            }
        },
        [router, enableFilter]
    );

    // Handle pie segment hover
    const onPieEnter = useCallback((_: unknown, index: number) => {
        setActiveIndex(index);
    }, []);

    const onPieLeave = useCallback(() => {
        setActiveIndex(undefined);
    }, []);

    // Loading state
    if (isLoading) {
        return <OrdersWidgetSkeleton />;
    }

    // Error state
    if (error && !data) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full", className)}>
                <p className="text-sm text-muted-foreground">Failed to load orders data</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                    Retry
                </Button>
            </div>
        );
    }

    // Empty state
    if (!data || data.statuses.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full py-8", className)}>
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                    <HugeiconsIcon icon={PackageIcon} className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
        );
    }

    // Prepare chart data
    const chartData = data.statuses.map((item) => ({
        ...item,
        fill: STATUS_CONFIG[item.status]?.chartColor || "hsl(var(--muted))",
    }));

    return (
        <div className={cn("space-y-4", className)}>
            {/* Stale indicator */}
            {isStale && (
                <div className="flex justify-end">
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
                </div>
            )}

            {/* Donut Chart */}
            <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={2}
                            dataKey="count"
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            onClick={(_, index) => handleStatusClick(chartData[index].status)}
                            className={enableFilter ? "cursor-pointer" : ""}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Status Legend */}
            <div className="space-y-2">
                {data.statuses.slice(0, 4).map((item) => {
                    const config = STATUS_CONFIG[item.status];
                    return (
                        <button
                            key={item.status}
                            onClick={() => handleStatusClick(item.status)}
                            disabled={!enableFilter}
                            className={cn(
                                "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
                                enableFilter && "hover:bg-muted/50 cursor-pointer",
                                !enableFilter && "cursor-default"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "h-6 w-6 rounded-md flex items-center justify-center",
                                        config?.bgColor || "bg-muted"
                                    )}
                                >
                                    <HugeiconsIcon
                                        icon={config?.icon || PackageIcon}
                                        className={cn("w-3 h-3", config?.color || "text-muted-foreground")}
                                    />
                                </div>
                                <span className="text-sm capitalize">{item.status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{item.count}</span>
                                <span className="text-xs text-muted-foreground w-10 text-right">
                                    {item.percentage.toFixed(0)}%
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="pt-3 border-t flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{data.totalOrders}</span> orders
                </span>
                <span className="text-muted-foreground">
                    Value: <span className="font-medium text-foreground">
                        {formatCurrency(data.totalValue, currency)}
                    </span>
                </span>
            </div>
        </div>
    );
}

function OrdersWidgetSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-[160px] flex items-center justify-center">
                <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-md" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                    </div>
                ))}
            </div>
            <div className="pt-3 border-t flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}

export { OrdersWidgetSkeleton };
