"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingCart01Icon,
  CheckmarkCircle02Icon,
  PackageIcon,
  TruckDeliveryIcon,
  Home01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "processing" 
  | "shipped" 
  | "delivered" 
  | "completed" 
  | "cancelled";

export interface OrderEvent {
  id: string;
  status: OrderStatus;
  title: string;
  description?: string;
  timestamp: string;
  isCompleted: boolean;
}

interface OrderTimelineProps {
  events: OrderEvent[];
  currentStatus: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, {
  icon: typeof ShoppingCart01Icon;
  color: string;
  bgColor: string;
}> = {
  pending: {
    icon: ShoppingCart01Icon,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  confirmed: {
    icon: CheckmarkCircle02Icon,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  processing: {
    icon: PackageIcon,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  shipped: {
    icon: TruckDeliveryIcon,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  delivered: {
    icon: Home01Icon,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  completed: {
    icon: CheckmarkCircle02Icon,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  cancelled: {
    icon: Cancel01Icon,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};

function formatDate(timestamp: string): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OrderTimeline({ events, currentStatus, className }: OrderTimelineProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {events.map((event, index) => {
        const config = statusConfig[event.status];
        const Icon = config.icon;
        const isLast = index === events.length - 1;
        
        return (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div 
                className={cn(
                  "absolute left-3 top-6 w-0.5 h-[calc(100%-1.5rem)]",
                  event.isCompleted ? "bg-primary/20" : "bg-muted"
                )}
              />
            )}
            
            {/* Icon indicator */}
            <div
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
                event.isCompleted ? config.bgColor : "bg-muted"
              )}
            >
              <HugeiconsIcon 
                icon={Icon} 
                className={cn(
                  "w-3.5 h-3.5",
                  event.isCompleted ? config.color : "text-muted-foreground"
                )} 
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">{event.title}</h4>
                {event.isCompleted && (
                  <span className="text-xs text-chart-2">✓</span>
                )}
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {event.description}
                </p>
              )}
              {event.timestamp && (
                <time className="text-xs text-muted-foreground/70 mt-1 block">
                  {formatDate(event.timestamp)}
                </time>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper to generate default order timeline events
export function generateOrderTimeline(
  order: {
    status: OrderStatus;
    created_at: string;
    updated_at?: string;
    shipped_at?: string;
    delivered_at?: string;
  }
): OrderEvent[] {
  const events: OrderEvent[] = [];
  const statusOrder: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentIndex = statusOrder.indexOf(order.status);

  // If cancelled, show only the cancelled event
  if (order.status === "cancelled") {
    return [
      {
        id: "1",
        status: "pending",
        title: "Order Placed",
        description: "Order was placed by customer",
        timestamp: order.created_at,
        isCompleted: true,
      },
      {
        id: "2",
        status: "cancelled",
        title: "Order Cancelled",
        description: "Order was cancelled",
        timestamp: order.updated_at || order.created_at,
        isCompleted: true,
      },
    ];
  }

  const titles: Record<OrderStatus, string> = {
    pending: "Order Placed",
    confirmed: "Order Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const descriptions: Record<OrderStatus, string> = {
    pending: "Order was placed by customer",
    confirmed: "Order has been confirmed",
    processing: "Order is being prepared",
    shipped: "Order has been shipped",
    delivered: "Order has been delivered",
    completed: "Order completed successfully",
    cancelled: "Order was cancelled",
  };

  statusOrder.forEach((status, index) => {
    events.push({
      id: String(index + 1),
      status,
      title: titles[status],
      description: descriptions[status],
      timestamp: index <= currentIndex 
        ? (status === "shipped" && order.shipped_at) 
          ? order.shipped_at 
          : (status === "delivered" && order.delivered_at)
            ? order.delivered_at
            : order.created_at
        : "",
      isCompleted: index <= currentIndex,
    });
  });

  return events;
}
