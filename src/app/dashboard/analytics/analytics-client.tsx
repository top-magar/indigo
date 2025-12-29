"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Money01Icon,
    ShoppingCart01Icon,
    AnalyticsUpIcon,
    UserMultipleIcon,
    ArrowUp02Icon,
    ArrowDown02Icon,
    Download01Icon,
    RefreshIcon,
    Calendar03Icon,
    PackageIcon,
    Image01Icon,
    Clock01Icon,
    CheckmarkCircle02Icon,
    DeliveryTruck01Icon,
    Cancel01Icon,
    Crown02Icon,
    UserIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { exportAnalyticsReport } from "./actions";
import { toast } from "sonner";
import type { AnalyticsData, DateRange } from "./actions";

// Simple chart components using divs (no external chart library needed)
import { RevenueChart } from "./components/revenue-chart";
import { DonutChart } from "./components/donut-chart";

interface AnalyticsClientProps {
    data: AnalyticsData;
    currency: string;
    dateRange: DateRange;
}

// Format currency
function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

// Format compact number
function formatCompact(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
}

// Status config
const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof Clock01Icon }> = {
    pending: { color: "text-chart-4", bgColor: "bg-chart-4", icon: Clock01Icon },
    confirmed: { color: "text-chart-1", bgColor: "bg-chart-1", icon: CheckmarkCircle02Icon },
    processing: { color: "text-chart-1", bgColor: "bg-chart-1", icon: PackageIcon },
    shipped: { color: "text-chart-5", bgColor: "bg-chart-5", icon: DeliveryTruck01Icon },
    delivered: { color: "text-chart-2", bgColor: "bg-chart-2", icon: CheckmarkCircle02Icon },
    cancelled: { color: "text-destructive", bgColor: "bg-destructive", icon: Cancel01Icon },
    refunded: { color: "text-muted-foreground", bgColor: "bg-muted-foreground", icon: Cancel01Icon },
};

// Segment config
const segmentConfig: Record<string, { color: string; icon: typeof UserIcon }> = {
    New: { color: "bg-chart-1", icon: UserIcon },
    Returning: { color: "bg-chart-2", icon: RefreshIcon },
    Loyal: { color: "bg-chart-4", icon: CheckmarkCircle02Icon },
    VIP: { color: "bg-chart-5", icon: Crown02Icon },
};

export function AnalyticsClient({ data, currency, dateRange }: AnalyticsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleRangeChange = (range: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", range);
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleExport = async () => {
        const result = await exportAnalyticsReport(dateRange);
        
        if (result.error) {
            toast.error(result.error);
            return;
        }

        if (result.csv) {
            const blob = new Blob([result.csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `analytics-${dateRange}-${format(new Date(), "yyyy-MM-dd")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Report exported");
        }
    };

    const rangeLabels: Record<DateRange, string> = {
        "7d": "Last 7 days",
        "30d": "Last 30 days",
        "90d": "Last 90 days",
        "12m": "Last 12 months",
        "custom": "Custom",
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                        <p className="text-muted-foreground">
                            Track your store performance and insights
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={dateRange} onValueChange={handleRangeChange}>
                            <SelectTrigger className="w-[160px]">
                                <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="12m">Last 12 months</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.refresh()}
                            disabled={isPending}
                        >
                            <HugeiconsIcon icon={RefreshIcon} className={cn("w-4 h-4", isPending && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Revenue */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(data.overview.revenue, currency)}</p>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs px-1.5 py-0 gap-0.5 border-0",
                                                data.overview.revenueChange >= 0
                                                    ? "bg-chart-2/10 text-chart-2"
                                                    : "bg-destructive/10 text-destructive"
                                            )}
                                        >
                                            <HugeiconsIcon
                                                icon={data.overview.revenueChange >= 0 ? ArrowUp02Icon : ArrowDown02Icon}
                                                className="w-3 h-3"
                                            />
                                            {Math.abs(data.overview.revenueChange).toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={Money01Icon} className="w-5 h-5 text-chart-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Orders</p>
                                    <p className="text-2xl font-bold">{data.overview.orders}</p>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs px-1.5 py-0 gap-0.5 border-0",
                                                data.overview.ordersChange >= 0
                                                    ? "bg-chart-2/10 text-chart-2"
                                                    : "bg-destructive/10 text-destructive"
                                            )}
                                        >
                                            <HugeiconsIcon
                                                icon={data.overview.ordersChange >= 0 ? ArrowUp02Icon : ArrowDown02Icon}
                                                className="w-3 h-3"
                                            />
                                            {Math.abs(data.overview.ordersChange).toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={ShoppingCart01Icon} className="w-5 h-5 text-chart-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Avg Order Value */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AOV</p>
                                    <p className="text-2xl font-bold">{formatCurrency(data.overview.avgOrderValue, currency)}</p>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs px-1.5 py-0 gap-0.5 border-0",
                                                data.overview.avgOrderValueChange >= 0
                                                    ? "bg-chart-2/10 text-chart-2"
                                                    : "bg-destructive/10 text-destructive"
                                            )}
                                        >
                                            <HugeiconsIcon
                                                icon={data.overview.avgOrderValueChange >= 0 ? ArrowUp02Icon : ArrowDown02Icon}
                                                className="w-3 h-3"
                                            />
                                            {Math.abs(data.overview.avgOrderValueChange).toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                    <HugeiconsIcon icon={AnalyticsUpIcon} className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customers */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customers</p>
                                    <p className="text-2xl font-bold">{data.overview.customers}</p>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs px-1.5 py-0 gap-0.5 border-0",
                                                data.overview.customersChange >= 0
                                                    ? "bg-chart-2/10 text-chart-2"
                                                    : "bg-destructive/10 text-destructive"
                                            )}
                                        >
                                            <HugeiconsIcon
                                                icon={data.overview.customersChange >= 0 ? ArrowUp02Icon : ArrowDown02Icon}
                                                className="w-3 h-3"
                                            />
                                            {Math.abs(data.overview.customersChange).toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={UserMultipleIcon} className="w-5 h-5 text-chart-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conversion Rate */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Conversion</p>
                                    <p className="text-2xl font-bold">{data.overview.conversionRate.toFixed(1)}%</p>
                                    <p className="text-xs text-muted-foreground">
                                        {data.overview.itemsPerOrder.toFixed(1)} items/order
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={AnalyticsUpIcon} className="w-5 h-5 text-chart-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Revenue Over Time</CardTitle>
                            <CardDescription>
                                {rangeLabels[dateRange]} revenue and order trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RevenueChart data={data.revenueChart} currency={currency} />
                        </CardContent>
                    </Card>

                    {/* Orders by Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders by Status</CardTitle>
                            <CardDescription>Distribution of order statuses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.ordersByStatus.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                        <HugeiconsIcon icon={ShoppingCart01Icon} className="w-6 h-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground">No orders yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.ordersByStatus.map((item) => {
                                        const config = statusConfig[item.status] || statusConfig.pending;
                                        return (
                                            <div key={item.status} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <HugeiconsIcon icon={config.icon} className={cn("w-4 h-4", config.color)} />
                                                        <span className="capitalize">{item.status}</span>
                                                    </div>
                                                    <span className="font-medium">{item.count}</span>
                                                </div>
                                                <Progress value={item.percentage} className="h-2" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>


                {/* Products & Categories Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                            <CardDescription>Best performing products by revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.topProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                        <HugeiconsIcon icon={PackageIcon} className="w-6 h-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground">No product sales yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.topProducts.map((product, index) => (
                                        <div key={product.id} className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-muted-foreground w-4">
                                                {index + 1}
                                            </span>
                                            <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                                                {product.image ? (
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        width={40}
                                                        height={40}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <HugeiconsIcon icon={Image01Icon} className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.quantity} sold · {product.orders} orders
                                                </p>
                                            </div>
                                            <span className="font-semibold">
                                                {formatCurrency(product.revenue, currency)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue by Category</CardTitle>
                            <CardDescription>Sales distribution across categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.topCategories.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                        <HugeiconsIcon icon={PackageIcon} className="w-6 h-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground">No category data yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <DonutChart data={data.topCategories} currency={currency} />
                                    <div className="space-y-3 pt-4">
                                        {data.topCategories.map((category, index) => {
                                            const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
                                            return (
                                                <div key={category.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("h-3 w-3 rounded-full", colors[index % colors.length])} />
                                                        <span className="text-sm">{category.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-muted-foreground">
                                                            {category.percentage.toFixed(1)}%
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {formatCurrency(category.revenue, currency)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Segments & Recent Orders */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Customer Segments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Segments</CardTitle>
                            <CardDescription>Breakdown by purchase frequency</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.customerSegments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                        <HugeiconsIcon icon={UserMultipleIcon} className="w-6 h-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground">No customer data yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.customerSegments.map((segment) => {
                                        const config = segmentConfig[segment.segment] || segmentConfig.New;
                                        return (
                                            <div key={segment.segment} className="flex items-center gap-4 p-3 rounded-lg border">
                                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", config.color + "/10")}>
                                                    <HugeiconsIcon icon={config.icon} className={cn("w-5 h-5", config.color.replace("bg-", "text-"))} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{segment.segment}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {segment.count} customers
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <Progress value={segment.percentage} className="h-1.5 flex-1 mr-4" />
                                                        <span className="text-sm font-medium">
                                                            {formatCurrency(segment.revenue, currency)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Latest orders in this period</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/dashboard/orders">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {data.recentOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                        <HugeiconsIcon icon={ShoppingCart01Icon} className="w-6 h-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground">No orders yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.recentOrders.map((order) => {
                                        const config = statusConfig[order.status] || statusConfig.pending;
                                        return (
                                            <Link
                                                key={order.id}
                                                href={`/dashboard/orders/${order.id}`}
                                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium">#{order.order_number}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.customer_name || "Guest"} · {format(new Date(order.created_at), "MMM d, h:mm a")}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn("border-0 capitalize", config.bgColor + "/10", config.color)}
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                    <span className="font-semibold">
                                                        {formatCurrency(order.total, currency)}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    );
}
