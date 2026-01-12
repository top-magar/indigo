"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, DollarSign, ShoppingCart, Users, Package, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Widget } from "../widget-types";

// Mock data for demonstration
const MOCK_STATS = {
  revenue: { value: "$45,231", trend: 12.5, direction: "up" as const, label: "Total Revenue" },
  orders: { value: "1,234", trend: 8.2, direction: "up" as const, label: "Orders" },
  customers: { value: "567", trend: -2.1, direction: "down" as const, label: "New Customers" },
  products: { value: "89", trend: 5.0, direction: "up" as const, label: "Products Sold" },
};

const STAT_ICONS: Record<string, LucideIcon> = {
  revenue: DollarSign,
  orders: ShoppingCart,
  customers: Users,
  products: Package,
};

export interface StatCardWidgetProps {
  widget: Widget;
}

export function StatCardWidget({ widget }: StatCardWidgetProps) {
  const statType = (widget.config?.settings?.statType as keyof typeof MOCK_STATS) || "revenue";
  const stat = MOCK_STATS[statType] || MOCK_STATS.revenue;
  const Icon = STAT_ICONS[statType] || DollarSign;

  return (
    <div className="flex items-center justify-between h-full">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{stat.label}</p>
        <p className="text-2xl font-semibold">{stat.value}</p>
        <div className="flex items-center gap-1">
          <Badge
            variant={stat.direction === "up" ? "default" : "destructive"}
            className="text-xs px-1.5 py-0 gap-0.5"
          >
            {stat.direction === "up" ? (
              <ArrowUp className="w-2.5 h-2.5" />
            ) : (
              <ArrowDown className="w-2.5 h-2.5" />
            )}
            {Math.abs(stat.trend)}%
          </Badge>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </div>
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  );
}
