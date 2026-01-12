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
import {
  Entity,
  EntityAvatar,
  EntityContent,
  EntityName,
  EntityDescription,
} from "@/components/ui/geist";
import { RelativeTimeCard } from "@/components/ui/geist";
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
    color: "text-[var(--ds-blue-700)]",
    bgColor: "bg-[var(--ds-blue-100)]",
    category: "orders",
  },
  order_shipped: {
    icon: Truck,
    color: "text-[var(--ds-green-700)]",
    bgColor: "bg-[var(--ds-green-100)]",
    category: "orders",
  },
  order_delivered: {
    icon: PackageCheck,
    color: "text-[var(--ds-green-700)]",
    bgColor: "bg-[var(--ds-green-100)]",
    category: "orders",
  },
  order_cancelled: {
    icon: X,
    color: "text-[var(--ds-red-700)]",
    bgColor: "bg-[var(--ds-red-100)]",
    category: "orders",
  },
  low_stock: {
    icon: AlertTriangle,
    color: "text-[var(--ds-amber-700)]",
    bgColor: "bg-[var(--ds-amber-100)]",
    category: "inventory",
  },
  out_of_stock: {
    icon: Package,
    color: "text-[var(--ds-red-700)]",
    bgColor: "bg-[var(--ds-red-100)]",
    category: "inventory",
  },
  payment_received: {
    icon: DollarSign,
    color: "text-[var(--ds-green-700)]",
    bgColor: "bg-[var(--ds-green-100)]",
    category: "orders",
  },
  payment_failed: {
    icon: X,
    color: "text-[var(--ds-red-700)]",
    bgColor: "bg-[var(--ds-red-100)]",
    category: "orders",
  },
  refund_processed: {
    icon: Undo2,
    color: "text-[var(--ds-purple-700)]",
    bgColor: "bg-[var(--ds-purple-100)]",
    category: "orders",
  },
  customer_registered: {
    icon: UserPlus,
    color: "text-[var(--ds-teal-700)]",
    bgColor: "bg-[var(--ds-teal-100)]",
    category: "system",
  },
  review_received: {
    icon: Star,
    color: "text-[var(--ds-amber-700)]",
    bgColor: "bg-[var(--ds-amber-100)]",
    category: "system",
  },
  system_alert: {
    icon: AlertTriangle,
    color: "text-[var(--ds-amber-700)]",
    bgColor: "bg-[var(--ds-amber-100)]",
    category: "system",
  },
  system_update: {
    icon: Settings,
    color: "text-[var(--ds-gray-600)]",
    bgColor: "bg-[var(--ds-gray-100)]",
    category: "system",
  },
  promotion_started: {
    icon: Tag,
    color: "text-[var(--ds-blue-700)]",
    bgColor: "bg-[var(--ds-blue-100)]",
    category: "system",
  },
  promotion_ended: {
    icon: Tag,
    color: "text-[var(--ds-gray-600)]",
    bgColor: "bg-[var(--ds-gray-100)]",
    category: "system",
  },
};

// Default config for unknown types
const defaultConfig: NotificationDisplayConfig = {
  icon: Bell,
  color: "text-[var(--ds-gray-600)]",
  bgColor: "bg-[var(--ds-gray-100)]",
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
        "hover:bg-[var(--ds-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !notification.read && "bg-[var(--ds-gray-100)]",
        className
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 right-3">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ds-blue-700)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ds-blue-700)]" />
          </span>
        </div>
      )}

      {/* Entity-based layout */}
      <Entity size="sm" name="" className="gap-3">
        <EntityAvatar
          size="sm"
          fallback={NotificationAvatar}
          className="rounded-lg"
        />
        <EntityContent className="pr-4 gap-1">
          <EntityName
            size="sm"
            className={cn(
              "text-[var(--ds-gray-900)]",
              !notification.read ? "font-medium" : "font-normal"
            )}
          >
            {notification.title}
          </EntityName>
          <EntityDescription
            size="sm"
            className="text-[var(--ds-gray-600)] line-clamp-2"
          >
            {notification.message}
          </EntityDescription>
          {/* RelativeTimeCard for timestamp with hover popover */}
          <div className="mt-1">
            <RelativeTimeCard
              date={notification.createdAt}
              size="sm"
              popoverPosition="bottom"
              className="text-[10px]"
            />
          </div>
        </EntityContent>
      </Entity>
    </div>
  );
}

export function getNotificationConfig(type: NotificationType): NotificationDisplayConfig {
  return notificationConfig[type] || defaultConfig;
}

export { notificationConfig };
