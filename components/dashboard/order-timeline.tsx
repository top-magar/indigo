"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingCart01Icon,
  CheckmarkCircle02Icon,
  PackageIcon,
  TruckDeliveryIcon,
  Home01Icon,
  Cancel01Icon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
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
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  // Find the index of the current status to determine active step
  const activeStepIndex = events.findIndex(e => e.status === currentStatus) + 1;

  return (
    <Timeline defaultValue={activeStepIndex}>
      {events.map((event, index) => {
        const config = statusConfig[event.status];
        const Icon = config.icon;
        
        return (
          <TimelineItem
            key={event.id}
            step={index + 1}
            className="group-data-[orientation=vertical]/timeline:ms-10 group-data-[orientation=vertical]/timeline:not-last:pb-6"
          >
            <TimelineHeader>
              <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
              <TimelineTitle className="mt-0.5 flex items-center gap-2">
                {event.title}
                {event.isCompleted && (
                  <span className="text-xs text-chart-2 font-normal">✓</span>
                )}
              </TimelineTitle>
              <TimelineIndicator 
                className={cn(
                  "group-data-[orientation=vertical]/timeline:-left-7 flex size-6 items-center justify-center border-none",
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
              </TimelineIndicator>
            </TimelineHeader>
            <TimelineContent className="mt-2">
              {event.description && (
                <p className="text-muted-foreground text-sm mb-1">
                  {event.description}
                </p>
              )}
              <TimelineDate className="mt-1 mb-0 text-muted-foreground/70">
                {formatDate(event.timestamp)}
              </TimelineDate>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
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
