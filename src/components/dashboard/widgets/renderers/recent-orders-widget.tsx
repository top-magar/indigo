"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/utils";
import type { Widget } from "../widget-types";

const MOCK_ORDERS = [
  { id: "1234", customer: "John Doe", total: "$125.00", status: "pending", date: "2 min ago" },
  { id: "1233", customer: "Jane Smith", total: "$89.50", status: "processing", date: "15 min ago" },
  { id: "1232", customer: "Bob Wilson", total: "$234.00", status: "shipped", date: "1 hour ago" },
  { id: "1231", customer: "Alice Brown", total: "$67.00", status: "delivered", date: "2 hours ago" },
  { id: "1230", customer: "Charlie Davis", total: "$156.00", status: "delivered", date: "3 hours ago" },
];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export interface RecentOrdersWidgetProps {
  widget: Widget;
}

export function RecentOrdersWidget({ widget }: RecentOrdersWidgetProps) {
  const maxItems = widget.config?.maxItems || 5;
  const orders = MOCK_ORDERS.slice(0, maxItems);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/dashboard/orders/${order.id}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">#{order.id}</span>
                <Badge className={cn("text-[10px] px-1.5 py-0", STATUS_STYLES[order.status as keyof typeof STATUS_STYLES])}>
                  {order.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{order.customer}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{order.total}</p>
              <p className="text-xs text-muted-foreground">{order.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}
