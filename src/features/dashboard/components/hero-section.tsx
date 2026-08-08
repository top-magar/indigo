"use client";

import { formatCurrency } from "@/shared/utils";

interface HeroSectionProps {
  userName: string;
  todayRevenue: number;
  todayOrders: number;
  currency: string;
  greeting: string;
  storeSlug?: string;
  setupProgress?: number;
  isNewStore?: boolean;
}

export function HeroSection({ userName, todayRevenue, todayOrders, currency, greeting, isNewStore }: HeroSectionProps) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{today}</p>
      <h1 className="text-lg font-semibold tracking-tight">{greeting}, {userName}</h1>
      {isNewStore ? (
        <p className="text-sm text-muted-foreground">Let&apos;s get your store ready to sell</p>
      ) : (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span><span className="font-medium text-foreground tabular-nums">{formatCurrency(todayRevenue, currency)}</span> today</span>
          <span className="text-border">·</span>
          <span><span className="font-medium text-foreground tabular-nums">{todayOrders}</span> orders</span>
        </div>
      )}
    </div>
  );
}
