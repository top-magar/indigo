"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { formatCurrency } from "@/shared/utils";

export interface ChartDataPoint {
  date: string;
  current: number;
  previous: number;
}

export interface EnhancedRevenueChartProps {
  data: ChartDataPoint[];
  currency: string;
  totalCurrent?: number;
  totalPrevious?: number;
}

function CustomTooltip({ active, payload, label, currency }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[var(--ds-gray-200)] rounded-xl shadow-xl p-4 backdrop-blur-sm">
        <p className="text-xs font-semibold text-[var(--ds-gray-900)] mb-3">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-6 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[var(--ds-gray-600)] font-medium">
                  {entry.name === "current" ? "This month" : "Last month"}
                </span>
              </div>
              <span className="font-semibold text-[var(--ds-gray-1000)]">
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function EnhancedRevenueChart({
  data,
  currency,
  totalCurrent,
  totalPrevious,
}: EnhancedRevenueChartProps) {
  // Calculate growth if totals provided
  const hasGrowth = totalCurrent !== undefined && totalPrevious !== undefined;
  const growth = hasGrowth
    ? totalPrevious === 0
      ? totalCurrent! > 0
        ? 100
        : 0
      : Math.round(((totalCurrent! - totalPrevious!) / totalPrevious!) * 100)
    : 0;
  const isPositiveGrowth = growth >= 0;

  return (
    <Card className="border-[var(--ds-gray-200)]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold text-[var(--ds-gray-900)]">
                Revenue Overview
              </CardTitle>
              {hasGrowth && (
                <Badge
                  variant="secondary"
                  className={`h-6 px-2 gap-1 border-0 text-xs font-medium ${
                    isPositiveGrowth
                      ? "bg-[var(--ds-chart-2)]/10 text-[var(--ds-chart-2)]"
                      : "bg-[var(--ds-red-100)] text-[var(--ds-red-800)]"
                  }`}
                >
                  {isPositiveGrowth ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(growth)}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-[var(--ds-gray-600)]">
              Comparing current vs previous month
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/dashboard/analytics"
              className="text-[var(--ds-gray-700)] hover:text-[var(--ds-gray-900)]"
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {/* Gradient for current month */}
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--ds-chart-1)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--ds-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
                {/* Gradient for previous month */}
                <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--ds-gray-400)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--ds-gray-400)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--ds-gray-200)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="var(--ds-gray-400)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="var(--ds-gray-400)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  }
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend
                wrapperStyle={{
                  paddingTop: "24px",
                  fontSize: "12px",
                }}
                formatter={(value) =>
                  value === "current" ? "This month" : "Last month"
                }
              />
              {/* Previous month - dashed line with subtle fill */}
              <Area
                type="monotone"
                dataKey="previous"
                stroke="var(--ds-gray-400)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorPrevious)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--ds-gray-400)" }}
              />
              {/* Current month - solid line with gradient fill */}
              <Area
                type="monotone"
                dataKey="current"
                stroke="var(--ds-chart-1)"
                strokeWidth={3}
                fill="url(#colorCurrent)"
                dot={false}
                activeDot={{ r: 5, fill: "var(--ds-chart-1)", strokeWidth: 2, stroke: "white" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
