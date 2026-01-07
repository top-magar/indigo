/**
 * Widget Cache Management
 * 
 * Provides cache key generation and invalidation utilities for dashboard widgets.
 */

import {
  invalidateCacheEntry,
  invalidateCacheByPrefix,
  clearAllCache,
} from "@/shared/hooks/use-cached-query";
import {
  WIDGET_CACHE_KEYS,
  WIDGET_CACHE_CONFIG,
  DEFAULT_WIDGET_CACHE_CONFIG,
  type WidgetCacheKey,
  type WidgetCacheConfigEntry,
} from "@/config/cache";

// Re-export for backwards compatibility
export { WIDGET_CACHE_KEYS, WIDGET_CACHE_CONFIG };
export type { WidgetCacheKey };

// ============================================================================
// Cache Key Generation
// ============================================================================

/**
 * Generate a cache key for a widget with optional parameters
 * 
 * @param widgetType - The type of widget (use WIDGET_CACHE_KEYS constants)
 * @param params - Optional parameters to include in the cache key
 * @returns A unique cache key string
 * 
 * @example
 * // Simple key
 * getWidgetCacheKey(WIDGET_CACHE_KEYS.ORDERS_BY_STATUS)
 * // => "widget:orders-status"
 * 
 * // Key with parameters
 * getWidgetCacheKey(WIDGET_CACHE_KEYS.REVENUE_DATA, { period: "30d" })
 * // => "widget:revenue:period=30d"
 */
export function getWidgetCacheKey(
  widgetType: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params || Object.keys(params).length === 0) {
    return widgetType;
  }

  // Filter out undefined/null values and sort keys for consistent cache keys
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&");

  return filteredParams ? `${widgetType}:${filteredParams}` : widgetType;
}

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * Invalidate cache for a specific widget type
 * 
 * @param widgetType - The widget type to invalidate
 * @param params - Optional parameters to target specific cache entries
 * 
 * @example
 * // Invalidate all revenue data caches
 * invalidateWidgetCache(WIDGET_CACHE_KEYS.REVENUE_DATA)
 * 
 * // Invalidate specific revenue data cache
 * invalidateWidgetCache(WIDGET_CACHE_KEYS.REVENUE_DATA, { period: "30d" })
 */
export function invalidateWidgetCache(
  widgetType: string,
  params?: Record<string, string | number | boolean | undefined | null>
): void {
  if (params) {
    // Invalidate specific cache entry
    const key = getWidgetCacheKey(widgetType, params);
    invalidateCacheEntry(key);
  } else {
    // Invalidate all caches for this widget type
    invalidateCacheByPrefix(widgetType);
  }
}

/**
 * Invalidate all widget caches
 * Useful when data changes that affects multiple widgets (e.g., new order)
 */
export function invalidateAllWidgetCaches(): void {
  Object.values(WIDGET_CACHE_KEYS).forEach((key) => {
    invalidateCacheByPrefix(key);
  });
}

/**
 * Invalidate caches related to orders
 * Call this when order data changes
 */
export function invalidateOrderRelatedCaches(): void {
  invalidateCacheByPrefix(WIDGET_CACHE_KEYS.ORDERS_BY_STATUS);
  invalidateCacheByPrefix(WIDGET_CACHE_KEYS.REVENUE_DATA);
  invalidateCacheByPrefix(WIDGET_CACHE_KEYS.CONVERSION_FUNNEL);
  invalidateCacheByPrefix(WIDGET_CACHE_KEYS.DASHBOARD_STATS);
  invalidateCacheByPrefix(WIDGET_CACHE_KEYS.TOP_PRODUCTS);
}

/**
 * Invalidate caches related to products
 * Call this when product data changes
 */
export function invalidateProductRelatedCaches(): void {
  invalidateCacheByPrefix(WIDGET_CACHE_KEYS.TOP_PRODUCTS);
  invalidateCacheByPrefix(WIDGET_CACHE_KEYS.SALES_BY_CATEGORY);
}

/**
 * Invalidate caches related to customers
 * Call this when customer data changes
 */
export function invalidateCustomerRelatedCaches(): void {
  invalidateCacheByPrefix(WIDGET_CACHE_KEYS.CUSTOMER_METRICS);
  invalidateCacheByPrefix(WIDGET_CACHE_KEYS.DASHBOARD_STATS);
}

/**
 * Clear all cached data (both memory and localStorage)
 * Use sparingly - typically only for logout or major data changes
 */
export function clearAllWidgetCaches(): void {
  clearAllCache();
}

// ============================================================================
// Cache Configuration
// ============================================================================

/**
 * Get cache configuration for a widget type
 * 
 * @param widgetType - The widget type to get configuration for
 * @returns Cache configuration with staleTime, cacheTime, and refetchOnFocus
 */
export function getWidgetCacheConfig(widgetType: WidgetCacheKey): WidgetCacheConfigEntry {
  return WIDGET_CACHE_CONFIG[widgetType] || DEFAULT_WIDGET_CACHE_CONFIG;
}
