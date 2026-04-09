/**
 * Cache utilities for storefront data layer
 * Uses Next.js 16 Cache Components with use cache directive
 * 
 * Cache Strategy Overview:
 * - Request Memoization: Automatic for fetch, manual with React cache()
 * - Data Cache: Controlled via cacheLife() and cache tags
 * - Full Route Cache: Static routes cached at build time
 * - Router Cache: Client-side, managed by Next.js
 * 
 * ISR (Incremental Static Regeneration):
 * - Store pages use `revalidate = 3600` (1 hour) for time-based ISR
 * - On-demand revalidation via revalidatePath/revalidateTag in Server Actions
 * - External revalidation via /api/revalidate endpoint
 * 
 * Invalidation Patterns:
 * - revalidateTag(): Background revalidation (stale-while-revalidate)
 * - updateTag(): Immediate expiration (read-your-own-writes in Server Actions)
 * - revalidatePath(): Revalidate entire route segment
 * 
 * @see https://nextjs.org/docs/app/guides/incremental-static-regeneration
 * @see https://nextjs.org/docs/app/guides/caching
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
 * Format: {type}-{tenantId} or {type}-{tenantId}-{slug}
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
 * Tags both specific and general for flexible invalidation
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
 * 
 * Duration guidelines:
 * - "hours": Data that changes occasionally (products, inventory)
 * - "days": Data that rarely changes (categories, tenant settings)
 * - "max": Static data for build-time generation
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
