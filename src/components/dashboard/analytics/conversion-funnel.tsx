"use client";

import {
    Eye,
    ShoppingCart,
    CreditCard,
    CheckCircle,
    ChevronDown,
} from "lucide-react";
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
const stageConfig: Record<FunnelStage, { icon: typeof Eye; color: string; bgColor: string }> = {
    views: {
        icon: Eye,
        color: "text-primary",
        bgColor: "bg-primary/10",
    },
    cart: {
        icon: ShoppingCart,
        color: "text-success",
        bgColor: "bg-success/10",
    },
    checkout: {
        icon: CreditCard,
        color: "text-ds-teal-700",
        bgColor: "bg-ds-teal-700/10",
    },
    purchase: {
        icon: CheckCircle,
        color: "text-warning",
        bgColor: "bg-warning/10",
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
                        <div className="size-9 rounded-lg bg-muted/50 flex items-center justify-center">
                            <ShoppingCart className="size-6 text-muted-foreground" />
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
                                            "relative h-16 rounded-lg transition-colors duration-300",
                                            config.bgColor
                                        )}
                                        style={{ width: `${Math.max(widthPercent, 20)}%` }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-between px-4">
                                            {/* Left side - icon and label */}
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "size-8 rounded-lg flex items-center justify-center",
                                                        config.bgColor
                                                    )}
                                                >
                                                <config.icon
                                                        className={cn("size-4", config.color)}
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
                                        <ChevronDown className="size-3 text-muted-foreground" />
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
                <Skeleton className="size-48" />
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
