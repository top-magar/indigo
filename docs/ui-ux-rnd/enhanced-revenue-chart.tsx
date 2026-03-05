"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name === "current" ? "This month" : "Last month"}</span>
          </div>
          <span className="font-semibold tabular-nums">{formatCurrency(entry.value, currency)}</span>
        </div>
      ))}
    </div>
  );
}

export function EnhancedRevenueChart({ data, currency, totalCurrent, totalPrevious }: EnhancedRevenueChartProps) {
  const hasGrowth = totalCurrent !== undefined && totalPrevious !== undefined;
  const growth = hasGrowth
    ? totalPrevious === 0 ? (totalCurrent! > 0 ? 100 : 0)
    : Math.round(((totalCurrent! - totalPrevious!) / totalPrevious!) * 100)
    : 0;
  const isPositive = growth >= 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
            {hasGrowth && (
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-2xl font-semibold tabular-nums">{formatCurrency(totalCurrent!, currency)}</span>
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {Math.abs(growth)}%
                </span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/dashboard/analytics">
              Details <ArrowRight className="size-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} dy={8} />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dx={-5}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area
                type="monotone"
                dataKey="previous"
                stroke="hsl(var(--border))"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#rev-fill)"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
