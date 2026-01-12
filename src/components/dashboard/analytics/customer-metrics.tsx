"use client";

import {
    User,
    Users,
    RefreshCw,
    Crown,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    HeartHandshake,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/shared/utils";
import type { CustomerMetrics as CustomerMetricsType, CustomerSegmentType } from "@/features/analytics/repositories/analytics-types";

interface CustomerMetricsProps {
    data: CustomerMetricsType | null;
    currency?: string;
    isLoading?: boolean;
}

// Segment configuration
const segmentConfig: Record<
    CustomerSegmentType,
    { icon: typeof User; color: string; bgColor: string; label: string }
> = {
    new: {
        icon: User,
        color: "text-chart-1",
        bgColor: "bg-chart-1/10",
        label: "New",
    },
    returning: {
        icon: RefreshCw,
        color: "text-chart-2",
        bgColor: "bg-chart-2/10",
        label: "Returning",
    },
    loyal: {
        icon: HeartHandshake,
        color: "text-chart-3",
        bgColor: "bg-chart-3/10",
        label: "Loyal",
    },
    vip: {
        icon: Crown,
        color: "text-chart-4",
        bgColor: "bg-chart-4/10",
        label: "VIP",
    },
    at_risk: {
        icon: AlertCircle,
        color: "text-chart-5",
        bgColor: "bg-chart-5/10",
        label: "At Risk",
    },
    churned: {
        icon: User,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        label: "Churned",
    },
};

export function CustomerMetrics({
    data,
    currency = "USD",
    isLoading = false,
}: CustomerMetricsProps) {
    if (isLoading) {
        return <CustomerMetricsSkeleton />;
    }

    if (!data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Customer Metrics</CardTitle>
                    <CardDescription>Customer insights and segmentation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">No customer data yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
                <CardDescription>Customer insights and segmentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Customers */}
                    <div className="space-y-1">
                        <p className="text-label text-muted-foreground">Total Customers</p>
                        <p className="text-2xl font-semibold">{data.totalCustomers.toLocaleString()}</p>
                    </div>

                    {/* New Customers */}
                    <div className="space-y-1">
                        <p className="text-label text-muted-foreground">New Customers</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-semibold">{data.newCustomers.toLocaleString()}</p>
                            {data.comparison && (
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "text-xs px-1.5 py-0 gap-0.5 border-0",
                                        data.comparison.newCustomersChange >= 0
                                            ? "bg-chart-2/10 text-chart-2"
                                            : "bg-destructive/10 text-destructive"
                                    )}
                                >
                                    {data.comparison.newCustomersChange >= 0 ? (
                                        <ChevronUp className="w-3 h-3" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3" />
                                    )}
                                    {Math.abs(data.comparison.newCustomersChange).toFixed(1)}%
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Avg LTV */}
                    <div className="space-y-1">
                        <p className="text-label text-muted-foreground">Avg. Lifetime Value</p>
                        <p className="text-2xl font-semibold">
                            {formatCurrency(data.avgLifetimeValue, currency)}
                        </p>
                    </div>

                    {/* Repeat Purchase Rate */}
                    <div className="space-y-1">
                        <p className="text-label text-muted-foreground">Repeat Rate</p>
                        <p className="text-2xl font-semibold">{data.repeatPurchaseRate.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Customer Segments */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium">Customer Segments</h4>
                    <div className="space-y-3">
                        {data.segments.map((segment) => {
                            const config = segmentConfig[segment.segment];
                            return (
                                <div
                                    key={segment.segment}
                                    className="flex items-center gap-4 p-3 rounded-xl border"
                                >
                                    <div
                                        className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            config.bgColor
                                        )}
                                    >
                                        <config.icon
                                            className={cn("w-5 h-5", config.color)}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{segment.label}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {segment.count.toLocaleString()} customers
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Progress
                                                value={segment.percentage}
                                                className="h-1.5 flex-1"
                                            />
                                            <span className="text-sm font-medium shrink-0">
                                                {formatCurrency(segment.revenue, currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Returning Customers</span>
                        <span className="font-medium">{data.returningCustomers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Avg. Orders/Customer</span>
                        <span className="font-medium">{data.avgOrdersPerCustomer.toFixed(1)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function CustomerMetricsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>

                {/* Segments */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl border">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-1.5 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
