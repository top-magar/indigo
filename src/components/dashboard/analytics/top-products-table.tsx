"use client";

import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/shared/utils";
import type { TopProductsResponse } from "@/features/analytics/repositories/analytics-types";

interface TopProductsTableProps {
    data: TopProductsResponse | null;
    currency?: string;
    isLoading?: boolean;
    limit?: number;
    showViewAll?: boolean;
}

export function TopProductsTable({
    data,
    currency = "USD",
    isLoading = false,
    limit = 5,
    showViewAll = true,
}: TopProductsTableProps) {
    if (isLoading) {
        return <TopProductsTableSkeleton limit={limit} />;
    }

    if (!data || data.products.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Best performing products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <HugeiconsIcon icon={Image01Icon} className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">No product sales yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const products = data.products.slice(0, limit);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Best performing products by revenue</CardDescription>
                </div>
                {showViewAll && (
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/products">
                            View All
                            <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {products.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-4">
                            {/* Rank */}
                            <span className="text-sm font-medium text-muted-foreground w-4">
                                {index + 1}
                            </span>

                            {/* Product Image */}
                            <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                                {product.imageUrl ? (
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        width={40}
                                        height={40}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <HugeiconsIcon
                                            icon={Image01Icon}
                                            className="w-4 h-4 text-muted-foreground"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">{product.name}</p>
                                    {product.sku && (
                                        <Badge variant="secondary" className="text-xs shrink-0">
                                            {product.sku}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-xs text-muted-foreground">
                                        {product.quantity} sold · {product.orders} orders
                                    </p>
                                    <Progress
                                        value={product.revenueShare}
                                        className="h-1 w-16"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {product.revenueShare.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Revenue */}
                            <div className="text-right shrink-0">
                                <span className="font-semibold">
                                    {formatCurrency(product.revenue, currency)}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    avg {formatCurrency(product.avgPrice, currency)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Total from top {products.length} products
                    </span>
                    <div className="text-right">
                        <span className="font-semibold">
                            {formatCurrency(data.totalRevenue, currency)}
                        </span>
                        <span className="text-muted-foreground ml-2">
                            ({data.totalQuantity} units)
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function TopProductsTableSkeleton({ limit = 5 }: { limit?: number }) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: limit }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-32 mb-1" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
