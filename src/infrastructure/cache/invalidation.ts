/**
 * Cache Invalidation Utility
 *
 * Provides tenant-scoped cache invalidation functions for dashboard widgets
 * with cross-tab synchronization using BroadcastChannel API.
 */

import {
  invalidateCacheByPrefix,
  invalidateCacheEntry,
} from "@/shared/hooks/use-cached-query";
import { WIDGET_CACHE_KEYS, getWidgetCacheKey } from "./widget-cache";

// ============================================================================
// Types
// ============================================================================

export interface CacheInvalidationMessage {
  type: "cache-invalidation";
  action: "revenue" | "orders" | "conversion" | "all";
  tenantId: string;
  timestamp: number;
}

export type CacheInvalidationAction = CacheInvalidationMessage["action"];

// ============================================================================
// BroadcastChannel Setup (with SSR fallback)
// ============================================================================

const CHANNEL_NAME = "widget-cache-invalidation";

let broadcastChannel: BroadcastChannel | null = null;

/**
 * Get or create the BroadcastChannel instance
 * Returns null in SSR environments
 */
function getBroadcastChannel(): BroadcastChannel | null {
  // SSR check - BroadcastChannel is not available on server
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      setupChannelListener(broadcastChannel);
    } catch (error) {
      // BroadcastChannel not supported (e.g., older browsers)
      console.warn("BroadcastChannel not supported:", error);
      return null;
    }
  }

  return broadcastChannel;
}

/**
 * Setup listener for incoming cache invalidation messages
 */
function setupChannelListener(channel: BroadcastChannel): void {
  channel.onmessage = (event: MessageEvent<CacheInvalidationMessage>) => {
    const message = event.data;

    if (message?.type !== "cache-invalidation") {
      return;
    }

    // Process the invalidation in this tab
    processInvalidation(message.action, message.tenantId, false);
  };

  channel.onmessageerror = (event) => {
    console.warn("BroadcastChannel message error:", event);
  };
}

/**
 * Broadcast a cache invalidation message to other tabs
 */
function broadcastInvalidation(
  action: CacheInvalidationAction,
  tenantId: string
): void {
  const channel = getBroadcastChannel();
  if (!channel) return;

  const message: CacheInvalidationMessage = {
    type: "cache-invalidation",
    action,
    tenantId,
    timestamp: Date.now(),
  };

  try {
    channel.postMessage(message);
  } catch (error) {
    console.warn("Failed to broadcast cache invalidation:", error);
  }
}

// ============================================================================
// Cache Key Helpers
// ============================================================================

/**
 * Generate a tenant-scoped cache key
 */
function getTenantCacheKey(
  widgetType: string,
  tenantId: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  return getWidgetCacheKey(widgetType, { ...params, tenantId });
}

/**
 * Get the tenant-scoped prefix for a widget type
 */
function getTenantCachePrefix(widgetType: string, tenantId: string): string {
  return `${widgetType}:tenantId=${tenantId}`;
}

// ============================================================================
// Internal Invalidation Processing
// ============================================================================

/**
 * Process cache invalidation for a specific action
 * @param action - The type of invalidation to perform
 * @param tenantId - The tenant ID to scope the invalidation
 * @param broadcast - Whether to broadcast to other tabs (default: true)
 */
function processInvalidation(
  action: CacheInvalidationAction,
  tenantId: string,
  broadcast: boolean = true
): void {
  switch (action) {
    case "revenue":
      invalidateRevenueCacheInternal(tenantId);
      break;
    case "orders":
      invalidateOrdersCacheInternal(tenantId);
      break;
    case "conversion":
      invalidateConversionCacheInternal(tenantId);
      break;
    case "all":
      invalidateAllWidgetCachesInternal(tenantId);
      break;
  }

  // Broadcast to other tabs if requested
  if (broadcast) {
    broadcastInvalidation(action, tenantId);
  }
}

/**
 * Internal: Invalidate revenue-related caches for a tenant
 */
function invalidateRevenueCacheInternal(tenantId: string): void {
  // Invalidate revenue data cache
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.REVENUE_DATA, tenantId));
  
  // Also invalidate dashboard stats as they include revenue
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.DASHBOARD_STATS, tenantId));
  
  // Sales by category is also revenue-related
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.SALES_BY_CATEGORY, tenantId));
}

/**
 * Internal: Invalidate orders-related caches for a tenant
 */
function invalidateOrdersCacheInternal(tenantId: string): void {
  // Invalidate orders by status cache
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.ORDERS_BY_STATUS, tenantId));
  
  // Orders affect revenue data
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.REVENUE_DATA, tenantId));
  
  // Orders affect dashboard stats
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.DASHBOARD_STATS, tenantId));
  
  // Orders affect top products
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.TOP_PRODUCTS, tenantId));
}

/**
 * Internal: Invalidate conversion-related caches for a tenant
 */
function invalidateConversionCacheInternal(tenantId: string): void {
  // Invalidate conversion funnel cache
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.CONVERSION_FUNNEL, tenantId));
  
  // Conversion data affects customer metrics
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.CUSTOMER_METRICS, tenantId));
  
  // Also affects dashboard stats
  invalidateCacheByPrefix(getTenantCachePrefix(WIDGET_CACHE_KEYS.DASHBOARD_STATS, tenantId));
}

/**
 * Internal: Invalidate all widget caches for a tenant
 */
function invalidateAllWidgetCachesInternal(tenantId: string): void {
  Object.values(WIDGET_CACHE_KEYS).forEach((widgetType) => {
    invalidateCacheByPrefix(getTenantCachePrefix(widgetType, tenantId));
  });
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Invalidate revenue-related widget caches when orders change
 *
 * Call this when:
 * - New orders are created
 * - Order amounts are updated
 * - Refunds are processed
 *
 * @param tenantId - The tenant ID to scope the invalidation
 *
 * @example
 * // After processing a new order
 * invalidateRevenueCache(tenantId);
 */
export function invalidateRevenueCache(tenantId: string): void {
  if (!tenantId) {
    console.warn("invalidateRevenueCache: tenantId is required");
    return;
  }
  processInvalidation("revenue", tenantId, true);
}

/**
 * Invalidate orders-related widget caches when orders change
 *
 * Call this when:
 * - New orders are created
 * - Order status changes
 * - Orders are cancelled
 *
 * @param tenantId - The tenant ID to scope the invalidation
 *
 * @example
 * // After updating order status
 * invalidateOrdersCache(tenantId);
 */
export function invalidateOrdersCache(tenantId: string): void {
  if (!tenantId) {
    console.warn("invalidateOrdersCache: tenantId is required");
    return;
  }
  processInvalidation("orders", tenantId, true);
}

/**
 * Invalidate conversion-related widget caches when analytics data changes
 *
 * Call this when:
 * - Analytics events are processed
 * - Conversion tracking data is updated
 * - Customer journey data changes
 *
 * @param tenantId - The tenant ID to scope the invalidation
 *
 * @example
 * // After processing analytics events
 * invalidateConversionCache(tenantId);
 */
export function invalidateConversionCache(tenantId: string): void {
  if (!tenantId) {
    console.warn("invalidateConversionCache: tenantId is required");
    return;
  }
  processInvalidation("conversion", tenantId, true);
}

/**
 * Invalidate all widget caches for a tenant
 *
 * Call this when:
 * - Major data imports occur
 * - Tenant data is reset
 * - User explicitly requests cache clear
 *
 * @param tenantId - The tenant ID to scope the invalidation
 *
 * @example
 * // After bulk data import
 * invalidateAllWidgetCaches(tenantId);
 */
export function invalidateAllWidgetCaches(tenantId: string): void {
  if (!tenantId) {
    console.warn("invalidateAllWidgetCaches: tenantId is required");
    return;
  }
  processInvalidation("all", tenantId, true);
}

// ============================================================================
// Advanced API
// ============================================================================

/**
 * Invalidate a specific widget cache entry for a tenant
 *
 * @param widgetType - The widget type from WIDGET_CACHE_KEYS
 * @param tenantId - The tenant ID
 * @param params - Additional parameters that were used in the cache key
 *
 * @example
 * // Invalidate specific revenue data cache
 * invalidateSpecificWidgetCache(WIDGET_CACHE_KEYS.REVENUE_DATA, tenantId, { period: "30d" });
 */
export function invalidateSpecificWidgetCache(
  widgetType: string,
  tenantId: string,
  params?: Record<string, string | number | boolean | undefined | null>
): void {
  if (!tenantId) {
    console.warn("invalidateSpecificWidgetCache: tenantId is required");
    return;
  }

  const cacheKey = getTenantCacheKey(widgetType, tenantId, params);
  invalidateCacheEntry(cacheKey);

  // Broadcast to other tabs
  broadcastInvalidation("all", tenantId);
}

/**
 * Subscribe to cache invalidation events from other tabs
 *
 * @param callback - Function to call when invalidation occurs
 * @returns Unsubscribe function
 *
 * @example
 * useEffect(() => {
 *   const unsubscribe = subscribeToCacheInvalidation((message) => {
 *     console.log('Cache invalidated:', message);
 *   });
 *   return unsubscribe;
 * }, []);
 */
export function subscribeToCacheInvalidation(
  callback: (message: CacheInvalidationMessage) => void
): () => void {
  const channel = getBroadcastChannel();
  if (!channel) {
    // Return no-op unsubscribe for SSR
    return () => {};
  }

  const handler = (event: MessageEvent<CacheInvalidationMessage>) => {
    if (event.data?.type === "cache-invalidation") {
      callback(event.data);
    }
  };

  channel.addEventListener("message", handler);

  return () => {
    channel.removeEventListener("message", handler);
  };
}

/**
 * Close the BroadcastChannel connection
 * Call this during cleanup (e.g., app unmount)
 */
export function closeCacheInvalidationChannel(): void {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}

// ============================================================================
// React Hook for Cache Invalidation
// ============================================================================

/**
 * Hook to get cache invalidation functions scoped to a tenant
 *
 * @param tenantId - The tenant ID to scope invalidations
 * @returns Object with invalidation functions
 *
 * @example
 * const { invalidateRevenue, invalidateOrders, invalidateAll } = useCacheInvalidation(tenantId);
 *
 * // After creating an order
 * invalidateOrders();
 * invalidateRevenue();
 */
export function createCacheInvalidator(tenantId: string) {
  return {
    invalidateRevenue: () => invalidateRevenueCache(tenantId),
    invalidateOrders: () => invalidateOrdersCache(tenantId),
    invalidateConversion: () => invalidateConversionCache(tenantId),
    invalidateAll: () => invalidateAllWidgetCaches(tenantId),
  };
}
