"use client";

import { formatCurrency } from "@/shared/utils";

export interface ChartDataPoint {
  date: string;
  current: number;
  previous: number;
}

interface Props {
  data: ChartDataPoint[];
  currency: string;
  totalCurrent: number;
  totalPrevious: number;
}

export function EnhancedRevenueChart({ data, currency, totalCurrent, totalPrevious }: Props) {
  const growth = totalPrevious > 0 ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100) : 0;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div>
        <p className="text-xs text-muted-foreground">Revenue</p>
        <p className="text-xl font-semibold tabular-nums">{formatCurrency(totalCurrent, currency)}</p>
        <p className="text-xs text-muted-foreground">{growth >= 0 ? "+" : ""}{growth}% vs last period</p>
      </div>
      <div className="flex items-end gap-1 h-24">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full bg-foreground/15 rounded-sm" style={{ height: `${Math.max(4, (d.current / (Math.max(...data.map(p => p.current)) || 1)) * 80)}px` }} />
            <span className="text-[9px] text-muted-foreground">{d.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
