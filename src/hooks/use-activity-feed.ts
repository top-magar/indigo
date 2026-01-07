"use client";

/**
 * Activity Feed Hook
 * Zustand store for managing activity feed with mock data generation and polling
 */

import { useEffect, useMemo, useRef } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Activity,
  type ActivityFeedStore,
  type ActivityFilter,
  type ActivityDateGroup,
  type GroupedActivities,
  type UseActivityFeedReturn,
  type TeamMember,
  ActivityType,
} from "@/components/dashboard/activity-feed/activity-types";

// ============================================================================
// Mock Data Generation
// ============================================================================

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user-1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "Admin",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: "user-2",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Sales Manager",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
  },
  {
    id: "user-3",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "Support",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
  },
  {
    id: "user-4",
    name: "Alex Thompson",
    email: "alex@example.com",
    role: "Inventory Manager",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: "user-5",
    name: "Jordan Lee",
    email: "jordan@example.com",
    role: "Marketing",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
  },
];

const PRODUCT_NAMES = [
  "Blue T-Shirt",
  "Wireless Headphones",
  "Laptop Stand",
  "USB-C Hub",
  "Eco Water Bottle",
  "Running Shoes",
  "Backpack Pro",
  "Smart Watch",
];

const CUSTOMER_NAMES = [
  "John Smith",
  "Maria Garcia",
  "David Wilson",
  "Lisa Anderson",
  "James Brown",
  "Jennifer Martinez",
];

function generateId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOrderNumber(): string {
  return `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
}

function generateMockActivity(minutesAgo: number): Activity {
  const activityTypes = Object.values(ActivityType);
  const type = randomItem(activityTypes);
  const actor = randomItem(MOCK_TEAM_MEMBERS);
  const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000);

  const baseActivity = {
    id: generateId(),
    type,
    actor: {
      id: actor.id,
      name: actor.name,
      avatarUrl: actor.avatarUrl,
      email: actor.email,
      role: actor.role,
    },
    createdAt,
    read: Math.random() > 0.3,
  };

  switch (type) {
    case ActivityType.ORDER_CREATED: {
      const orderNumber = generateOrderNumber();
      const customer = randomItem(CUSTOMER_NAMES);
      return {
        ...baseActivity,
        message: `created order ${orderNumber} for ${customer}`,
        target: {
          id: orderNumber,
          type: "order",
          name: orderNumber,
          href: `/dashboard/orders/${orderNumber}`,
        },
        href: `/dashboard/orders/${orderNumber}`,
      };
    }

    case ActivityType.ORDER_SHIPPED: {
      const orderNumber = generateOrderNumber();
      return {
        ...baseActivity,
        message: `shipped order ${orderNumber}`,
        target: {
          id: orderNumber,
          type: "order",
          name: orderNumber,
          href: `/dashboard/orders/${orderNumber}`,
        },
        href: `/dashboard/orders/${orderNumber}`,
      };
    }

    case ActivityType.ORDER_DELIVERED: {
      const orderNumber = generateOrderNumber();
      return {
        ...baseActivity,
        message: `marked order ${orderNumber} as delivered`,
        target: {
          id: orderNumber,
          type: "order",
          name: orderNumber,
          href: `/dashboard/orders/${orderNumber}`,
        },
        href: `/dashboard/orders/${orderNumber}`,
      };
    }

    case ActivityType.ORDER_CANCELLED: {
      const orderNumber = generateOrderNumber();
      return {
        ...baseActivity,
        message: `cancelled order ${orderNumber}`,
        target: {
          id: orderNumber,
          type: "order",
          name: orderNumber,
          href: `/dashboard/orders/${orderNumber}`,
        },
        href: `/dashboard/orders/${orderNumber}`,
      };
    }

    case ActivityType.PRODUCT_CREATED: {
      const product = randomItem(PRODUCT_NAMES);
      return {
        ...baseActivity,
        message: `added new product "${product}"`,
        target: {
          id: `prod-${product.toLowerCase().replace(/\s/g, "-")}`,
          type: "product",
          name: product,
          href: `/dashboard/products`,
        },
        href: `/dashboard/products`,
      };
    }

    case ActivityType.PRODUCT_UPDATED: {
      const product = randomItem(PRODUCT_NAMES);
      return {
        ...baseActivity,
        message: `updated product "${product}"`,
        target: {
          id: `prod-${product.toLowerCase().replace(/\s/g, "-")}`,
          type: "product",
          name: product,
          href: `/dashboard/products`,
        },
        href: `/dashboard/products`,
      };
    }

    case ActivityType.CUSTOMER_JOINED: {
      const customer = randomItem(CUSTOMER_NAMES);
      return {
        ...baseActivity,
        message: `New customer ${customer} joined`,
        actor: {
          id: `cust-${customer.toLowerCase().replace(/\s/g, "-")}`,
          name: customer,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer}`,
        },
        target: {
          id: `cust-${customer.toLowerCase().replace(/\s/g, "-")}`,
          type: "customer",
          name: customer,
          href: `/dashboard/customers`,
        },
        href: `/dashboard/customers`,
      };
    }

    case ActivityType.COMMENT_ADDED: {
      const orderNumber = generateOrderNumber();
      const mentionedUser = randomItem(MOCK_TEAM_MEMBERS.filter((m) => m.id !== actor.id));
      const hasMention = Math.random() > 0.5;
      
      if (hasMention) {
        return {
          ...baseActivity,
          message: `commented on ${orderNumber}: "Hey @${mentionedUser.name}, can you check this order?"`,
          mentions: [
            {
              userId: mentionedUser.id,
              name: mentionedUser.name,
              startIndex: 30 + orderNumber.length,
              endIndex: 30 + orderNumber.length + mentionedUser.name.length + 1,
            },
          ],
          target: {
            id: orderNumber,
            type: "order",
            name: orderNumber,
            href: `/dashboard/orders/${orderNumber}`,
          },
          href: `/dashboard/orders/${orderNumber}`,
        };
      }
      
      return {
        ...baseActivity,
        message: `commented on ${orderNumber}: "Order is ready for review"`,
        target: {
          id: orderNumber,
          type: "order",
          name: orderNumber,
          href: `/dashboard/orders/${orderNumber}`,
        },
        href: `/dashboard/orders/${orderNumber}`,
      };
    }

    case ActivityType.MENTION: {
      const mentionedUser = randomItem(MOCK_TEAM_MEMBERS.filter((m) => m.id !== actor.id));
      return {
        ...baseActivity,
        message: `mentioned @${mentionedUser.name} in a discussion about inventory levels`,
        mentions: [
          {
            userId: mentionedUser.id,
            name: mentionedUser.name,
            startIndex: 10,
            endIndex: 10 + mentionedUser.name.length + 1,
          },
        ],
        href: `/dashboard/inventory`,
      };
    }

    case ActivityType.INVENTORY_UPDATED: {
      const product = randomItem(PRODUCT_NAMES);
      const quantity = Math.floor(Math.random() * 100) + 10;
      return {
        ...baseActivity,
        message: `updated inventory for "${product}" to ${quantity} units`,
        target: {
          id: `prod-${product.toLowerCase().replace(/\s/g, "-")}`,
          type: "inventory",
          name: product,
          href: `/dashboard/inventory`,
        },
        href: `/dashboard/inventory`,
      };
    }

    case ActivityType.REFUND_PROCESSED: {
      const orderNumber = generateOrderNumber();
      const amount = (Math.random() * 200 + 20).toFixed(2);
      return {
        ...baseActivity,
        message: `processed refund of $${amount} for order ${orderNumber}`,
        target: {
          id: orderNumber,
          type: "order",
          name: orderNumber,
          href: `/dashboard/orders/${orderNumber}`,
        },
        href: `/dashboard/orders/${orderNumber}`,
        metadata: { amount: parseFloat(amount) },
      };
    }

    case ActivityType.REVIEW_RECEIVED: {
      const product = randomItem(PRODUCT_NAMES);
      const stars = Math.floor(Math.random() * 2) + 4; // 4-5 stars
      const customer = randomItem(CUSTOMER_NAMES);
      return {
        ...baseActivity,
        message: `${customer} left a ${stars}-star review for "${product}"`,
        actor: {
          id: `cust-${customer.toLowerCase().replace(/\s/g, "-")}`,
          name: customer,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer}`,
        },
        target: {
          id: `prod-${product.toLowerCase().replace(/\s/g, "-")}`,
          type: "product",
          name: product,
          href: `/dashboard/products`,
        },
        href: `/dashboard/products`,
        metadata: { stars },
      };
    }

    case ActivityType.PROMOTION_CREATED: {
      const discount = Math.floor(Math.random() * 30) + 10;
      return {
        ...baseActivity,
        message: `created a new ${discount}% off promotion`,
        target: {
          id: `promo-${Date.now()}`,
          type: "promotion",
          name: `${discount}% Off Sale`,
          href: `/dashboard/promotions`,
        },
        href: `/dashboard/promotions`,
        metadata: { discount },
      };
    }

    default:
      return {
        ...baseActivity,
        message: `performed an action`,
      };
  }
}

function generateMockActivities(count: number = 20): Activity[] {
  const activities: Activity[] = [];
  let minutesAgo = 0;

  for (let i = 0; i < count; i++) {
    // Random time gap between activities (1-120 minutes)
    minutesAgo += Math.floor(Math.random() * 120) + 1;
    activities.push(generateMockActivity(minutesAgo));
  }

  return activities;
}

// ============================================================================
// Date Grouping Utilities
// ============================================================================

function getDateGroup(date: Date): ActivityDateGroup {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (activityDate.getTime() >= today.getTime()) {
    return "today";
  } else if (activityDate.getTime() >= yesterday.getTime()) {
    return "yesterday";
  } else if (activityDate.getTime() >= thisWeekStart.getTime()) {
    return "this_week";
  } else if (activityDate.getTime() >= lastWeekStart.getTime()) {
    return "last_week";
  } else if (activityDate.getTime() >= thisMonthStart.getTime()) {
    return "this_month";
  }
  return "older";
}

function getDateGroupLabel(group: ActivityDateGroup): string {
  switch (group) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "this_week":
      return "This Week";
    case "last_week":
      return "Last Week";
    case "this_month":
      return "This Month";
    case "older":
      return "Older";
  }
}

function groupActivitiesByDate(activities: Activity[]): GroupedActivities[] {
  const groups: Map<ActivityDateGroup, Activity[]> = new Map();
  const groupOrder: ActivityDateGroup[] = [
    "today",
    "yesterday",
    "this_week",
    "last_week",
    "this_month",
    "older",
  ];

  // Initialize groups
  groupOrder.forEach((group) => groups.set(group, []));

  // Group activities
  activities.forEach((activity) => {
    const group = getDateGroup(activity.createdAt);
    groups.get(group)?.push(activity);
  });

  // Convert to array and filter empty groups
  return groupOrder
    .map((group) => ({
      group,
      label: getDateGroupLabel(group),
      activities: groups.get(group) || [],
    }))
    .filter((g) => g.activities.length > 0);
}

// ============================================================================
// Activity Type to Category Mapping
// ============================================================================

function getActivityCategory(type: ActivityType): string {
  switch (type) {
    case ActivityType.ORDER_CREATED:
    case ActivityType.ORDER_UPDATED:
    case ActivityType.ORDER_SHIPPED:
    case ActivityType.ORDER_DELIVERED:
    case ActivityType.ORDER_CANCELLED:
    case ActivityType.REFUND_PROCESSED:
      return "orders";
    case ActivityType.PRODUCT_CREATED:
    case ActivityType.PRODUCT_UPDATED:
    case ActivityType.PRODUCT_DELETED:
    case ActivityType.INVENTORY_UPDATED:
      return "products";
    case ActivityType.CUSTOMER_JOINED:
    case ActivityType.CUSTOMER_UPDATED:
    case ActivityType.REVIEW_RECEIVED:
      return "customers";
    case ActivityType.COMMENT_ADDED:
      return "comments";
    case ActivityType.MENTION:
      return "mentions";
    default:
      return "all";
  }
}

// ============================================================================
// Initial State
// ============================================================================

const initialFilter: ActivityFilter = {};

const initialState: Omit<ActivityFeedStore, keyof import("@/components/dashboard/activity-feed/activity-types").ActivityFeedActions> = {
  activities: [],
  filter: initialFilter,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  page: 1,
  lastRefreshedAt: null,
  error: null,
  autoRefresh: true,
  autoRefreshInterval: 30000, // 30 seconds
};

// ============================================================================
// Zustand Store
// ============================================================================

export const useActivityFeedStore = create<ActivityFeedStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      activities: generateMockActivities(20),
      lastRefreshedAt: new Date(),

      setActivities: (activities) => {
        set({ activities });
      },

      addActivities: (newActivities) => {
        const { activities } = get();
        // Prepend new activities and dedupe
        const existingIds = new Set(activities.map((a) => a.id));
        const uniqueNew = newActivities.filter((a) => !existingIds.has(a.id));
        set({ activities: [...uniqueNew, ...activities] });
      },

      appendActivities: (newActivities) => {
        const { activities } = get();
        // Append for pagination and dedupe
        const existingIds = new Set(activities.map((a) => a.id));
        const uniqueNew = newActivities.filter((a) => !existingIds.has(a.id));
        set({ activities: [...activities, ...uniqueNew] });
      },

      markAsRead: (id) => {
        const { activities } = get();
        set({
          activities: activities.map((a) =>
            a.id === id ? { ...a, read: true } : a
          ),
        });
      },

      markAllAsRead: () => {
        const { activities } = get();
        set({
          activities: activities.map((a) => ({ ...a, read: true })),
        });
      },

      setFilter: (newFilter) => {
        const { filter } = get();
        set({ filter: { ...filter, ...newFilter } });
      },

      resetFilter: () => {
        set({ filter: initialFilter });
      },

      loadMore: async () => {
        const { isLoadingMore, hasMore, page, activities } = get();
        if (isLoadingMore || !hasMore) return;

        set({ isLoadingMore: true });

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Generate more mock activities (older ones)
          const lastActivity = activities[activities.length - 1];
          const baseMinutesAgo = lastActivity
            ? Math.floor((Date.now() - lastActivity.createdAt.getTime()) / 60000)
            : 0;

          const newActivities: Activity[] = [];
          let minutesAgo = baseMinutesAgo;

          for (let i = 0; i < 10; i++) {
            minutesAgo += Math.floor(Math.random() * 120) + 60;
            newActivities.push(generateMockActivity(minutesAgo));
          }

          // Simulate end of data after page 5
          const newHasMore = page < 5;

          set((state) => ({
            activities: [...state.activities, ...newActivities],
            page: state.page + 1,
            hasMore: newHasMore,
            isLoadingMore: false,
          }));
        } catch {
          set({ isLoadingMore: false, error: "Failed to load more activities" });
        }
      },

      refresh: async () => {
        const { isLoading } = get();
        if (isLoading) return;

        set({ isLoading: true, error: null });

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Generate fresh activities
          const freshActivities = generateMockActivities(20);

          set({
            activities: freshActivities,
            isLoading: false,
            lastRefreshedAt: new Date(),
            page: 1,
            hasMore: true,
          });
        } catch {
          set({ isLoading: false, error: "Failed to refresh activities" });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setAutoRefresh: (enabled) => {
        set({ autoRefresh: enabled });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "activity-feed-storage",
      partialize: (state) => ({
        autoRefresh: state.autoRefresh,
        filter: state.filter,
        // Store activities with serialized dates
        activities: state.activities.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Rehydrate dates
          state.activities = state.activities.map((a) => ({
            ...a,
            createdAt: new Date(a.createdAt as unknown as string),
          }));
          state.lastRefreshedAt = new Date();
        }
      },
    }
  )
);

// ============================================================================
// Hook
// ============================================================================

export function useActivityFeed(): UseActivityFeedReturn {
  const activities = useActivityFeedStore((s) => s.activities);
  const filter = useActivityFeedStore((s) => s.filter);
  const isLoading = useActivityFeedStore((s) => s.isLoading);
  const isLoadingMore = useActivityFeedStore((s) => s.isLoadingMore);
  const hasMore = useActivityFeedStore((s) => s.hasMore);
  const lastRefreshedAt = useActivityFeedStore((s) => s.lastRefreshedAt);
  const error = useActivityFeedStore((s) => s.error);
  const autoRefresh = useActivityFeedStore((s) => s.autoRefresh);
  const autoRefreshInterval = useActivityFeedStore((s) => s.autoRefreshInterval);

  const setFilter = useActivityFeedStore((s) => s.setFilter);
  const resetFilter = useActivityFeedStore((s) => s.resetFilter);
  const markAsRead = useActivityFeedStore((s) => s.markAsRead);
  const markAllAsRead = useActivityFeedStore((s) => s.markAllAsRead);
  const loadMore = useActivityFeedStore((s) => s.loadMore);
  const refresh = useActivityFeedStore((s) => s.refresh);
  const setAutoRefresh = useActivityFeedStore((s) => s.setAutoRefresh);
  const addActivities = useActivityFeedStore((s) => s.addActivities);

  // Polling interval ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Filter activities
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Filter by types
    if (filter.types && filter.types.length > 0) {
      result = result.filter((a) => filter.types!.includes(a.type));
    }

    // Filter by category
    if (filter.category && filter.category !== "all") {
      result = result.filter((a) => getActivityCategory(a.type) === filter.category);
    }

    // Filter by actor IDs
    if (filter.actorIds && filter.actorIds.length > 0) {
      result = result.filter((a) => filter.actorIds!.includes(a.actor.id));
    }

    // Filter mentions only
    if (filter.mentionsOnly) {
      result = result.filter((a) => a.mentions && a.mentions.length > 0);
    }

    // Filter unread only
    if (filter.unreadOnly) {
      result = result.filter((a) => !a.read);
    }

    // Filter by date range
    if (filter.dateFrom) {
      result = result.filter((a) => a.createdAt >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      result = result.filter((a) => a.createdAt <= filter.dateTo!);
    }

    return result;
  }, [activities, filter]);

  // Group activities by date
  const groupedActivities = useMemo(
    () => groupActivitiesByDate(filteredActivities),
    [filteredActivities]
  );

  // Unread count
  const unreadCount = useMemo(
    () => activities.filter((a) => !a.read).length,
    [activities]
  );

  // Polling effect for real-time simulation
  useEffect(() => {
    if (!autoRefresh) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Simulate new activities arriving
    pollingRef.current = setInterval(() => {
      // 30% chance of new activity
      if (Math.random() < 0.3) {
        const newActivity = generateMockActivity(0);
        newActivity.read = false;
        addActivities([newActivity]);
      }
    }, autoRefreshInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [autoRefresh, autoRefreshInterval, addActivities]);

  return {
    activities,
    groupedActivities,
    filteredActivities,
    filter,
    isLoading,
    isLoadingMore,
    hasMore,
    lastRefreshedAt,
    error,
    autoRefresh,
    unreadCount,
    hasUnread: unreadCount > 0,
    setFilter,
    resetFilter,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
    setAutoRefresh,
  };
}

// ============================================================================
// Utility Exports
// ============================================================================

export { MOCK_TEAM_MEMBERS, generateMockActivities, groupActivitiesByDate, getActivityCategory };
export type { TeamMember };
