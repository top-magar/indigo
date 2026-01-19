"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { formatCurrency } from "@/shared/utils";

export interface PerformanceMetric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: "users" | "orders" | "revenue" | "products";
  trend?: number[]; // Mini sparkline data
  period?: string; // Date period indicator
}

export interface PerformanceGridProps {
  metrics: PerformanceMetric[];
  currency?: string;
}

const ICON_MAP = {
  users: { Icon: Users, color: "chart-4" },
  orders: { Icon: ShoppingBag, color: "chart-1" },
  revenue: { Icon: DollarSign, color: "chart-2" },
  products: { Icon: Package, color: "chart-5" },
};

interface MiniSparklineProps {
  data: number[];
  positive: boolean;
  label?: string;
}

function MiniSparkline({ data, positive, label }: MiniSparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const gradientId = `perf-sparkline-${Math.random().toString(36).slice(2, 9)}`;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor = positive ? "var(--ds-chart-2)" : "var(--ds-red-600)";
  const fillColor = positive ? "var(--ds-chart-2)" : "var(--ds-red-600)";

  return (
    <svg
      className="w-full h-6 mt-2"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      role="img"
      aria-label={label || "Trend sparkline"}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

function PerformanceCard({
  metric,
  currency,
}: {
  metric: PerformanceMetric;
  currency?: string;
}) {
  const { Icon, color } = ICON_MAP[metric.icon];
  const hasChange = typeof metric.change === "number";
  const isPositive = hasChange && (metric.change ?? 0) > 0;
  const isNegative = hasChange && (metric.change ?? 0) < 0;
  const isNeutral = hasChange && metric.change === 0;

  // Format value for display
  const formattedValue = typeof metric.value === "number" && currency
    ? formatCurrency(metric.value, currency)
    : metric.value;

  // Accessibility label
  const ariaLabel = `${metric.label}: ${formattedValue}${hasChange ? `, ${isPositive ? "up" : isNegative ? "down" : "no change"} ${Math.abs(metric.change ?? 0)}%` : ""}`;

  return (
    <Card 
      className="border-[var(--ds-gray-200)] hover:shadow-md hover:border-[var(--ds-gray-300)] transition-all duration-200"
      role="article"
      aria-label={ariaLabel}
    >
      <CardContent className="p-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs font-medium text-[var(--ds-gray-600)] uppercase tracking-wide truncate">
                {metric.label}
              </p>
              {metric.period && (
                <p className="text-[10px] text-[var(--ds-gray-500)]">
                  {metric.period}
                </p>
              )}
            </div>
            <div
              className={`h-8 w-8 rounded-lg bg-[var(--ds-${color})]/10 flex items-center justify-center shrink-0`}
              aria-hidden="true"
            >
              <Icon className={`w-4 h-4 text-[var(--ds-${color})]`} />
            </div>
          </div>

          {/* Value - Most prominent */}
          <div>
            <p className="text-2xl font-bold text-[var(--ds-gray-1000)] tabular-nums">
              {formattedValue}
            </p>
          </div>

          {/* Change Indicator */}
          {hasChange && (
            <div className="flex items-center gap-2 flex-wrap">
              {isPositive && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 gap-0.5 border-0 bg-[var(--ds-green-100)] text-[var(--ds-green-800)] text-[10px] font-medium tabular-nums"
                >
                  <ArrowUp className="w-2.5 h-2.5" aria-hidden="true" />
                  <span>{Math.abs(metric.change ?? 0)}%</span>
                </Badge>
              )}
              {isNegative && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 gap-0.5 border-0 bg-[var(--ds-red-100)] text-[var(--ds-red-800)] text-[10px] font-medium tabular-nums"
                >
                  <ArrowDown className="w-2.5 h-2.5" aria-hidden="true" />
                  <span>{Math.abs(metric.change ?? 0)}%</span>
                </Badge>
              )}
              {isNeutral && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 gap-0.5 border-0 bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)] text-[10px]"
                >
                  <Minus className="w-2.5 h-2.5" aria-hidden="true" />
                  <span>0%</span>
                </Badge>
              )}
              <span className="text-[10px] text-[var(--ds-gray-500)]">
                vs last period
              </span>
            </div>
          )}

          {/* Optional Sparkline */}
          {metric.trend && metric.trend.length > 0 && (
            <MiniSparkline 
              data={metric.trend} 
              positive={isPositive || isNeutral}
              label={`${metric.label} trend`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceGrid({ metrics, currency }: PerformanceGridProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--ds-gray-900)]">
          Performance Metrics
        </h3>
        <p className="text-xs text-[var(--ds-gray-600)] mt-0.5">
          Key indicators for your store&apos;s health
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <PerformanceCard
            key={metric.id}
            metric={metric}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
}
