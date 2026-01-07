"use client";

/**
 * AI-Powered Insights Hook
 * Zustand store for managing dashboard insights with mock data generation
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Insight,
  type InsightPriority,
  type InsightsStore,
  InsightType,
} from "@/components/dashboard/insights/insight-types";

/**
 * Generate mock insights based on common e-commerce patterns
 */
function generateMockInsights(): Insight[] {
  const now = new Date();

  return [
    {
      id: "insight-1",
      type: InsightType.LOW_STOCK_WARNING,
      title: "Low Stock Alert",
      description:
        "Your best-selling product 'Blue T-Shirt' is running low with only 5 units left. Consider restocking soon to avoid stockouts.",
      metric: {
        value: "5 left",
        trend: "negative",
      },
      action: {
        label: "Restock Now",
        href: "/dashboard/inventory",
      },
      priority: "high",
      dismissedAt: null,
      createdAt: new Date(now.getTime() - 1000 * 60 * 30), // 30 mins ago
      entityId: "prod-blue-tshirt",
      entityType: "product",
    },
    {
      id: "insight-2",
      type: InsightType.TRENDING_PRODUCT,
      title: "Sales Surge Detected",
      description:
        "Sales are up 23% compared to last week! Your marketing efforts are paying off. Keep the momentum going.",
      metric: {
        value: "+23%",
        trend: "positive",
      },
      action: {
        label: "View Analytics",
        href: "/dashboard/analytics",
      },
      priority: "medium",
      dismissedAt: null,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: "insight-3",
      type: InsightType.CUSTOMER_RETENTION,
      title: "Win-Back Opportunity",
      description:
        "3 customers haven't ordered in 30+ days. Consider sending a personalized win-back campaign with a special offer.",
      metric: {
        value: "3 customers",
        trend: "neutral",
      },
      action: {
        label: "View Customers",
        href: "/dashboard/customers",
      },
      priority: "medium",
      dismissedAt: null,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: "insight-4",
      type: InsightType.PRICING_SUGGESTION,
      title: "Conversion Opportunity",
      description:
        "Product 'Red Sneakers' has high views (450 this week) but low conversion (2.1%). Consider adjusting the price or adding a promotion.",
      metric: {
        value: "2.1% conv.",
        trend: "negative",
      },
      action: {
        label: "Edit Product",
        href: "/dashboard/products",
      },
      priority: "medium",
      dismissedAt: null,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 6), // 6 hours ago
      entityId: "prod-red-sneakers",
      entityType: "product",
    },
    {
      id: "insight-5",
      type: InsightType.INVENTORY_FORECAST,
      title: "Inventory Forecast",
      description:
        "Based on current sales velocity, 'Wireless Headphones' will be out of stock in approximately 12 days.",
      metric: {
        value: "12 days",
        trend: "neutral",
      },
      action: {
        label: "View Inventory",
        href: "/dashboard/inventory",
      },
      priority: "low",
      dismissedAt: null,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 8), // 8 hours ago
      entityId: "prod-wireless-headphones",
      entityType: "product",
    },
    {
      id: "insight-6",
      type: InsightType.SALES_OPPORTUNITY,
      title: "Bundle Opportunity",
      description:
        "Customers who buy 'Laptop Stand' often also purchase 'USB-C Hub'. Consider creating a bundle deal.",
      metric: {
        value: "68% co-purchase",
        trend: "positive",
      },
      action: {
        label: "Create Bundle",
        href: "/dashboard/products",
      },
      priority: "low",
      dismissedAt: null,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12), // 12 hours ago
    },
    {
      id: "insight-7",
      type: InsightType.TRENDING_PRODUCT,
      title: "Rising Star Product",
      description:
        "'Eco-Friendly Water Bottle' has seen a 156% increase in views this week. Consider featuring it on your homepage.",
      metric: {
        value: "+156% views",
        trend: "positive",
      },
      action: {
        label: "View Products",
        href: "/dashboard/products",
      },
      priority: "medium",
      dismissedAt: null,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 24 hours ago
      entityId: "prod-eco-bottle",
      entityType: "product",
    },
  ];
}

/**
 * Zustand store for insights management
 * Persists dismissed insights to localStorage
 */
export const useInsightsStore = create<InsightsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      insights: generateMockInsights(),
      isLoading: false,
      lastRefreshedAt: new Date(),
      error: null,

      // Actions
      dismissInsight: (id: string) => {
        const { insights } = get();
        set({
          insights: insights.map((insight) =>
            insight.id === id
              ? { ...insight, dismissedAt: new Date() }
              : insight
          ),
        });
      },

      restoreInsight: (id: string) => {
        const { insights } = get();
        set({
          insights: insights.map((insight) =>
            insight.id === id ? { ...insight, dismissedAt: null } : insight
          ),
        });
      },

      refreshInsights: async () => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Generate fresh insights (in real app, this would be an API call)
          const freshInsights = generateMockInsights();

          // Preserve dismissed state for existing insights
          const { insights: currentInsights } = get();
          const dismissedIds = new Set(
            currentInsights
              .filter((i) => i.dismissedAt !== null)
              .map((i) => i.id)
          );

          const mergedInsights = freshInsights.map((insight) => ({
            ...insight,
            dismissedAt: dismissedIds.has(insight.id)
              ? currentInsights.find((i) => i.id === insight.id)?.dismissedAt ?? null
              : null,
          }));

          set({
            insights: mergedInsights,
            isLoading: false,
            lastRefreshedAt: new Date(),
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to refresh insights",
          });
        }
      },

      getInsightsByPriority: (priority: InsightPriority) => {
        const { insights } = get();
        return insights.filter(
          (insight) => insight.priority === priority && insight.dismissedAt === null
        );
      },

      getActiveInsights: () => {
        const { insights } = get();
        return insights.filter((insight) => insight.dismissedAt === null);
      },

      clearDismissed: () => {
        const { insights } = get();
        set({
          insights: insights.map((insight) => ({
            ...insight,
            dismissedAt: null,
          })),
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: "insights-storage",
      // Only persist dismissed insight IDs
      partialize: (state) => ({
        insights: state.insights.map((insight) => ({
          ...insight,
          // Convert dates to ISO strings for storage
          dismissedAt: insight.dismissedAt?.toISOString() ?? null,
          createdAt: insight.createdAt.toISOString(),
        })),
      }),
      // Rehydrate dates from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.insights = state.insights.map((insight) => ({
            ...insight,
            dismissedAt: insight.dismissedAt
              ? new Date(insight.dismissedAt as unknown as string)
              : null,
            createdAt: new Date(insight.createdAt as unknown as string),
          }));
        }
      },
    }
  )
);

/**
 * Hook for using insights in components
 * Provides filtered and sorted insights along with actions
 */
export function useInsights() {
  const insights = useInsightsStore((s) => s.insights);
  const isLoading = useInsightsStore((s) => s.isLoading);
  const lastRefreshedAt = useInsightsStore((s) => s.lastRefreshedAt);
  const error = useInsightsStore((s) => s.error);

  const dismissInsight = useInsightsStore((s) => s.dismissInsight);
  const restoreInsight = useInsightsStore((s) => s.restoreInsight);
  const refreshInsights = useInsightsStore((s) => s.refreshInsights);
  const getInsightsByPriority = useInsightsStore((s) => s.getInsightsByPriority);
  const getActiveInsights = useInsightsStore((s) => s.getActiveInsights);
  const clearDismissed = useInsightsStore((s) => s.clearDismissed);

  // Get active insights sorted by priority and date
  const activeInsights = getActiveInsights().sort((a, b) => {
    // Sort by priority first (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  // Get high priority insights
  const highPriorityInsights = getInsightsByPriority("high");

  // Get dismissed insights
  const dismissedInsights = insights.filter((i) => i.dismissedAt !== null);

  return {
    // State
    insights,
    activeInsights,
    highPriorityInsights,
    dismissedInsights,
    isLoading,
    lastRefreshedAt,
    error,

    // Actions
    dismissInsight,
    restoreInsight,
    refreshInsights,
    getInsightsByPriority,
    clearDismissed,

    // Computed
    hasHighPriorityInsights: highPriorityInsights.length > 0,
    activeCount: activeInsights.length,
    dismissedCount: dismissedInsights.length,
  };
}

export type { Insight, InsightPriority, InsightType };
