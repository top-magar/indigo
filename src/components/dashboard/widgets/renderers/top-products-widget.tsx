"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/utils";
import type { Widget } from "../widget-types";

const MOCK_PRODUCTS = [
  { id: "1", name: "Blue T-Shirt", sales: 234, revenue: "$4,680", trend: 12.5, direction: "up" as const },
  { id: "2", name: "Black Jeans", sales: 189, revenue: "$7,560", trend: 8.2, direction: "up" as const },
  { id: "3", name: "White Sneakers", sales: 156, revenue: "$12,480", trend: -3.1, direction: "down" as const },
  { id: "4", name: "Red Hoodie", sales: 134, revenue: "$5,360", trend: 15.0, direction: "up" as const },
  { id: "5", name: "Gray Cap", sales: 98, revenue: "$1,960", trend: 2.5, direction: "up" as const },
];

export interface TopProductsWidgetProps {
  widget: Widget;
}

export function TopProductsWidget({ widget }: TopProductsWidgetProps) {
  const maxItems = widget.config?.maxItems || 5;
  const products = MOCK_PRODUCTS.slice(0, maxItems);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2">
        {products.map((product, index) => (
          <Link
            key={product.id}
            href={`/dashboard/products/${product.id}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.sales} sales</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{product.revenue}</p>
              <div className={cn(
                "flex items-center justify-end gap-0.5 text-xs",
                product.direction === "up" ? "text-[color:var(--ds-green-700)]" : "text-[color:var(--ds-red-700)]"
              )}>
                {product.direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(product.trend)}%
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}
