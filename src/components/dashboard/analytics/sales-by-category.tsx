"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Folder } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/shared/utils";
import type { SalesByCategoryResponse } from "@/features/analytics/repositories/analytics-types";

interface SalesByCategoryProps {
    data: SalesByCategoryResponse | null;
    currency?: string;
    isLoading?: boolean;
    showLegend?: boolean;
}

// Chart colors using design system
const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

const CHART_COLOR_CLASSES = [
    "bg-chart-1",
    "bg-chart-2",
    "bg-chart-3",
    "bg-chart-4",
    "bg-chart-5",
];

export function SalesByCategory({
    data,
    currency = "USD",
    isLoading = false,
    showLegend = true,
}: SalesByCategoryProps) {
    if (isLoading) {
        return <SalesByCategorySkeleton />;
    }

    if (!data || data.categories.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                    <CardDescription>Revenue distribution across categories</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <Folder className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">No category data yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Prepare chart data
    const chartData = data.categories.map((cat, index) => ({
        name: cat.name,
        value: cat.revenue,
        percentage: cat.percentage,
        color: CHART_COLORS[index % CHART_COLORS.length],
        colorClass: CHART_COLOR_CLASSES[index % CHART_COLOR_CLASSES.length],
    }));

    // Add uncategorized if exists
    if (data.uncategorizedRevenue > 0) {
        const uncatPercentage =
            data.totalRevenue > 0 ? (data.uncategorizedRevenue / data.totalRevenue) * 100 : 0;
        chartData.push({
            name: "Uncategorized",
            value: data.uncategorizedRevenue,
            percentage: uncatPercentage,
            color: "var(--muted)",
            colorClass: "bg-muted",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Pie Chart */}
                    <div className="w-full lg:w-1/2 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-background border rounded-xl px-3 py-2 shadow-lg">
                                                    <p className="font-medium">{data.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatCurrency(data.value, currency)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {data.percentage.toFixed(1)}%
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    {showLegend && (
                        <div className="w-full lg:w-1/2 space-y-3">
                            {chartData.slice(0, 5).map((category, index) => (
                                <div key={category.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn("h-3 w-3 rounded-full", category.colorClass)}
                                        />
                                        <span className="text-sm truncate max-w-[120px]">
                                            {category.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">
                                            {category.percentage.toFixed(1)}%
                                        </span>
                                        <span className="text-sm font-medium">
                                            {formatCurrency(category.value, currency)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {chartData.length > 5 && (
                                <p className="text-xs text-muted-foreground">
                                    +{chartData.length - 5} more categories
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-semibold">
                        {formatCurrency(data.totalRevenue, currency)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export function SalesByCategorySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    <Skeleton className="w-[160px] h-[160px] rounded-full" />
                    <div className="w-full lg:w-1/2 space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3 w-3 rounded-full" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
