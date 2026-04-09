/**
 * Cache Configuration
 * 
 * Defines TTLs and key patterns for different data types.
 * Tenant-scoped caching for multitenant isolation.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 6.3
 */

/**
 * Cache TTL configuration in milliseconds
 */
export interface CacheTTLConfig {
  /** Time-to-live in milliseconds */
  ttlMs: number;
  /** Human-readable description */
  description: string;
}

/**
 * Cache data types
 */
export type CacheDataType =
  | "products"       // Product listings and details
  | "categories"     // Category tree and listings
  | "storeConfig"    // Store configuration and layouts
  | "analytics"      // Analytics data (short TTL)
  | "inventory"      // Inventory levels
  | "collections"    // Product collections
  | "customers";     // Customer data

/**
 * Cache TTL configurations by data type
 * 
 * TTLs are designed to balance:
 * - Data freshness requirements
 * - Database load reduction
 * - Memory usage
 */
export const cacheTTLConfigs: Record<CacheDataType, CacheTTLConfig> = {
  /**
   * Products
   * - Product listings, details, search results
   * - 5 minutes TTL (moderate change frequency)
   */
  products: {
    ttlMs: 5 * 60 * 1000, // 5 minutes
    description: "Product listings and details",
  },

  /**
   * Categories
   * - Category tree, listings
   * - 10 minutes TTL (low change frequency)
   */
  categories: {
    ttlMs: 10 * 60 * 1000, // 10 minutes
    description: "Category tree and listings",
  },

  /**
   * Store Configuration
   * - Store layouts, settings, themes
   * - 15 minutes TTL (very low change frequency)
   */
  storeConfig: {
    ttlMs: 15 * 60 * 1000, // 15 minutes
    description: "Store configuration and layouts",
  },

  /**
   * Analytics
   * - Dashboard metrics, reports
   * - 1 minute TTL (needs to be fresh)
   */
  analytics: {
    ttlMs: 1 * 60 * 1000, // 1 minute
    description: "Analytics and dashboard metrics",
  },

  /**
   * Inventory
   * - Stock levels, availability
   * - 2 minutes TTL (changes frequently)
   */
  inventory: {
    ttlMs: 2 * 60 * 1000, // 2 minutes
    description: "Inventory levels and availability",
  },

  /**
   * Collections
   * - Product collections
   * - 10 minutes TTL (low change frequency)
   */
  collections: {
    ttlMs: 10 * 60 * 1000, // 10 minutes
    description: "Product collections",
  },

  /**
   * Customers
   * - Customer profiles
   * - 5 minutes TTL (moderate change frequency)
   */
  customers: {
    ttlMs: 5 * 60 * 1000, // 5 minutes
    description: "Customer profiles and data",
  },
};

/**
 * Get cache TTL for a data type
 */
export function getCacheTTL(type: CacheDataType): number {
  return cacheTTLConfigs[type].ttlMs;
}

/**
 * Override cache TTLs via environment variables
 * Format: CACHE_TTL_{TYPE}_MS
 * 
 * @example
 * CACHE_TTL_PRODUCTS_MS=300000
 * CACHE_TTL_ANALYTICS_MS=30000
 */
export function getEffectiveCacheTTL(type: CacheDataType): number {
  const baseConfig = cacheTTLConfigs[type];
  const envKey = `CACHE_TTL_${type.toUpperCase()}_MS`;
  
  const envValue = process.env[envKey];
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  
  return baseConfig.ttlMs;
}

/**
 * Cache key patterns
 * All keys are prefixed with tenant_id for isolation
 */
export const cacheKeyPatterns = {
  // Products
  productList: (tenantId: string) => `${tenantId}:products:list`,
  productById: (tenantId: string, id: string) => `${tenantId}:products:id:${id}`,
  productBySlug: (tenantId: string, slug: string) => `${tenantId}:products:slug:${slug}`,
  productsByCategory: (tenantId: string, categoryId: string) => `${tenantId}:products:category:${categoryId}`,
  productsByStatus: (tenantId: string, status: string) => `${tenantId}:products:status:${status}`,
  productSearch: (tenantId: string, query: string) => `${tenantId}:products:search:${query}`,
  productStats: (tenantId: string) => `${tenantId}:products:stats`,
  activeProducts: (tenantId: string) => `${tenantId}:products:active`,

  // Categories
  categoryList: (tenantId: string) => `${tenantId}:categories:list`,
  categoryById: (tenantId: string, id: string) => `${tenantId}:categories:id:${id}`,
  categoryBySlug: (tenantId: string, slug: string) => `${tenantId}:categories:slug:${slug}`,
  categoryRoots: (tenantId: string) => `${tenantId}:categories:roots`,
  categoryChildren: (tenantId: string, parentId: string) => `${tenantId}:categories:children:${parentId}`,
  categoryWithCounts: (tenantId: string) => `${tenantId}:categories:with-counts`,
  categoryStats: (tenantId: string) => `${tenantId}:categories:stats`,

  // Store Config
  storeConfigAll: (tenantId: string) => `${tenantId}:store-config:all`,
  storeConfigByPage: (tenantId: string, pageType: string) => `${tenantId}:store-config:page:${pageType}`,
  storeLayoutPublished: (tenantId: string, pageType: string) => `${tenantId}:store-config:layout:published:${pageType}`,
  storeLayoutDraft: (tenantId: string, pageType: string) => `${tenantId}:store-config:layout:draft:${pageType}`,

  // Analytics
  analyticsOverview: (tenantId: string) => `${tenantId}:analytics:overview`,
  analyticsSales: (tenantId: string, period: string) => `${tenantId}:analytics:sales:${period}`,

  // Inventory
  inventoryByProduct: (tenantId: string, productId: string) => `${tenantId}:inventory:product:${productId}`,
  inventoryLow: (tenantId: string) => `${tenantId}:inventory:low`,

  // Collections
  collectionList: (tenantId: string) => `${tenantId}:collections:list`,
  collectionById: (tenantId: string, id: string) => `${tenantId}:collections:id:${id}`,

  // Customers
  customerById: (tenantId: string, id: string) => `${tenantId}:customers:id:${id}`,
  customerList: (tenantId: string) => `${tenantId}:customers:list`,
} as const;

/**
 * Invalidation patterns for cache clearing
 * Used to clear related cache entries on mutations
 */
export const cacheInvalidationPatterns = {
  // Clear all product-related caches for a tenant
  allProducts: (tenantId: string) => `${tenantId}:products:*`,
  
  // Clear all category-related caches for a tenant
  allCategories: (tenantId: string) => `${tenantId}:categories:*`,
  
  // Clear all store config caches for a tenant
  allStoreConfig: (tenantId: string) => `${tenantId}:store-config:*`,
  
  // Clear all analytics caches for a tenant
  allAnalytics: (tenantId: string) => `${tenantId}:analytics:*`,
  
  // Clear all inventory caches for a tenant
  allInventory: (tenantId: string) => `${tenantId}:inventory:*`,
  
  // Clear all caches for a tenant
  allTenant: (tenantId: string) => `${tenantId}:*`,
} as const;

// ============================================================================
// Widget Cache Configuration
// ============================================================================

/**
 * Widget cache key constants
 */
export const WIDGET_CACHE_KEYS = {
  REVENUE_DATA: "widget:revenue",
  ORDERS_BY_STATUS: "widget:orders-status",
  CONVERSION_FUNNEL: "widget:conversion",
  TOP_PRODUCTS: "widget:top-products",
  DASHBOARD_STATS: "widget:dashboard-stats",
  CUSTOMER_METRICS: "widget:customer-metrics",
  SALES_BY_CATEGORY: "widget:sales-category",
} as const;

export type WidgetCacheKey = typeof WIDGET_CACHE_KEYS[keyof typeof WIDGET_CACHE_KEYS];

/**
 * Widget cache configuration type
 */
export interface WidgetCacheConfigEntry {
  /** Time in ms before data is considered stale */
  staleTime: number;
  /** Time in ms to keep data in cache */
  cacheTime: number;
  /** Whether to refetch when window regains focus */
  refetchOnFocus?: boolean;
}

/**
 * Widget-specific cache configuration
 * 
 * Defines stale times and cache times for different widget types.
 * These settings control the stale-while-revalidate behavior.
 */
export const WIDGET_CACHE_CONFIG: Record<WidgetCacheKey, WidgetCacheConfigEntry> = {
  /** Revenue data - updates less frequently, can be cached longer */
  [WIDGET_CACHE_KEYS.REVENUE_DATA]: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnFocus: true,
  },
  /** Orders by status - updates more frequently */
  [WIDGET_CACHE_KEYS.ORDERS_BY_STATUS]: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnFocus: true,
  },
  /** Conversion funnel - moderate update frequency */
  [WIDGET_CACHE_KEYS.CONVERSION_FUNNEL]: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnFocus: true,
  },
  /** Top products - updates less frequently */
  [WIDGET_CACHE_KEYS.TOP_PRODUCTS]: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnFocus: true,
  },
  /** Dashboard stats - updates frequently */
  [WIDGET_CACHE_KEYS.DASHBOARD_STATS]: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnFocus: true,
  },
  /** Customer metrics - moderate update frequency */
  [WIDGET_CACHE_KEYS.CUSTOMER_METRICS]: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnFocus: true,
  },
  /** Sales by category - updates less frequently */
  [WIDGET_CACHE_KEYS.SALES_BY_CATEGORY]: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnFocus: true,
  },
};

/**
 * Default widget cache configuration
 * Used as fallback when a widget type is not explicitly configured
 */
export const DEFAULT_WIDGET_CACHE_CONFIG: WidgetCacheConfigEntry = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
  refetchOnFocus: true,
};
