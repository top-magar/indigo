"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  ArrowRight,
  Wifi,
  WifiOff,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationItem } from "./notification-item";
import { useNotifications } from "@/shared/hooks/use-notifications";
import { useRealtimeNotifications, type ConnectionStatus } from "@/shared/hooks/use-realtime-notifications";
import type { Notification, NotificationCategory } from "./types";

export interface NotificationCenterProps {
  className?: string;
  viewAllHref?: string;
  maxItems?: number;
  tenantId?: string;
  userId?: string;
  enableRealtime?: boolean;
}

const TABS: { value: NotificationCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "orders", label: "Orders" },
  { value: "inventory", label: "Inventory" },
  { value: "system", label: "System" },
];

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const statusConfig: Record<ConnectionStatus, { icon: LucideIcon; color: string; label: string }> = {
    connected: {
      icon: Wifi,
      color: "text-[color:var(--ds-green-700)]",
      label: "Connected - Real-time updates active",
    },
    connecting: {
      icon: Loader2,
      color: "text-[var(--ds-amber-700)] animate-spin",
      label: "Connecting...",
    },
    reconnecting: {
      icon: Loader2,
      color: "text-[var(--ds-amber-700)] animate-spin",
      label: "Reconnecting...",
    },
    disconnected: {
      icon: WifiOff,
      color: "text-muted-foreground",
      label: "Disconnected - Updates paused",
    },
    error: {
      icon: WifiOff,
      color: "text-destructive",
      label: "Connection error - Retrying...",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center">
          <Icon className={cn("h-3 w-3", config.color)} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {config.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function NotificationCenter({
  className,
  viewAllHref = "/dashboard/notifications",
  maxItems = 20,
  tenantId,
  userId,
  enableRealtime = true,
}: NotificationCenterProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const prevUnreadCountRef = useRef<number>(0);

  const {
    unreadCount,
    hasUnread,
    getByCategory,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const { status: connectionStatus, reconnect } = useRealtimeNotifications({
    tenantId: tenantId || "default",
    userId,
    autoConnect: enableRealtime && !!tenantId,
    onNotification: () => {
      setHasNewNotification(true);
      setTimeout(() => setHasNewNotification(false), 3000);
    },
  });

  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      setHasNewNotification(true);
      setTimeout(() => setHasNewNotification(false), 3000);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (open) {
      setHasNewNotification(false);
    }
  }, [open]);

  const filteredNotifications = getByCategory(activeTab).slice(0, maxItems);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      markAsRead(notification.id);
      if (notification.href) {
        setOpen(false);
        router.push(notification.href);
      }
    },
    [markAsRead, router]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleViewAll = useCallback(() => {
    setOpen(false);
    router.push(viewAllHref);
  }, [router, viewAllHref]);

  const handleReconnect = useCallback(() => {
    reconnect();
  }, [reconnect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "relative",
            hasNewNotification && "animate-pulse",
            className
          )}
          aria-label={hasUnread ? `Notifications (${unreadCount} unread)` : "Notifications"}
        >
          <Bell 
            className={cn(
              "h-4 w-4 transition-transform",
              hasNewNotification && "animate-bounce"
            )} 
          />
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-semibold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          {hasNewNotification && !hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {hasUnread && (
              <Badge variant="secondary" className="text-[10px]">
                {unreadCount} new
              </Badge>
            )}
            {enableRealtime && (
              <ConnectionIndicator status={connectionStatus} />
            )}
          </div>
          <div className="flex items-center gap-1">
            {connectionStatus === "error" && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleReconnect}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Retry
              </Button>
            )}
            {hasUnread && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as NotificationCategory)}
          className="w-full"
        >
          <div className="border-b px-2">
            <TabsList variant="line" className="h-9 w-full justify-start gap-0">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-3">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              <ScrollArea className="h-[320px]">
                {filteredNotifications.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                ) : (
                  <NotificationEmptyState category={activeTab} />
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={handleViewAll}
          >
            View all notifications
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationEmptyState({ category }: { category: NotificationCategory }) {
  const messages: Record<NotificationCategory, { title: string; description: string }> = {
    all: {
      title: "No notifications",
      description: "You're all caught up! New notifications will appear here.",
    },
    unread: {
      title: "No unread notifications",
      description: "You've read all your notifications.",
    },
    orders: {
      title: "No order notifications",
      description: "Order updates will appear here.",
    },
    inventory: {
      title: "No inventory alerts",
      description: "Stock alerts will appear here.",
    },
    system: {
      title: "No system notifications",
      description: "System updates will appear here.",
    },
  };

  const { title, description } = messages[category];

  return (
    <EmptyState
      icon={Bell}
      title={title}
      description={description}
      size="sm"
      className="h-[320px]"
    />
  );
}

export { NotificationEmptyState };
