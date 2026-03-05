"use client";

import { Button } from "@/components/ui/button";
import { TrendingUp, Package, Eye } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import Link from "next/link";

export interface HeroSectionProps {
  userName: string;
  todayRevenue: number;
  todayOrders: number;
  currency: string;
  storeSlug?: string;
  greeting: string;
}

export function HeroSection({
  userName,
  todayRevenue,
  todayOrders,
  currency,
  storeSlug,
  greeting,
}: HeroSectionProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{userName}</h1>
        <div className="flex items-center gap-3 pt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="size-3.5" />
            {formatCurrency(todayRevenue, currency)} today
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Package className="size-3.5" />
            {todayOrders} orders
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild size="sm">
          <Link href="/dashboard/products/new">
            <Package className="size-4 mr-2" />
            Add Product
          </Link>
        </Button>
        {storeSlug && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/store/${storeSlug}`} target="_blank">
              <Eye className="size-4 mr-2" />
              View Store
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
