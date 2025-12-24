"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification02Icon,
  ShoppingCart01Icon,
  UserAdd01Icon,
  PackageIcon,
  Alert02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type NotificationType = 
  | "order_placed" 
  | "order_shipped" 
  | "order_delivered" 
  | "customer_joined" 
  | "low_stock" 
  | "payment_received";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  metadata?: {
    orderId?: string;
    customerId?: string;
    productId?: string;
    amount?: number;
    currency?: string;
  };
}

interface NotificationPopoverProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

function Dot({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      height="6"
      viewBox="0 0 6 6"
      width="6"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

const notificationIcons: Record<NotificationType, typeof ShoppingCart01Icon> = {
  order_placed: ShoppingCart01Icon,
  order_shipped: PackageIcon,
  order_delivered: CheckmarkCircle02Icon,
  customer_joined: UserAdd01Icon,
  low_stock: Alert02Icon,
  payment_received: CheckmarkCircle02Icon,
};

const notificationColors: Record<NotificationType, string> = {
  order_placed: "bg-chart-1/10 text-chart-1",
  order_shipped: "bg-chart-5/10 text-chart-5",
  order_delivered: "bg-chart-2/10 text-chart-2",
  customer_joined: "bg-chart-4/10 text-chart-4",
  low_stock: "bg-destructive/10 text-destructive",
  payment_received: "bg-chart-2/10 text-chart-2",
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function NotificationPopover({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationPopoverProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const unreadCount = localNotifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setLocalNotifications(
      localNotifications.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
    onMarkAllAsRead?.();
  };

  const handleNotificationClick = (notification: Notification) => {
    setLocalNotifications(
      localNotifications.map((n) =>
        n.id === notification.id ? { ...n, unread: false } : n,
      ),
    );
    onMarkAsRead?.(notification.id);
    onNotificationClick?.(notification);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Open notifications"
          className="relative"
          size="icon"
          variant="outline"
        >
          <HugeiconsIcon icon={Notification02Icon} className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 px-1 text-[10px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b">
          <div className="font-semibold text-sm">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="font-medium text-xs text-primary hover:underline"
              onClick={handleMarkAllAsRead}
              type="button"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {localNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                <HugeiconsIcon icon={Notification02Icon} className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {localNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const colorClass = notificationColors[notification.type];
                
                return (
                  <button
                    key={notification.id}
                    className={cn(
                      "w-full text-left px-4 py-3 transition-colors hover:bg-muted/50",
                      notification.unread && "bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                        <HugeiconsIcon icon={Icon} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          {notification.unread && (
                            <Dot className="text-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        {localNotifications.length > 0 && (
          <div className="border-t p-2">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
