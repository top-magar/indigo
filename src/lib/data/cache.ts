/**
 * Cache utilities for storefront data layer
 * Uses Next.js 16 Cache Components with use cache directive
 */
import "server-only"
import { cacheLife, cacheTag } from "next/cache"

// Cache tag prefixes for different data types
export const CACHE_TAGS = {
  products: "products",
  product: "product",
  categories: "categories",
  category: "category",
  tenant: "tenant",
  cart: "cart",
} as const

/**
 * Generate a tenant-scoped cache tag
 */
export function getTenantCacheTag(
  type: keyof typeof CACHE_TAGS,
  tenantId: string,
  slug?: string
): string {
  const base = `${CACHE_TAGS[type]}-${tenantId}`
  return slug ? `${base}-${slug}` : base
}

/**
 * Apply cache tags for tenant-scoped data
 */
export function tagTenantCache(
  type: keyof typeof CACHE_TAGS,
  tenantId: string,
  slug?: string
): void {
  // Tag with both specific and general tags for flexible invalidation
  cacheTag(getTenantCacheTag(type, tenantId, slug))
  cacheTag(getTenantCacheTag(type, tenantId))
  cacheTag(CACHE_TAGS[type])
}

/**
 * Cache profiles for different data types
 */
export const CACHE_PROFILES = {
  // Products change occasionally - cache for 1 hour
  products: () => cacheLife("hours"),
  
  // Categories rarely change - cache for 1 day
  categories: () => cacheLife("days"),
  
  // Tenant info rarely changes - cache for 1 day
  tenant: () => cacheLife("days"),
  
  // Single product - cache for 1 hour
  product: () => cacheLife("hours"),
  
  // Static params for build - cache for max duration
  staticParams: () => cacheLife("max"),
} as const
