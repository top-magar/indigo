"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, DollarSign, ShoppingCart, Users, TrendingUp, Package, type LucideIcon } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import Link from "next/link";

// Icon mapping - extend as needed
const iconMap: Record<string, LucideIcon> = {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
};

export interface EnhancedMetricData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string; // Icon name as string (e.g., "DollarSign", "ShoppingCart")
  iconColor: string; // e.g., "chart-1", "chart-2"
  href?: string;
  sparklineData?: number[]; // Optional mini trend line
  period?: string; // Date period indicator (e.g., "Last 30 days")
}

export interface EnhancedMetricCardProps {
  metric: EnhancedMetricData;
  currency?: string;
}

interface MiniSparklineProps {
  data: number[];
  positive?: boolean;
  label?: string;
}

function MiniSparkline({ data, positive = true, label }: MiniSparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2, 9)}`;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  // Create area fill path
  const areaPath = `M0,100 L${points.split(" ").map((p, i) => {
    if (i === 0) return p;
    return `L${p}`;
  }).join(" ")} L100,100 Z`;

  const strokeColor = positive ? "var(--ds-chart-2)" : "var(--ds-red-600)";
  const fillColor = positive ? "var(--ds-chart-2)" : "var(--ds-red-600)";

  return (
    <svg
      className="w-full h-8 mt-2"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      role="img"
      aria-label={label || "Trend sparkline"}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function EnhancedMetricCard({ metric, currency }: EnhancedMetricCardProps) {
  const Icon = iconMap[metric.icon] || TrendingUp;
  const hasChange = typeof metric.change === "number";
  const isPositive = hasChange && (metric.change ?? 0) >= 0;
  const isNeutral = hasChange && metric.change === 0;

  // Format value for display
  const formattedValue = typeof metric.value === "number" && currency
    ? formatCurrency(metric.value, currency)
    : metric.value;

  // Accessibility label
  const ariaLabel = `${metric.label}: ${formattedValue}${hasChange ? `, ${isPositive ? "up" : "down"} ${Math.abs(metric.change ?? 0)}%` : ""}`;

  const content = (
    <CardContent className="p-6">
      <div className="space-y-3">
        {/* Header: Label + Period + Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-medium text-[var(--ds-gray-600)] truncate">
              {metric.label}
            </p>
            {metric.period && (
              <p className="text-xs text-[var(--ds-gray-500)]">
                {metric.period}
              </p>
            )}
          </div>
          <div
            className={`h-10 w-10 rounded-lg bg-[var(--ds-${metric.iconColor})]/10 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
            aria-hidden="true"
          >
            <Icon className={`w-5 h-5 text-[var(--ds-${metric.iconColor})]`} />
          </div>
        </div>

        {/* Value - Most prominent element */}
        <div>
          <p className="text-3xl font-bold text-[var(--ds-gray-1000)] tracking-tight tabular-nums">
            {formattedValue}
          </p>
        </div>

        {/* Change Indicator + Label */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasChange && !isNeutral && (
            <Badge
              variant="secondary"
              className={`h-5 px-2 gap-1 border-0 text-xs font-medium tabular-nums ${
                isPositive
                  ? "bg-[var(--ds-green-100)] text-[var(--ds-green-800)]"
                  : "bg-[var(--ds-red-100)] text-[var(--ds-red-800)]"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="w-3 h-3" aria-hidden="true" />
              ) : (
                <ArrowDown className="w-3 h-3" aria-hidden="true" />
              )}
              <span>{Math.abs(metric.change ?? 0)}%</span>
            </Badge>
          )}
          {isNeutral && (
            <Badge
              variant="secondary"
              className="h-5 px-2 border-0 text-xs bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)]"
            >
              No change
            </Badge>
          )}
          {metric.changeLabel && (
            <span className="text-xs text-[var(--ds-gray-500)]">
              {metric.changeLabel}
            </span>
          )}
        </div>

        {/* Optional Sparkline with gradient fill */}
        {metric.sparklineData && metric.sparklineData.length > 0 && (
          <MiniSparkline 
            data={metric.sparklineData} 
            positive={isPositive}
            label={`${metric.label} trend`}
          />
        )}
      </div>
    </CardContent>
  );

  if (metric.href) {
    return (
      <Link 
        href={metric.href} 
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-gray-900)] focus-visible:ring-offset-2 rounded-lg"
        aria-label={ariaLabel}
      >
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--ds-gray-300)] cursor-pointer border-[var(--ds-gray-200)]">
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card 
      className="relative overflow-hidden border-[var(--ds-gray-200)]"
      role="article"
      aria-label={ariaLabel}
    >
      {content}
    </Card>
  );
}
