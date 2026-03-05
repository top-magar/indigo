"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, ShoppingCart, Users, TrendingUp, Package, type LucideIcon } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  DollarSign, ShoppingCart, Users, TrendingUp, Package,
};

export interface EnhancedMetricData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  iconColor: string;
  href?: string;
  sparklineData?: number[];
  period?: string;
  isCurrency?: boolean;
}

export interface EnhancedMetricCardProps {
  metric: EnhancedMetricData;
  currency?: string;
}

function MiniBar({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px] h-10" aria-hidden="true">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${i === data.length - 1 ? "bg-foreground" : "bg-muted-foreground/20"}`}
          style={{ height: `${Math.max((v / max) * 100, 6)}%` }}
        />
      ))}
    </div>
  );
}

export function EnhancedMetricCard({ metric, currency, index }: EnhancedMetricCardProps & { index?: number }) {
  const Icon = iconMap[metric.icon] || TrendingUp;
  const hasChange = typeof metric.change === "number";
  const isPositive = hasChange && (metric.change ?? 0) >= 0;
  const isNeutral = hasChange && metric.change === 0;

  const formattedValue = typeof metric.value === "number" && currency && metric.isCurrency !== false
    ? formatCurrency(metric.value, currency)
    : metric.value;

  const ariaLabel = `${metric.label}: ${formattedValue}${hasChange ? `, ${isPositive ? "up" : "down"} ${Math.abs(metric.change ?? 0)}%` : ""}`;

  const content = (
    <CardContent className="p-5 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-[13px] leading-4 font-medium text-muted-foreground">{metric.label}</p>
        <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>

      <p className="text-2xl font-semibold tracking-[-0.96px] tabular-nums mt-1">
        {typeof metric.value === "number" && metric.value > 0 ? (
          <>
            {currency && metric.isCurrency !== false ? currency === "NPR" ? "₹" : "$" : ""}
            <NumberTicker value={metric.value} decimalPlaces={metric.isCurrency !== false && currency ? 0 : 0} />
          </>
        ) : formattedValue}
      </p>

      <div className="flex items-center gap-1.5 mt-1 min-h-[20px]">
        {hasChange && !isNeutral && (
          <span className={`inline-flex items-center gap-0.5 text-[13px] leading-4 font-medium tabular-nums ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {Math.abs(metric.change ?? 0)}%
          </span>
        )}
        {metric.changeLabel && (
          <span className="text-[13px] leading-4 text-muted-foreground">{metric.changeLabel}</span>
        )}
      </div>

      {metric.sparklineData && metric.sparklineData.length > 0 && (
        <div className="mt-auto pt-3">
          <MiniBar data={metric.sparklineData} />
        </div>
      )}
    </CardContent>
  );

  if (metric.href) {
    return (
      <Link href={metric.href} className="group block" aria-label={ariaLabel}>
        <GlowingEffect className="rounded-lg" spread={15} blur={2}>
          <Card className="h-full transition-colors hover:bg-muted/50">
            {content}
          </Card>
        </GlowingEffect>
      </Link>
    );
  }

  return (
    <GlowingEffect className="rounded-lg" spread={15} blur={2}>
      <Card className="h-full" role="article" aria-label={ariaLabel}>
        {content}
      </Card>
    </GlowingEffect>
  );
}
