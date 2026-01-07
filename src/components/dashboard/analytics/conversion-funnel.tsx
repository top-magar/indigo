"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    ViewIcon,
    ShoppingCart01Icon,
    CreditCardIcon,
    CheckmarkCircle02Icon,
    ArrowDown02Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/shared/utils";
import type { ConversionFunnelData, FunnelStage } from "@/features/analytics/repositories/analytics-types";

interface ConversionFunnelProps {
    data: ConversionFunnelData | null;
    currency?: string;
    isLoading?: boolean;
}

// Stage icons and colors
const stageConfig: Record<FunnelStage, { icon: typeof ViewIcon; color: string; bgColor: string }> = {
    views: {
        icon: ViewIcon,
        color: "text-chart-1",
        bgColor: "bg-chart-1/10",
    },
    cart: {
        icon: ShoppingCart01Icon,
        color: "text-chart-2",
        bgColor: "bg-chart-2/10",
    },
    checkout: {
        icon: CreditCardIcon,
        color: "text-chart-3",
        bgColor: "bg-chart-3/10",
    },
    purchase: {
        icon: CheckmarkCircle02Icon,
        color: "text-chart-4",
        bgColor: "bg-chart-4/10",
    },
};

export function ConversionFunnel({
    data,
    currency = "USD",
    isLoading = false,
}: ConversionFunnelProps) {
    if (isLoading) {
        return <ConversionFunnelSkeleton />;
    }

    if (!data || data.stages.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                    <CardDescription>Customer journey from view to purchase</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <HugeiconsIcon
                                icon={ShoppingCart01Icon}
                                className="w-6 h-6 text-muted-foreground/50"
                            />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">No funnel data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const maxCount = Math.max(...data.stages.map((s) => s.count));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>
                    Overall conversion rate: {data.overallConversionRate.toFixed(2)}%
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {data.stages.map((stage, index) => {
                        const config = stageConfig[stage.stage];
                        const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
                        const isLast = index === data.stages.length - 1;

                        return (
                            <div key={stage.stage}>
                                {/* Stage bar */}
                                <div className="relative">
                                    {/* Background bar */}
                                    <div
                                        className={cn(
                                            "relative h-16 rounded-lg transition-all duration-300",
                                            config.bgColor
                                        )}
                                        style={{ width: `${Math.max(widthPercent, 20)}%` }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-between px-4">
                                            {/* Left side - icon and label */}
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "h-8 w-8 rounded-lg flex items-center justify-center",
                                                        config.bgColor
                                                    )}
                                                >
                                                    <HugeiconsIcon
                                                        icon={config.icon}
                                                        className={cn("w-4 h-4", config.color)}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{stage.label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {stage.count.toLocaleString()} visitors
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right side - conversion rate */}
                                            <div className="text-right">
                                                <p className={cn("font-semibold text-sm", config.color)}>
                                                    {stage.conversionRate.toFixed(1)}%
                                                </p>
                                                {stage.value > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatCurrency(stage.value, currency)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dropoff indicator */}
                                {!isLast && stage.dropoffRate > 0 && (
                                    <div className="flex items-center gap-2 py-1 pl-4">
                                        <HugeiconsIcon
                                            icon={ArrowDown02Icon}
                                            className="w-3 h-3 text-muted-foreground"
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {stage.dropoffRate.toFixed(1)}% drop-off
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Views to Purchase</span>
                        <span className="font-semibold">
                            {data.overallConversionRate.toFixed(2)}% conversion
                        </span>
                    </div>
                    {data.avgTimeToConvert && (
                        <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Avg. Time to Convert</span>
                            <span className="font-medium">{data.avgTimeToConvert} hours</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function ConversionFunnelSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {[100, 75, 50, 30].map((width, i) => (
                        <Skeleton
                            key={i}
                            className="h-16 rounded-lg"
                            style={{ width: `${width}%` }}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
