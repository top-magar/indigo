"use client";

import * as React from "react";
import { ShoppingCart, UserPlus, Package, CreditCard, type LucideIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/utils";
import type { Widget } from "../widget-types";

interface Activity {
  id: string;
  type: string;
  message: string;
  actor: { name: string };
  time: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "order",
    message: "New order #1234 placed",
    actor: { name: "John Doe" },
    time: "2 min ago",
    icon: ShoppingCart,
    iconColor: "text-[color:var(--ds-blue-700)]",
    iconBg: "bg-[var(--ds-blue-100)] dark:bg-[var(--ds-blue-900)]/30",
  },
  {
    id: "2",
    type: "customer",
    message: "New customer registered",
    actor: { name: "Jane Smith" },
    time: "15 min ago",
    icon: UserPlus,
    iconColor: "text-[color:var(--ds-green-700)]",
    iconBg: "bg-[var(--ds-green-100)] dark:bg-[var(--ds-green-900)]/30",
  },
  {
    id: "3",
    type: "product",
    message: "Product 'Blue T-Shirt' updated",
    actor: { name: "Admin" },
    time: "1 hour ago",
    icon: Package,
    iconColor: "text-[color:var(--ds-purple-700)]",
    iconBg: "bg-[var(--ds-purple-100)] dark:bg-[var(--ds-purple-900)]/30",
  },
  {
    id: "4",
    type: "payment",
    message: "Payment received for #1230",
    actor: { name: "System" },
    time: "2 hours ago",
    icon: CreditCard,
    iconColor: "text-[color:var(--ds-green-700)]",
    iconBg: "bg-[var(--ds-green-100)] dark:bg-[var(--ds-green-900)]/30",
  },
  {
    id: "5",
    type: "order",
    message: "Order #1229 shipped",
    actor: { name: "Warehouse" },
    time: "3 hours ago",
    icon: ShoppingCart,
    iconColor: "text-[color:var(--ds-blue-700)]",
    iconBg: "bg-[var(--ds-blue-100)] dark:bg-[var(--ds-blue-900)]/30",
  },
];

export interface ActivityFeedWidgetProps {
  widget: Widget;
}

export function ActivityFeedWidget({ widget }: ActivityFeedWidgetProps) {
  const maxItems = widget.config?.maxItems || 5;
  const activities = MOCK_ACTIVITIES.slice(0, maxItems);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", activity.iconBg)}>
              <activity.icon className={cn("h-4 w-4", activity.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm line-clamp-2">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{activity.actor.name}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
