"use client";

import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingCart01Icon,
  DeliveryTruck01Icon,
  PackageDeliveredIcon,
  Cancel01Icon,
  Alert01Icon,
  Money01Icon,
  RedoIcon,
  UserAdd01Icon,
  StarIcon,
  Settings01Icon,
  Notification01Icon,
  SaleTag01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/shared/utils";
import type { Notification, NotificationType, NotificationCategory } from "./types";

// HugeIcon type
type HugeIcon = typeof ShoppingCart01Icon;

// Configuration for notification type display
interface NotificationDisplayConfig {
  icon: HugeIcon;
  color: string;
  bgColor: string;
  category: NotificationCategory;
}

// Configuration for each notification type
const notificationConfig: Record<NotificationType, NotificationDisplayConfig> = {
  order_received: {
    icon: ShoppingCart01Icon,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    category: "orders",
  },
  order_shipped: {
    icon: DeliveryTruck01Icon,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    category: "orders",
  },
  order_delivered: {
    icon: PackageDeliveredIcon,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    category: "orders",
  },
  order_cancelled: {
    icon: Cancel01Icon,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "orders",
  },
  low_stock: {
    icon: Alert01Icon,
    color: "text-warning",
    bgColor: "bg-warning/10",
    category: "inventory",
  },
  out_of_stock: {
    icon: PackageIcon,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "inventory",
  },
  payment_received: {
    icon: Money01Icon,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    category: "orders",
  },
  payment_failed: {
    icon: Cancel01Icon,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "orders",
  },
  refund_processed: {
    icon: RedoIcon,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    category: "orders",
  },
  customer_registered: {
    icon: UserAdd01Icon,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    category: "system",
  },
  review_received: {
    icon: StarIcon,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    category: "system",
  },
  system_alert: {
    icon: Alert01Icon,
    color: "text-warning",
    bgColor: "bg-warning/10",
    category: "system",
  },
  system_update: {
    icon: Settings01Icon,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    category: "system",
  },
  promotion_started: {
    icon: SaleTag01Icon,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    category: "system",
  },
  promotion_ended: {
    icon: SaleTag01Icon,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    category: "system",
  },
};

// Default config for unknown types
const defaultConfig: NotificationDisplayConfig = {
  icon: Notification01Icon,
  color: "text-muted-foreground",
  bgColor: "bg-muted",
  category: "system",
};

export interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  className?: string;
}

export function NotificationItem({
  notification,
  onClick,
  className,
}: NotificationItemProps) {
  const config = notificationConfig[notification.type] || defaultConfig;

  const handleClick = () => {
    onClick?.(notification);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !notification.read && "bg-muted/30",
        className
      )}
    >
      {!notification.read && (
        <div className="absolute top-3 right-3">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          config.bgColor
        )}
      >
        <HugeiconsIcon icon={config.icon} className={cn("h-4 w-4", config.color)} />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p
          className={cn(
            "text-sm truncate",
            !notification.read ? "font-medium" : "font-normal"
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export function getNotificationConfig(type: NotificationType): NotificationDisplayConfig {
  return notificationConfig[type] || defaultConfig;
}

export { notificationConfig };
