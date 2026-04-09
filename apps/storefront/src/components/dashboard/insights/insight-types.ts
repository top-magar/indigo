/**
 * AI-Powered Insights Type Definitions
 * Types for the insights system that provides actionable recommendations
 */

/**
 * Types of insights the AI can generate
 */
export enum InsightType {
  /** Product is running low on stock */
  LOW_STOCK_WARNING = "low_stock_warning",
  /** Product is trending/selling well */
  TRENDING_PRODUCT = "trending_product",
  /** Opportunity to increase sales */
  SALES_OPPORTUNITY = "sales_opportunity",
  /** Customer retention suggestion */
  CUSTOMER_RETENTION = "customer_retention",
  /** Pricing optimization suggestion */
  PRICING_SUGGESTION = "pricing_suggestion",
  /** Inventory forecast/prediction */
  INVENTORY_FORECAST = "inventory_forecast",
}

/**
 * Priority levels for insights
 */
export type InsightPriority = "high" | "medium" | "low";

/**
 * Action that can be taken on an insight
 */
export interface InsightAction {
  /** Button label */
  label: string;
  /** Navigation URL or action identifier */
  href?: string;
  /** Callback function for the action */
  onClick?: () => void;
}

/**
 * Metric data associated with an insight
 */
export interface InsightMetric {
  /** Display value (e.g., "+15%", "5 left", "$1,234") */
  value: string;
  /** Whether the metric is positive (green), negative (red), or neutral */
  trend?: "positive" | "negative" | "neutral";
}

/**
 * Main Insight interface
 */
export interface Insight {
  /** Unique identifier */
  id: string;
  /** Type of insight */
  type: InsightType;
  /** Short title */
  title: string;
  /** Detailed description */
  description: string;
  /** Optional metric highlight */
  metric?: InsightMetric;
  /** Primary action button */
  action?: InsightAction;
  /** Priority level */
  priority: InsightPriority;
  /** When the insight was dismissed (null if not dismissed) */
  dismissedAt: Date | null;
  /** When the insight was created */
  createdAt: Date;
  /** Optional related entity ID (product, customer, etc.) */
  entityId?: string;
  /** Optional related entity type */
  entityType?: "product" | "customer" | "order" | "category";
}

/**
 * State for the insights store
 */
export interface InsightsState {
  /** All insights */
  insights: Insight[];
  /** Whether insights are loading */
  isLoading: boolean;
  /** Last refresh timestamp */
  lastRefreshedAt: Date | null;
  /** Error message if any */
  error: string | null;
}

/**
 * Actions for the insights store
 */
export interface InsightsActions {
  /** Dismiss an insight */
  dismissInsight: (id: string) => void;
  /** Restore a dismissed insight */
  restoreInsight: (id: string) => void;
  /** Refresh all insights */
  refreshInsights: () => Promise<void>;
  /** Get insights filtered by priority */
  getInsightsByPriority: (priority: InsightPriority) => Insight[];
  /** Get active (non-dismissed) insights */
  getActiveInsights: () => Insight[];
  /** Clear all dismissed insights */
  clearDismissed: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error state */
  setError: (error: string | null) => void;
}

/**
 * Combined store type
 */
export type InsightsStore = InsightsState & InsightsActions;

/**
 * Configuration for insight display
 */
export interface InsightConfig {
  /** Icon color based on type */
  iconColor: string;
  /** Background color for the icon */
  iconBgColor: string;
  /** Border color for high priority */
  borderColor?: string;
}

/**
 * Map of insight types to their display configuration
 */
export const INSIGHT_CONFIG: Record<InsightType, InsightConfig> = {
  [InsightType.LOW_STOCK_WARNING]: {
    iconColor: "text-amber-600 dark:text-amber-500",
    iconBgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  [InsightType.TRENDING_PRODUCT]: {
    iconColor: "text-emerald-600 dark:text-emerald-500",
    iconBgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  [InsightType.SALES_OPPORTUNITY]: {
    iconColor: "text-blue-600 dark:text-blue-500",
    iconBgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  [InsightType.CUSTOMER_RETENTION]: {
    iconColor: "text-purple-600 dark:text-purple-500",
    iconBgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  [InsightType.PRICING_SUGGESTION]: {
    iconColor: "text-orange-600 dark:text-orange-500",
    iconBgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  [InsightType.INVENTORY_FORECAST]: {
    iconColor: "text-cyan-600 dark:text-cyan-500",
    iconBgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
  },
};

/**
 * Priority configuration for display
 */
export const PRIORITY_CONFIG: Record<InsightPriority, { label: string; color: string }> = {
  high: {
    label: "High Priority",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  medium: {
    label: "Medium Priority",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  low: {
    label: "Low Priority",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  },
};
