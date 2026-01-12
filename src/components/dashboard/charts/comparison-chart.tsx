"use client";

import { useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils";
import type { ChartDataPoint, ChartType, ComparisonMode } from "./chart-types";

// ============================================================================
// Props
// ============================================================================

interface ComparisonChartProps {
  /** Current period data */
  currentData: ChartDataPoint[];
  /** Previous period data */
  previousData: ChartDataPoint[];
  /** Current period label */
  currentLabel?: string;
  /** Previous period label */
  previousLabel?: string;
  /** Display mode */
  mode?: "overlay" | "side-by-side";
  /** Chart type */
  chartType?: ChartType;
  /** Show percentage change */
  showPercentageChange?: boolean;
  /** Show trend indicators */
  showTrendIndicators?: boolean;
  /** Chart title */
  title?: string;
  /** Chart description */
  description?: string;
  /** Height in pixels */
  height?: number;
  /** Format value for display */
  formatValue?: (value: number) => string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Chart Config
// ============================================================================

const chartConfig = {
  current: {
    label: "Current Period",
    color: "var(--chart-1)",
  },
  previous: {
    label: "Previous Period",
    color: "var(--chart-3)",
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getTrend(change: number): "up" | "down" | "neutral" {
  if (change > 0.5) return "up";
  if (change < -0.5) return "down";
  return "neutral";
}

// ============================================================================
// Trend Indicator Component
// ============================================================================

interface TrendIndicatorProps {
  change: number;
  formatValue?: (value: number) => string;
}

function TrendIndicator({ change, formatValue }: TrendIndicatorProps) {
  const trend = getTrend(change);
  const absChange = Math.abs(change);

  return (
    <Badge
      variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
      className="gap-1"
    >
      {trend === "up" ? (
        <ChevronUp className="w-3 h-3" />
      ) : trend === "down" ? (
        <ChevronDown className="w-3 h-3" />
      ) : (
        <Minus className="w-3 h-3" />
      )}
      {absChange.toFixed(1)}%
    </Badge>
  );
}

// ============================================================================
// Summary Stats Component
// ============================================================================

interface SummaryStatsProps {
  currentTotal: number;
  previousTotal: number;
  formatValue?: (value: number) => string;
}

function SummaryStats({ currentTotal, previousTotal, formatValue }: SummaryStatsProps) {
  const change = calculatePercentageChange(currentTotal, previousTotal);
  const trend = getTrend(change);

  return (
    <div className="flex items-center gap-6 text-sm mb-4">
      <div>
        <span className="text-muted-foreground">Current: </span>
        <span className="font-semibold">
          {formatValue ? formatValue(currentTotal) : currentTotal.toLocaleString()}
        </span>
      </div>
      <div>
        <span className="text-muted-foreground">Previous: </span>
        <span className="font-semibold">
          {formatValue ? formatValue(previousTotal) : previousTotal.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Change: </span>
        <TrendIndicator change={change} />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ComparisonChart({
  currentData,
  previousData,
  currentLabel = "Current Period",
  previousLabel = "Previous Period",
  mode = "overlay",
  chartType = "area",
  showPercentageChange = true,
  showTrendIndicators = true,
  title = "Period Comparison",
  description = "Compare current vs previous period",
  height = 300,
  formatValue,
  isLoading = false,
  className,
}: ComparisonChartProps) {
  // Merge data for overlay mode
  const mergedData = useMemo(() => {
    if (mode === "overlay") {
      // Align data by x value
      const dataMap = new Map<string | number, { current?: number; previous?: number; label?: string }>();

      currentData.forEach((point) => {
        const key = point.x;
        dataMap.set(key, {
          ...dataMap.get(key),
          current: point.y,
          label: point.label,
        });
      });

      previousData.forEach((point) => {
        const key = point.x;
        dataMap.set(key, {
          ...dataMap.get(key),
          previous: point.y,
          label: point.label || dataMap.get(key)?.label,
        });
      });

      return Array.from(dataMap.entries()).map(([x, values]) => ({
        x,
        name: values.label || String(x),
        current: values.current || 0,
        previous: values.previous || 0,
        change: values.current && values.previous
          ? calculatePercentageChange(values.current, values.previous)
          : 0,
      }));
    }

    // Side-by-side mode - interleave data
    const maxLength = Math.max(currentData.length, previousData.length);
    return Array.from({ length: maxLength }, (_, i) => ({
      x: currentData[i]?.x || previousData[i]?.x || i,
      name: currentData[i]?.label || previousData[i]?.label || String(i),
      current: currentData[i]?.y || 0,
      previous: previousData[i]?.y || 0,
      change: currentData[i] && previousData[i]
        ? calculatePercentageChange(currentData[i].y, previousData[i].y)
        : 0,
    }));
  }, [currentData, previousData, mode]);

  // Calculate totals
  const currentTotal = useMemo(
    () => currentData.reduce((sum, p) => sum + p.y, 0),
    [currentData]
  );
  const previousTotal = useMemo(
    () => previousData.reduce((sum, p) => sum + p.y, 0),
    [previousData]
  );

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
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

  // Empty state
  if (currentData.length === 0 && previousData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-col items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            <p>No comparison data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const commonProps = {
    data: mergedData,
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
  };

  const updatedChartConfig = {
    current: {
      label: currentLabel,
      color: "var(--chart-1)",
    },
    previous: {
      label: previousLabel,
      color: "var(--chart-3)",
    },
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        {showPercentageChange && (
          <SummaryStats
            currentTotal={currentTotal}
            previousTotal={previousTotal}
            formatValue={formatValue}
          />
        )}

        {/* Chart */}
        <ChartContainer config={updatedChartConfig} className="w-full" style={{ height }}>
          {chartType === "area" ? (
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-current)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-current)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillPrevious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-previous)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-previous)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-muted-foreground text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatValue}
                className="text-muted-foreground text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const formattedValue = formatValue
                        ? formatValue(value as number)
                        : (value as number).toLocaleString();
                      return formattedValue;
                    }}
                  />
                }
              />
              <Area
                dataKey="previous"
                type="monotone"
                fill="url(#fillPrevious)"
                stroke="var(--color-previous)"
                strokeWidth={2}
                strokeDasharray="4 4"
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
          ) : chartType === "bar" ? (
            <BarChart {...commonProps}>
              <CartesianGrid vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-muted-foreground text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatValue}
                className="text-muted-foreground text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="previous"
                fill="var(--color-previous)"
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
              <Bar
                dataKey="current"
                fill="var(--color-current)"
                radius={[4, 4, 0, 0]}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          ) : (
            <LineChart {...commonProps}>
              <CartesianGrid vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-muted-foreground text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatValue}
                className="text-muted-foreground text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="previous"
                type="monotone"
                stroke="var(--color-previous)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                dataKey="current"
                type="monotone"
                stroke="var(--color-current)"
                strokeWidth={2}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          )}
        </ChartContainer>

        {/* Per-point trend indicators */}
        {showTrendIndicators && mode === "overlay" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {mergedData.slice(0, 5).map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 text-xs bg-muted/50 rounded-md px-2 py-1"
              >
                <span className="text-muted-foreground">{point.name}:</span>
                <TrendIndicator change={point.change} />
              </div>
            ))}
            {mergedData.length > 5 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{mergedData.length - 5} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

export function ComparisonChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="w-full" style={{ height }} />
      </CardContent>
    </Card>
  );
}
