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
        color: "text-primary",
        bgColor: "bg-primary/10",
        label: "New",
    },
    returning: {
        icon: RefreshCw,
        color: "text-success",
        bgColor: "bg-success/10",
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
        color: "text-warning",
        bgColor: "bg-warning/10",
        label: "VIP",
    },
    at_risk: {
        icon: AlertCircle,
        color: "text-info",
        bgColor: "bg-info/10",
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
                        <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-muted-foreground" />
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
            <CardContent className="space-y-4">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Customers */}
                    <div className="space-y-1">
                        <p className="stat-label">Total Customers</p>
                        <p className="stat-value">{data.totalCustomers.toLocaleString()}</p>
                    </div>

                    {/* New Customers */}
                    <div className="space-y-1">
                        <p className="stat-label">New Customers</p>
                        <div className="flex items-center gap-2">
                            <p className="stat-value">{data.newCustomers.toLocaleString()}</p>
                            {data.comparison && (
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "text-xs px-1.5 py-0 gap-0.5 border-0",
                                        data.comparison.newCustomersChange >= 0
                                            ? "bg-success/10 text-success"
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
                        <p className="stat-label">Avg. Lifetime Value</p>
                        <p className="stat-value">
                            {formatCurrency(data.avgLifetimeValue, currency)}
                        </p>
                    </div>

                    {/* Repeat Purchase Rate */}
                    <div className="space-y-1">
                        <p className="stat-label">Repeat Rate</p>
                        <p className="stat-value">{data.repeatPurchaseRate.toFixed(1)}%</p>
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
                                    className="flex items-center gap-4 p-3 rounded-lg border"
                                >
                                    <div
                                        className={cn(
                                            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
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
            <CardContent className="space-y-4">
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
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                            <Skeleton className="h-9 w-9 rounded-lg" />
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
