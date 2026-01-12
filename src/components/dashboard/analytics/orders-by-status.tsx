"use client";

import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/shared/utils";
import { getOrderStatus } from "@/config/status";
import type { OrdersByStatusResponse, OrderStatusType } from "@/features/analytics/repositories/analytics-types";

interface OrdersByStatusProps {
    data: OrdersByStatusResponse | null;
    currency?: string;
    isLoading?: boolean;
    showValue?: boolean;
}

export function OrdersByStatus({
    data,
    currency = "USD",
    isLoading = false,
    showValue = true,
}: OrdersByStatusProps) {
    if (isLoading) {
        return <OrdersByStatusSkeleton />;
    }

    if (!data || data.statuses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Orders by Status</CardTitle>
                    <CardDescription>Distribution of order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">No orders yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>
                    {data.totalOrders.toLocaleString()} total orders
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.statuses.map((item) => {
                        const config = getOrderStatus(item.status);
                        return (
                            <div key={item.status} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        {config.icon && (
                                            <config.icon
                                                className={cn("w-4 h-4", config.color)}
                                            />
                                        )}
                                        <span className="capitalize">{item.status}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{item.count}</span>
                                        <span className="text-muted-foreground text-xs w-12 text-right">
                                            {item.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress value={item.percentage} className="h-2" />
                                {showValue && item.value > 0 && (
                                    <p className="text-xs text-muted-foreground text-right">
                                        {formatCurrency(item.value, currency)}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="font-semibold">{data.totalOrders.toLocaleString()}</span>
                    </div>
                    {showValue && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total Value</span>
                            <span className="font-semibold">
                                {formatCurrency(data.totalValue, currency)}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function OrdersByStatusSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
