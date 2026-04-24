"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationItem } from "@/components/dashboard/notifications/notification-item";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification, NotificationCategory } from "@/components/dashboard/notifications/types";

const TABS: { value: NotificationCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "orders", label: "Orders" },
  { value: "inventory", label: "Inventory" },
  { value: "system", label: "System" },
];

export function NotificationsPageClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const {
    unreadCount,
    hasUnread,
    getByCategory,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const filtered = getByCategory(activeTab);

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.href) router.push(notification.href);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Notifications</h1>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnread && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="size-3.5" /> Mark all read
            </Button>
          )}
          {filtered.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll} className="text-muted-foreground">
              <Trash2 className="size-3.5" /> Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NotificationCategory)}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
              {tab.value === "unread" && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] tabular-nums">{unreadCount}</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {filtered.length > 0 ? (
              <div className="rounded-lg border divide-y">
                {filtered.map((notification) => (
                  <div key={notification.id} className="relative group">
                    <NotificationItem
                      notification={notification}
                      onClick={handleClick}
                      className="rounded-none border-0"
                    />
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="absolute top-3 right-3 size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove notification"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title={activeTab === "unread" ? "No unread notifications" : "No notifications"}
                description={activeTab === "unread" ? "You've read everything" : "Notifications will appear here when something happens"}
                className="py-16"
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
