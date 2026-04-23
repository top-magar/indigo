"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import { cn } from "@/shared/utils";

export interface EnhancedMetricData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
  iconColor?: string;
  href?: string;
  sparklineData?: number[];
  period?: string;
  isCurrency?: boolean;
}

interface Props {
  metric: EnhancedMetricData;
  currency?: string;
}

export function EnhancedMetricCard({ metric, currency = "NPR" }: Props) {
  const { label, value, change, changeLabel, isCurrency = true } = metric;
  const formatted = isCurrency !== false ? formatCurrency(Number(value), currency) : String(value);
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 px-4 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{formatted}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isPositive ? (
              <ArrowUp className="size-3 text-foreground" />
            ) : (
              <ArrowDown className="size-3 text-foreground" />
            )}
            <span className={cn("font-medium", isPositive ? "text-foreground" : "text-foreground")}>
              {isPositive ? "+" : ""}{change.toFixed(1)}%
            </span>
            {changeLabel && <span>{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
