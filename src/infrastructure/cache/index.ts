/**
 * Cache System Architecture
 * 
 * This project has multiple caching layers for different purposes:
 * 
 * 1. CacheService (src/infrastructure/services/cache.ts)
 *    - Server-side in-memory cache with TTL
 *    - Tenant-isolated cache keys
 *    - Used by repositories and server actions
 * 
 * 2. useCachedQuery (src/shared/hooks/use-cached-query.ts)
 *    - Client-side React hook for data fetching
 *    - Stale-while-revalidate pattern
 *    - localStorage persistence option
 * 
 * 3. Widget Cache (src/infrastructure/cache/widget-cache.ts)
 *    - Widget-specific cache key generation
 *    - Wraps useCachedQuery for dashboard widgets
 * 
 * 4. Cache Invalidation (src/infrastructure/cache/invalidation.ts)
 *    - Cross-tab synchronization via BroadcastChannel
 *    - Tenant-scoped invalidation functions
 * 
 * Configuration: src/config/cache.ts
 */

export {
  getWidgetCacheKey,
  invalidateWidgetCache,
  invalidateAllWidgetCaches,
  invalidateOrderRelatedCaches,
  invalidateProductRelatedCaches,
  invalidateCustomerRelatedCaches,
  clearAllWidgetCaches,
  getWidgetCacheConfig,
} from "./widget-cache";

// Re-export widget cache configuration from centralized config
export {
  WIDGET_CACHE_KEYS,
  WIDGET_CACHE_CONFIG,
  DEFAULT_WIDGET_CACHE_CONFIG,
  type WidgetCacheKey,
  type WidgetCacheConfigEntry,
} from "@/config/cache";

// Tenant-scoped cache invalidation with cross-tab sync
export {
  invalidateRevenueCache,
  invalidateOrdersCache,
  invalidateConversionCache,
  invalidateAllWidgetCaches as invalidateAllTenantWidgetCaches,
  invalidateSpecificWidgetCache,
  subscribeToCacheInvalidation,
  closeCacheInvalidationChannel,
  createCacheInvalidator,
} from "./invalidation";

export type {
  CacheInvalidationMessage,
  CacheInvalidationAction,
} from "./invalidation";
