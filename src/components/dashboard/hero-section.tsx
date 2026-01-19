"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, TrendingUp, Package, Eye } from "lucide-react";
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
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[var(--ds-brand-600)]/5 via-transparent to-transparent">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--ds-brand-600)]/3 to-transparent" />
      
      <div className="relative p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* Left: Greeting & Stats */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--ds-gray-1000)] mb-2">
                {greeting}, {userName} 👋
              </h1>
              <p className="text-sm text-[var(--ds-gray-600)]">
                Here&apos;s what&apos;s happening with your store today.
              </p>
            </div>

            {/* Today's Stats - Inline Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className="h-9 px-4 gap-2 bg-white/80 backdrop-blur-sm border border-[var(--ds-gray-200)] text-[var(--ds-gray-900)] hover:bg-white transition-all"
              >
                <Calendar className="w-4 h-4 text-[var(--ds-brand-600)]" />
                <span className="text-sm font-medium">Today</span>
              </Badge>

              <Badge
                variant="secondary"
                className="h-9 px-4 gap-2 bg-white/80 backdrop-blur-sm border border-[var(--ds-gray-200)] hover:bg-white transition-all"
              >
                <TrendingUp className="w-4 h-4 text-[var(--ds-chart-2)]" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--ds-gray-600)]">Revenue:</span>
                  <span className="text-sm font-semibold text-[var(--ds-gray-1000)]">
                    {formatCurrency(todayRevenue, currency)}
                  </span>
                </div>
              </Badge>

              <Badge
                variant="secondary"
                className="h-9 px-4 gap-2 bg-white/80 backdrop-blur-sm border border-[var(--ds-gray-200)] hover:bg-white transition-all"
              >
                <Package className="w-4 h-4 text-[var(--ds-chart-1)]" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--ds-gray-600)]">Orders:</span>
                  <span className="text-sm font-semibold text-[var(--ds-gray-1000)]">
                    {todayOrders}
                  </span>
                </div>
              </Badge>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 px-6 bg-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-900)] text-white shadow-sm"
            >
              <Link href="/dashboard/products/new">
                <Package className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>

            {storeSlug && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 px-6 bg-white/80 backdrop-blur-sm border-[var(--ds-gray-300)] hover:bg-white hover:border-[var(--ds-gray-400)]"
              >
                <Link href={`/store/${storeSlug}`} target="_blank">
                  <Eye className="w-4 h-4 mr-2" />
                  View Store
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
