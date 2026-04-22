"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import Link from "next/link";

export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: "revenue" | "orders" | "customers" | "average";
  href?: string;
}

interface DashboardMetricsProps {
  metrics: MetricData[];
  currency?: string;
}

const ICON_MAP = {
  revenue: { Icon: DollarSign, color: "success" },
  orders: { Icon: ShoppingCart, color: "primary" },
  customers: { Icon: Users, color: "warning" },
  average: { Icon: TrendingUp, color: "info" },
};

function MetricCard({ metric, currency }: { metric: MetricData; currency?: string }) {
  const { Icon, color } = ICON_MAP[metric.icon];
  const hasChange = typeof metric.change === "number" && metric.change !== undefined;
  const isPositive = hasChange && (metric.change ?? 0) >= 0;
  const isNeutral = hasChange && metric.change === 0;

  const content = (
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="text-xl font-semibold tabular-nums">
            {typeof metric.value === "number" && currency
              ? formatCurrency(metric.value, currency)
              : metric.value}
          </p>
          <div className="flex items-center gap-1.5">
            {hasChange && !isNeutral && (
              <Badge
                variant="secondary"
                className={`text-xs px-1.5 py-0 gap-0.5 border-0 ${
                  isPositive
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {isPositive ? (
                  <ArrowUp className="w-2.5 h-2.5" />
                ) : (
                  <ArrowDown className="w-2.5 h-2.5" />
                )}
                {Math.abs(metric.change ?? 0)}%
              </Badge>
            )}
            {isNeutral && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 border-0 bg-muted text-muted-foreground"
              >
                No change
              </Badge>
            )}
            {metric.changeLabel && (
              <span className="text-xs text-muted-foreground">
                {metric.changeLabel}
              </span>
            )}
          </div>
        </div>
        <div
          className={`h-9 w-9 rounded-lg bg-${color}/10 flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 text-[var(--${color})]`} />
        </div>
      </div>
    </CardContent>
  );

  if (metric.href) {
    return (
      <Link href={metric.href}>
        <Card className="relative overflow-hidden transition-all duration-200 cursor-pointer">
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {content}
    </Card>
  );
}

export function DashboardMetrics({ metrics, currency }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} currency={currency} />
      ))}
    </div>
  );
}
