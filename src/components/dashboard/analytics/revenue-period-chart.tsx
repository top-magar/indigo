"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Bar,
    BarChart,
    Line,
    LineChart,
    ResponsiveContainer,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/shared/utils";
import type { RevenueByPeriod } from "@/features/analytics/repositories/analytics-types";

// Chart configuration using design system colors
const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "var(--chart-1)",
    },
    orders: {
        label: "Orders",
        color: "var(--chart-2)",
    },
    avgOrderValue: {
        label: "Avg Order Value",
        color: "var(--chart-3)",
    },
};

type ChartType = "area" | "bar" | "line";

interface RevenuePeriodChartProps {
    data: RevenueByPeriod | null;
    currency?: string;
    isLoading?: boolean;
    showControls?: boolean;
    height?: number;
    title?: string;
    description?: string;
}

// Format currency for chart axis
function formatAxisValue(value: number, currency: string) {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
}

export function RevenuePeriodChart({
    data,
    currency = "USD",
    isLoading = false,
    showControls = true,
    height = 300,
    title = "Revenue Over Time",
    description = "Revenue and order trends",
}: RevenuePeriodChartProps) {
    const [chartType, setChartType] = useState<ChartType>("area");
    const [showOrders, setShowOrders] = useState(true);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full" style={{ height }} />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="flex flex-col items-center justify-center text-muted-foreground"
                        style={{ height }}
                    >
                        <p>No revenue data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Format dates for display
    const chartData = data.data.map((point) => ({
        ...point,
        formattedDate: format(new Date(point.date), "MMM d"),
    }));

    const currencySymbol =
        currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "";

    const commonProps = {
        data: chartData,
        margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                {showControls && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-7 px-2 text-xs", chartType === "area" && "bg-muted")}
                            onClick={() => setChartType("area")}
                        >
                            Area
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-7 px-2 text-xs", chartType === "line" && "bg-muted")}
                            onClick={() => setChartType("line")}
                        >
                            Line
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-7 px-2 text-xs", chartType === "bar" && "bg-muted")}
                            onClick={() => setChartType("bar")}
                        >
                            Bar
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {/* Summary stats */}
                <div className="flex items-center gap-6 text-sm mb-4">
                    <div>
                        <span className="text-muted-foreground">Total: </span>
                        <span className="font-semibold">
                            {formatCurrency(data.totals.revenue, currency)}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Orders: </span>
                        <span className="font-semibold">{data.totals.orders}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">AOV: </span>
                        <span className="font-semibold">
                            {formatCurrency(data.totals.avgOrderValue, currency)}
                        </span>
                    </div>
                </div>

                <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
                    {chartType === "area" ? (
                        <AreaChart {...commonProps}>
                            <defs>
                                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} className="stroke-muted" />
                            <XAxis
                                dataKey="formattedDate"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                className="text-muted-foreground text-xs"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `${currencySymbol}${formatAxisValue(value, currency)}`}
                                className="text-muted-foreground text-xs"
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => {
                                            if (name === "revenue") {
                                                return formatCurrency(value as number, currency);
                                            }
                                            return value;
                                        }}
                                    />
                                }
                            />
                            <Area
                                dataKey="revenue"
                                type="monotone"
                                fill="url(#fillRevenue)"
                                stroke="var(--color-revenue)"
                                strokeWidth={2}
                            />
                            {showOrders && (
                                <Area
                                    dataKey="orders"
                                    type="monotone"
                                    fill="transparent"
                                    stroke="var(--color-orders)"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                />
                            )}
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    ) : chartType === "line" ? (
                        <LineChart {...commonProps}>
                            <CartesianGrid vertical={false} className="stroke-muted" />
                            <XAxis
                                dataKey="formattedDate"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                className="text-muted-foreground text-xs"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `${currencySymbol}${formatAxisValue(value, currency)}`}
                                className="text-muted-foreground text-xs"
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                dataKey="revenue"
                                type="monotone"
                                stroke="var(--color-revenue)"
                                strokeWidth={2}
                                dot={false}
                            />
                            {showOrders && (
                                <Line
                                    dataKey="orders"
                                    type="monotone"
                                    stroke="var(--color-orders)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}
                            <ChartLegend content={<ChartLegendContent />} />
                        </LineChart>
                    ) : (
                        <BarChart {...commonProps}>
                            <CartesianGrid vertical={false} className="stroke-muted" />
                            <XAxis
                                dataKey="formattedDate"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                className="text-muted-foreground text-xs"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `${currencySymbol}${formatAxisValue(value, currency)}`}
                                className="text-muted-foreground text-xs"
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                            <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function RevenuePeriodChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6 mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="w-full" style={{ height }} />
            </CardContent>
        </Card>
    );
}
