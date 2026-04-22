"use client";

import { formatCurrency } from "@/shared/utils";

export interface HeroSectionProps {
  userName: string;
  todayRevenue: number;
  todayOrders: number;
  currency: string;
  storeSlug?: string;
  greeting: string;
  setupProgress?: number;
}

export function HeroSection({ userName, todayRevenue, todayOrders, currency, greeting }: HeroSectionProps) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{greeting}, {userName}</h1>
        <span className="text-xs text-muted-foreground">{today}</span>
      </div>
      <p className="text-sm text-muted-foreground tabular-nums">
        {formatCurrency(todayRevenue, currency)} revenue today · {todayOrders} order{todayOrders !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
