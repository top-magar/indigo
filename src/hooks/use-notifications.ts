"use client";

import { useMemo, useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Notification,
  NotificationState,
  NotificationStore,
  NotificationCategory,
  NotificationType,
  CreateNotificationInput,
  UseNotificationsReturn,
} from "@/components/dashboard/notifications/types";

// Helper to generate unique IDs
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Map notification types to categories
const typeToCategory: Record<NotificationType, NotificationCategory> = {
  order_received: "orders",
  order_shipped: "orders",
  order_delivered: "orders",
  order_cancelled: "orders",
  low_stock: "inventory",
  out_of_stock: "inventory",
  payment_received: "orders",
  payment_failed: "orders",
  refund_processed: "orders",
  customer_registered: "system",
  review_received: "system",
  system_alert: "system",
  system_update: "system",
  promotion_started: "system",
  promotion_ended: "system",
};

// Initial state
const initialState: NotificationState = {
  notifications: [],
  isLoading: false,
};

/**
 * Zustand store for notification state management
 * Persists notifications to localStorage
 */
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      ...initialState,

      addNotification: (input: CreateNotificationInput) => {
        const id = generateId();
        const notification: Notification = {
          id,
          type: input.type,
          title: input.title,
          message: input.message,
          createdAt: new Date(),
          read: false,
          href: input.href,
          metadata: input.metadata,
        };

        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));

        return id;
      },

      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "indigo-notifications-storage",
      // Custom serialization to handle Date objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert date strings back to Date objects
          if (parsed.state?.notifications) {
            parsed.state.notifications = parsed.state.notifications.map(
              (n: Notification & { createdAt: string }) => ({
                ...n,
                createdAt: new Date(n.createdAt),
              })
            );
          }
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

/**
 * Hook for managing notifications
 * Provides filtered views and actions for the notification center
 *
 * @example
 * ```tsx
 * const {
 *   notifications,
 *   unreadCount,
 *   hasUnread,
 *   getByCategory,
 *   markAsRead,
 *   markAllAsRead,
 * } = useNotifications();
 *
 * // Add a notification
 * addNotification({
 *   type: 'order_received',
 *   title: 'New Order #1234',
 *   message: 'You have received a new order from John Doe',
 *   href: '/dashboard/orders/1234',
 * });
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  // Get store state and actions
  const notifications = useNotificationStore((s) => s.notifications);
  const isLoading = useNotificationStore((s) => s.isLoading);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const clearAll = useNotificationStore((s) => s.clearAll);

  // Computed values
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const hasUnread = unreadCount > 0;

  // Filter by category
  const getByCategory = useCallback(
    (category: NotificationCategory): Notification[] => {
      if (category === "all") {
        return notifications;
      }
      if (category === "unread") {
        return notifications.filter((n) => !n.read);
      }
      return notifications.filter((n) => typeToCategory[n.type] === category);
    },
    [notifications]
  );

  // Get unread notifications
  const getUnread = useCallback(
    () => notifications.filter((n) => !n.read),
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    hasUnread,
    isLoading,
    getByCategory,
    getUnread,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}

/**
 * Hook to get just the unread count (optimized for badge display)
 */
export function useUnreadCount(): number {
  return useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
}

/**
 * Hook to add notifications from anywhere in the app
 */
export function useAddNotification() {
  return useNotificationStore((s) => s.addNotification);
}

export type { UseNotificationsReturn };
