"use client";

import { Button } from "@/components/ui/button";
import { TrendingUp, Package, Eye, Calendar } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import Link from "next/link";

export interface HeroSectionProps {
  userName: string;
  todayRevenue: number;
  todayOrders: number;
  currency: string;
  storeSlug?: string;
  greeting: string;
  setupProgress?: number;
}

export function HeroSection({ userName, todayRevenue, todayOrders, currency, storeSlug, greeting, setupProgress }: HeroSectionProps) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {today}
            {typeof setupProgress === "number" && setupProgress < 100 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                Setup {setupProgress}%
              </span>
            )}
            {typeof setupProgress === "number" && setupProgress === 100 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                Store ready
              </span>
            )}
          </div>
          <h1 className="text-lg font-semibold tracking-tight">{greeting}, {userName}</h1>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-sm tabular-nums">
              <div className="size-6 rounded-md bg-success/10 flex items-center justify-center">
                <TrendingUp className="size-3 text-success" />
              </div>
              <span className="font-medium">{formatCurrency(todayRevenue, currency)}</span>
              <span className="text-muted-foreground">today</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-sm tabular-nums">
              <div className="size-6 rounded-md bg-info/10 flex items-center justify-center">
                <Package className="size-3 text-info" />
              </div>
              <span className="font-medium">{todayOrders}</span>
              <span className="text-muted-foreground">orders</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Package className="size-4" />
              Add Product
            </Link>
          </Button>
          {storeSlug && (
            <Button asChild variant="outline">
              <Link href={`/store/${storeSlug}`} target="_blank">
                <Eye className="size-4" />
                View Store
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
