"use client";

import {
  ShoppingCart,
  Truck,
  PackageCheck,
  X,
  AlertTriangle,
  DollarSign,
  Undo2,
  UserPlus,
  Star,
  Settings,
  Bell,
  Tag,
  Package,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { Notification, NotificationType, NotificationCategory } from "./types";

// Configuration for notification type display
interface NotificationDisplayConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  category: NotificationCategory;
}

// Configuration for each notification type
const notificationConfig: Record<NotificationType, NotificationDisplayConfig> = {
  order_received: {
    icon: ShoppingCart,
    color: "text-info",
    bgColor: "bg-info/10",
    category: "orders",
  },
  order_shipped: {
    icon: Truck,
    color: "text-success",
    bgColor: "bg-success/10",
    category: "orders",
  },
  order_delivered: {
    icon: PackageCheck,
    color: "text-success",
    bgColor: "bg-success/10",
    category: "orders",
  },
  order_cancelled: {
    icon: X,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "orders",
  },
  low_stock: {
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    category: "inventory",
  },
  out_of_stock: {
    icon: Package,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "inventory",
  },
  payment_received: {
    icon: DollarSign,
    color: "text-success",
    bgColor: "bg-success/10",
    category: "orders",
  },
  payment_failed: {
    icon: X,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "orders",
  },
  refund_processed: {
    icon: Undo2,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    category: "orders",
  },
  customer_registered: {
    icon: UserPlus,
    color: "text-ds-blue-700",
    bgColor: "bg-ds-blue-100",
    category: "system",
  },
  review_received: {
    icon: Star,
    color: "text-warning",
    bgColor: "bg-warning/10",
    category: "system",
  },
  system_alert: {
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    category: "system",
  },
  system_update: {
    icon: Settings,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    category: "system",
  },
  promotion_started: {
    icon: Tag,
    color: "text-info",
    bgColor: "bg-info/10",
    category: "system",
  },
  promotion_ended: {
    icon: Tag,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    category: "system",
  },
};

// Default config for unknown types
const defaultConfig: NotificationDisplayConfig = {
  icon: Bell,
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
  const Icon = config.icon;

  const handleClick = () => {
    onClick?.(notification);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  // Custom avatar with notification icon
  const NotificationAvatar = (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg h-8 w-8",
        config.bgColor
      )}
    >
      <Icon className={cn("h-4 w-4", config.color)} />
    </div>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative p-3 rounded-lg transition-colors duration-150 cursor-pointer",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !notification.read && "bg-muted",
        className
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 right-3">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-info" />
          </span>
        </div>
      )}

      {/* Notification layout */}
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          {NotificationAvatar}
        </div>
        <div className="flex flex-col gap-1 pr-4">
          <span
            className={cn(
              "text-xs text-foreground",
              !notification.read ? "font-medium" : "font-normal"
            )}
          >
            {notification.title}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </span>
          <div className="mt-1">
            <time className="text-[10px] text-muted-foreground">
              {new Date(notification.createdAt).toLocaleDateString()}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}

export function getNotificationConfig(type: NotificationType): NotificationDisplayConfig {
  return notificationConfig[type] || defaultConfig;
}

export { notificationConfig };
