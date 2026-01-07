"use client";

import { useState } from "react";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";

// Chart configuration using design system colors
const chartConfig = {
    current: {
        label: "Current Period",
        color: "var(--chart-1)",
    },
    previous: {
        label: "Previous Period",
        color: "var(--chart-2)",
    },
};

type ChartType = "area" | "bar";

interface RevenueChartProps {
    data: Array<{ date: string; current: number; previous: number }>;
    currency?: string;
    showControls?: boolean;
    height?: number;
}

// Format currency for chart axis
function formatAxisValue(value: number) {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
}

export function RevenueChart({ 
    data, 
    currency = "INR",
    showControls = false,
    height = 200 
}: RevenueChartProps) {
    const [chartType, setChartType] = useState<ChartType>("area");

    const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "";

    const commonProps = {
        data,
        margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    return (
        <div className="space-y-3">
            {showControls && (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-7 px-2 text-xs",
                            chartType === "area" && "bg-muted"
                        )}
                        onClick={() => setChartType("area")}
                    >
                        Area
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-7 px-2 text-xs",
                            chartType === "bar" && "bg-muted"
                        )}
                        onClick={() => setChartType("bar")}
                    >
                        Bar
                    </Button>
                </div>
            )}

            <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
                {chartType === "area" ? (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-current)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--color-current)" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="fillPrevious" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-previous)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--color-previous)" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-muted-foreground text-xs"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `${currencySymbol}${formatAxisValue(value)}`}
                            className="text-muted-foreground text-xs"
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                            dataKey="previous"
                            type="monotone"
                            fill="url(#fillPrevious)"
                            stroke="var(--color-previous)"
                            strokeWidth={2}
                        />
                        <Area
                            dataKey="current"
                            type="monotone"
                            fill="url(#fillCurrent)"
                            stroke="var(--color-current)"
                            strokeWidth={2}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                ) : (
                    <BarChart {...commonProps}>
                        <CartesianGrid vertical={false} className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-muted-foreground text-xs"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `${currencySymbol}${formatAxisValue(value)}`}
                            className="text-muted-foreground text-xs"
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                            dataKey="previous"
                            fill="var(--color-previous)"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="current"
                            fill="var(--color-current)"
                            radius={[4, 4, 0, 0]}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                )}
            </ChartContainer>
        </div>
    );
}
