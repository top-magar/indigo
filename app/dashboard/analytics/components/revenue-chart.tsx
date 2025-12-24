"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

interface RevenueChartProps {
    data: RevenueDataPoint[];
    currency: string;
}

function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

export function RevenueChart({ data, currency }: RevenueChartProps) {
    const { maxRevenue, totalRevenue, totalOrders } = useMemo(() => {
        const max = Math.max(...data.map(d => d.revenue), 1);
        const total = data.reduce((sum, d) => sum + d.revenue, 0);
        const orders = data.reduce((sum, d) => sum + d.orders, 0);
        return { maxRevenue: max, totalRevenue: total, totalOrders: orders };
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[200px]">
                <p className="text-sm text-muted-foreground">No data available</p>
            </div>
        );
    }

    // Limit bars for readability
    const displayData = data.length > 31 ? data.filter((_, i) => i % Math.ceil(data.length / 31) === 0) : data;

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-6 text-sm">
                <div>
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-semibold">{formatCurrency(totalRevenue, currency)}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">Orders: </span>
                    <span className="font-semibold">{totalOrders}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">Avg/day: </span>
                    <span className="font-semibold">{formatCurrency(totalRevenue / data.length, currency)}</span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[200px] flex items-end gap-1">
                {displayData.map((point, index) => {
                    const height = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                    const isWeekend = new Date(point.date).getDay() === 0 || new Date(point.date).getDay() === 6;
                    
                    return (
                        <Tooltip key={point.date}>
                            <TooltipTrigger asChild>
                                <div
                                    className="flex-1 min-w-[4px] max-w-[24px] group cursor-pointer"
                                    style={{ height: "100%" }}
                                >
                                    <div
                                        className={cn(
                                            "w-full rounded-t transition-all duration-200",
                                            "bg-chart-1 group-hover:bg-chart-1/80",
                                            isWeekend && "bg-chart-1/60"
                                        )}
                                        style={{ 
                                            height: `${Math.max(height, 2)}%`,
                                            marginTop: `${100 - Math.max(height, 2)}%`
                                        }}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-xs space-y-1">
                                    <p className="font-medium">{format(new Date(point.date), "MMM d, yyyy")}</p>
                                    <p>Revenue: {formatCurrency(point.revenue, currency)}</p>
                                    <p>Orders: {point.orders}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{format(new Date(data[0].date), "MMM d")}</span>
                {data.length > 7 && (
                    <span>{format(new Date(data[Math.floor(data.length / 2)].date), "MMM d")}</span>
                )}
                <span>{format(new Date(data[data.length - 1].date), "MMM d")}</span>
            </div>
        </div>
    );
}
