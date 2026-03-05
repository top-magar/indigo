"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Users, ShoppingBag, DollarSign, Package, type LucideIcon } from "lucide-react";
import { formatCurrency } from "@/shared/utils";

export interface PerformanceMetric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: "users" | "orders" | "revenue" | "products";
  trend?: number[];
  period?: string;
}

export interface PerformanceGridProps {
  metrics: PerformanceMetric[];
  currency?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  users: Users,
  orders: ShoppingBag,
  revenue: DollarSign,
  products: Package,
};

function PerformanceCard({ metric, currency }: { metric: PerformanceMetric; currency?: string }) {
  const Icon = ICON_MAP[metric.icon] || ShoppingBag;
  const hasChange = typeof metric.change === "number";
  const isPositive = hasChange && (metric.change ?? 0) > 0;
  const isNegative = hasChange && (metric.change ?? 0) < 0;

  const formattedValue = typeof metric.value === "number" && currency
    ? formatCurrency(metric.value, currency)
    : metric.value;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
          <div className="size-8 rounded-md bg-muted flex items-center justify-center">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
        <p className="text-2xl font-semibold tabular-nums">{formattedValue}</p>
        {hasChange && (
          <div className="flex items-center gap-1 mt-1.5">
            {isPositive && <ArrowUp className="size-3 text-emerald-600 dark:text-emerald-400" />}
            {isNegative && <ArrowDown className="size-3 text-destructive" />}
            <span className={`text-xs font-medium tabular-nums ${isPositive ? "text-emerald-600 dark:text-emerald-400" : isNegative ? "text-destructive" : "text-muted-foreground"}`}>
              {isPositive || isNegative ? `${Math.abs(metric.change ?? 0)}%` : "0%"}
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
        {metric.trend && metric.trend.length > 0 && (
          <div className="flex items-end gap-[3px] h-8 mt-3" aria-hidden="true">
            {metric.trend.map((v, i) => {
              const max = Math.max(...(metric.trend || [1]));
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${i === (metric.trend?.length ?? 0) - 1 ? "bg-primary" : "bg-muted-foreground/20"}`}
                  style={{ height: `${Math.max((v / max) * 100, 6)}%` }}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PerformanceGrid({ metrics, currency }: PerformanceGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Performance</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <PerformanceCard key={m.id} metric={m} currency={currency} />
        ))}
      </div>
    </div>
  );
}
