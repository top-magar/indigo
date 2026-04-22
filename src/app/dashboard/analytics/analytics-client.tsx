"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { EntityListPage } from "@/components/dashboard/templates";
import Image from "next/image";
import { format } from "date-fns";
import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Users,
    ArrowUp,
    ArrowDown,
    Download,
    RefreshCw,
    Calendar,
    Package,
    Image as ImageIcon,
    Crown,
    User,
    CheckCircle,
} from "lucide-react";
import { getOrderStatus } from "@/config/status";
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
import { cn, formatCurrency } from "@/shared/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { exportAnalyticsReport } from "./actions";
import { toast } from "sonner";
import type { AnalyticsData, DateRange } from "./types";

// Simple chart components using divs (no external chart library needed)
import { RevenueChart, DonutChart } from "@/features/analytics/components";
import { formatCompact } from "./_components/helpers";


// Segment config
const segmentConfig: Record<string, { color: string; icon: typeof User }> = {
    New: { color: "bg-primary", icon: User },
    Returning: { color: "bg-success", icon: RefreshCw },
    Loyal: { color: "bg-warning", icon: CheckCircle },
    VIP: { color: "bg-info", icon: Crown },
};

interface AnalyticsClientProps {
    data: AnalyticsData;
    currency: string;
    dateRange: DateRange;
    isFreeTier?: boolean;
}

export interface AnalyticsDashboardViewProps {
    data: AnalyticsData;
    currency: string;
    dateRange: DateRange;
    isFreeTier?: boolean;
    isPending?: boolean;
    onRangeChange?: (range: string) => void;
    onExport?: () => void;
    onRefresh?: () => void;
}

// Thin wrapper — provides router/actions
export function AnalyticsClient({ data, currency, dateRange, isFreeTier = false }: AnalyticsClientProps) {
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

    return (
        <AnalyticsDashboardView
            data={data}
            currency={currency}
            dateRange={dateRange}
            isFreeTier={isFreeTier}
            isPending={isPending}
            onRangeChange={handleRangeChange}
            onExport={handleExport}
            onRefresh={() => router.refresh()}
        />
    );
}

// Pure presentational view — no useRouter, no server actions
export function AnalyticsDashboardView({
    data,
    currency,
    dateRange,
    isFreeTier = false,
    isPending = false,
    onRangeChange,
    onExport,
    onRefresh,
}: AnalyticsDashboardViewProps) {
    const rangeLabels: Record<DateRange, string> = {
        "today": "Today",
        "7d": "Last 7 days",
        "30d": "Last 30 days",
        "90d": "Last 90 days",
        "year": "This year",
        "12m": "Last 12 months",
        "custom": "Custom",
    };

    return (
        <TooltipProvider>
            <EntityListPage
                title="Analytics"
                description="Track your store performance and insights"
                actions={
                    <div className="flex items-center gap-2">
                        {isFreeTier ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 text-muted-foreground">
                                        <Calendar className="size-4" />
                                        <span className="text-sm">Last 7 days</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Upgrade to access longer date ranges</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Select value={dateRange} onValueChange={(v) => onRangeChange?.(v)}>
                                <SelectTrigger className="w-[160px]">
                                    <Calendar className="size-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="7d">Last 7 days</SelectItem>
                                    <SelectItem value="30d">Last 30 days</SelectItem>
                                    <SelectItem value="90d">Last 90 days</SelectItem>
                                    <SelectItem value="year">This year</SelectItem>
                                    <SelectItem value="12m">Last 12 months</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                        <Button variant="outline" onClick={onExport}>
                            <Download className="size-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            size="icon" aria-label="Refresh"
                            onClick={() => onRefresh?.()}
                            disabled={isPending}
                        >
                            <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
                        </Button>
                    </div>
                }
            >

                {/* Free Tier Banner */}
                {isFreeTier && (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-warning/30 bg-warning/5">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                                <TrendingUp className="size-4 text-warning" />
                            </div>
                            <div>
                                <p className="font-medium">You&apos;re viewing limited analytics</p>
                                <p className="text-sm text-muted-foreground">
                                    Free plan shows last 7 days only. Upgrade for full history and advanced insights.
                                </p>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/settings?tab=billing">Upgrade</Link>
                        </Button>
                    </div>
                )}

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Revenue */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="stat-label">Revenue</p>
                                    <p className="stat-value">{formatCurrency(data.overview.revenue, currency)}</p>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs px-1.5 py-0 gap-0.5 border-0",
                                                data.overview.revenueChange >= 0
                                                    ? "bg-success/10 text-success"
                                                    : "bg-destructive/10 text-destructive"
                                            )}
                                        >
                                            {data.overview.revenueChange >= 0 ? (
                                                <ArrowUp className="size-3.5" />
                                            ) : (
                                                <ArrowDown className="size-3.5" />
                                            )}
                                            {Math.abs(data.overview.revenueChange).toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                                    <DollarSign className="size-4 text-success" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="stat-label">Orders</p>
                                    <p className="stat-value">{data.overview.orders}</p>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs px-1.5 py-0 gap-0.5 border-0",
                                                data.overview.ordersChange >= 0
                                                    ? "bg-success/10 text-success"
                                                    : "bg-destructive/10 text-destructive"
                                            )}
                                        >
                                            {data.overview.ordersChange >= 0 ? (
                                                <ArrowUp className="size-3.5" />
                                            ) : (
                                                <ArrowDown className="size-3.5" />
                                            )}
                                            {Math.abs(data.overview.ordersChange).toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <ShoppingCart className="size-4 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Avg Order Value */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="stat-label">AOV</p>
                                    <p className="stat-value">{formatCurrency(data.overview.avgOrderValue, currency)}</p>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs px-1.5 py-0 gap-0.5 border-0",
                                                data.overview.avgOrderValueChange >= 0
                                                    ? "bg-success/10 text-success"
                                                    : "bg-destructive/10 text-destructive"
                                            )}
                                        >
                                            {data.overview.avgOrderValueChange >= 0 ? (
                                                <ArrowUp className="size-3.5" />
                                            ) : (
                                                <ArrowDown className="size-3.5" />
                                            )}
                                            {Math.abs(data.overview.avgOrderValueChange).toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-9 w-9 rounded-lg bg-ds-teal-700/10 flex items-center justify-center">
                                    <TrendingUp className="size-4 text-ds-teal-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customers */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="stat-label">Customers</p>
                                    <p className="stat-value">{data.overview.customers}</p>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs px-1.5 py-0 gap-0.5 border-0",
                                                data.overview.customersChange >= 0
                                                    ? "bg-success/10 text-success"
                                                    : "bg-destructive/10 text-destructive"
                                            )}
                                        >
                                            {data.overview.customersChange >= 0 ? (
                                                <ArrowUp className="size-3.5" />
                                            ) : (
                                                <ArrowDown className="size-3.5" />
                                            )}
                                            {Math.abs(data.overview.customersChange).toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center">
                                    <Users className="size-4 text-info" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Charts Row */}
                <div className="grid gap-4 lg:grid-cols-3">
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
                                <EmptyState icon={ShoppingCart} title="No orders yet" className="py-8" />
                            ) : (
                                <div className="space-y-4">
                                    {data.ordersByStatus.map((item) => {
                                        const config = getOrderStatus(item.status);
                                        return (
                                            <div key={item.status} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        {config.icon && <config.icon className={cn("size-4", config.color)} />}
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
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Top Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                            <CardDescription>Best performing products by revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.topProducts.length === 0 ? (
                                <EmptyState icon={Package} title="No product sales yet" className="py-8" />
                            ) : (
                                <div className="space-y-4">
                                    {data.topProducts.map((product, index) => (
                                        <div key={product.id} className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-muted-foreground w-4">
                                                {index + 1}
                                            </span>
                                            <div className="h-9 w-9 rounded-lg bg-muted overflow-hidden shrink-0">
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
                                                        <ImageIcon className="size-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.name}</p>
                                                <p className="text-xs leading-4 text-muted-foreground">
                                                    {product.quantity} sold
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
                                <EmptyState icon={Package} title="No category data yet" className="py-8" />
                            ) : (
                                <div className="space-y-4">
                                    <DonutChart data={data.topCategories} currency={currency} />
                                    <div className="space-y-3 pt-4">
                                        {data.topCategories.map((category, index) => {
                                            const colors = ["bg-primary", "bg-success", "bg-ds-teal-700", "bg-warning", "bg-info"];
                                            return (
                                                <div key={category.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("size-3.5 rounded-full", colors[index % colors.length])} />
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
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Customer Segments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Segments</CardTitle>
                            <CardDescription>Breakdown by purchase frequency</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.customerSegments.length === 0 ? (
                                <EmptyState icon={Users} title="No customer data yet" className="py-8" />
                            ) : (
                                <div className="space-y-4">
                                    {data.customerSegments.map((segment) => {
                                        const config = segmentConfig[segment.segment] || segmentConfig.New;
                                        const SegmentIcon = config.icon;
                                        return (
                                            <div key={segment.segment} className="flex items-center gap-4 p-3 rounded-lg border">
                                                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", config.color + "/10")}>
                                                    <SegmentIcon className={cn("size-4", config.color.replace("bg-", "text-"))} />
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
                            <Button variant="ghost" asChild>
                                <Link href="/dashboard/orders">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {data.recentOrders.length === 0 ? (
                                <EmptyState icon={ShoppingCart} title="No orders yet" className="py-8" />
                            ) : (
                                <div className="space-y-3">
                                    {data.recentOrders.map((order) => {
                                        const config = getOrderStatus(order.status);
                                        return (
                                            <Link
                                                key={order.id}
                                                href={`/dashboard/orders/${order.id}`}
                                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium">#{order.order_number}</p>
                                                    <p className="text-xs leading-4 text-muted-foreground">
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
            </EntityListPage>
        </TooltipProvider>
    );
}
