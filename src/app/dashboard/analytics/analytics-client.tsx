"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
    Download,
    Calendar,
    TrendingUp,
    Package,
    ShoppingCart,
    BarChart3,
    Image as ImageIcon,
} from "lucide-react";
import { getOrderStatus } from "@/config/status";
import { Button } from "@/components/ui/button";
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
import { RevenueChart } from "@/features/analytics/components";

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

function StatItem({ label, value, change }: { label: string; value: string; change: number }) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight">{value}</p>
            <p className={cn("text-xs tabular-nums", change >= 0 ? "text-success" : "text-destructive")}>
                {change >= 0 ? "+" : ""}{change.toFixed(1)}%
            </p>
        </div>
    );
}

function hasData(data: AnalyticsData): boolean {
    const { overview } = data;
    return overview.revenue > 0 || overview.orders > 0 || overview.customers > 0;
}

export function AnalyticsDashboardView({
    data,
    currency,
    dateRange,
    isFreeTier = false,
    isPending = false,
    onRangeChange,
    onExport,
}: AnalyticsDashboardViewProps) {
    const { overview } = data;
    const empty = !hasData(data);

    return (
        <TooltipProvider>
            <div className={cn("space-y-6", isPending && "opacity-60 pointer-events-none transition-opacity")}>
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-lg font-semibold tracking-tight">Analytics</h1>
                    <div className="flex items-center gap-2">
                        {isFreeTier ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-muted-foreground">
                                        <Calendar className="size-3.5" />
                                        <span className="text-sm">Last 7 days</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Upgrade to access longer date ranges</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Select value={dateRange} onValueChange={(v) => onRangeChange?.(v)}>
                                <SelectTrigger className="w-[160px] bg-background" aria-label="Date range">
                                    <Calendar className="size-3.5" />
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
                            <Download className="size-3.5" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Free Tier Banner */}
                {isFreeTier && (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-warning/40">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-warning/10 flex items-center justify-center">
                                <TrendingUp className="size-4 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">You&apos;re viewing limited analytics</p>
                                <p className="text-xs text-muted-foreground">
                                    Free plan shows last 7 days only. Upgrade for full history and advanced insights.
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/settings?tab=billing">Upgrade</Link>
                        </Button>
                    </div>
                )}

                {empty ? (
                    <EmptyState
                        icon={BarChart3}
                        title="No analytics data yet"
                        description="Once you receive orders, your sales data will appear here."
                        className="py-16"
                    />
                ) : (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 rounded-lg border p-4">
                            <StatItem label="Revenue" value={formatCurrency(overview.revenue, currency)} change={overview.revenueChange} />
                            <StatItem label="Orders" value={overview.orders.toLocaleString()} change={overview.ordersChange} />
                            <StatItem label="Avg Order" value={formatCurrency(overview.avgOrderValue, currency)} change={overview.avgOrderValueChange} />
                            <StatItem label="Customers" value={overview.customers.toLocaleString()} change={overview.customersChange} />
                        </div>

                        {/* Revenue Chart */}
                        <div className="rounded-lg border p-4 space-y-3">
                            <h2 className="text-sm font-medium">Revenue Over Time</h2>
                            <RevenueChart data={data.revenueChart} currency={currency} />
                        </div>

                        {/* Bottom Row: Top Products + Orders by Status */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Top Products */}
                            <div className="rounded-lg border p-4 space-y-3">
                                <h2 className="text-sm font-medium">Top Products</h2>
                                {data.topProducts.length === 0 ? (
                                    <EmptyState icon={Package} title="No product sales yet" className="py-8" />
                                ) : (
                                    <div className="space-y-3">
                                        {data.topProducts.map((product, index) => (
                                            <div key={product.id} className="flex items-center gap-3">
                                                <span className="text-xs font-semibold tabular-nums text-muted-foreground w-5 text-center">{index + 1}</span>
                                                <div className="size-8 rounded bg-muted overflow-hidden shrink-0">
                                                    {product.image ? (
                                                        <Image src={product.image} alt={product.name} width={32} height={32} className="size-full object-cover" />
                                                    ) : (
                                                        <div className="size-full flex items-center justify-center">
                                                            <ImageIcon className="size-3.5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="flex-1 min-w-0 text-sm truncate">{product.name}</span>
                                                <span className="text-sm font-medium tabular-nums">{formatCurrency(product.revenue, currency)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Orders by Status */}
                            <div className="rounded-lg border p-4 space-y-3">
                                <h2 className="text-sm font-medium">Orders by Status</h2>
                                {data.ordersByStatus.length === 0 ? (
                                    <EmptyState icon={ShoppingCart} title="No orders yet" className="py-8" />
                                ) : (
                                    <div className="space-y-3">
                                        {data.ordersByStatus.map((item) => {
                                            const config = getOrderStatus(item.status);
                                            return (
                                                <div key={item.status} className="flex items-center gap-3">
                                                    <span className="text-sm w-24 shrink-0">{config.label}</span>
                                                    <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{item.count}</span>
                                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full", config.color.replace("text-", "bg-"))}
                                                            style={{ width: `${item.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </TooltipProvider>
    );
}
