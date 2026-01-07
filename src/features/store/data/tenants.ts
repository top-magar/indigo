/**
 * Tenant data utilities for static generation
 * Uses Next.js 16 Cache Components for optimal performance
 */
import "server-only"

import { sudoDb } from "@/infrastructure/db"
import { tenants, products, categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

/**
 * Placeholder slug used when database is unavailable at build time
 * This allows the build to succeed while routes remain dynamic
 */
const PLACEHOLDER_SLUG = "__placeholder__"

/**
 * Get all tenant slugs for static generation (cached with max duration)
 */
export async function getAllTenantSlugs(): Promise<{ slug: string }[]> {
  "use cache"
  cacheLife("max")
  cacheTag("tenant-slugs")

  try {
    const result = await sudoDb
      .select({ slug: tenants.slug })
      .from(tenants)

    if (result.length === 0) {
      return [{ slug: PLACEHOLDER_SLUG }]
    }

    return result.map((t) => ({ slug: t.slug }))
  } catch (error) {
    console.error("Error fetching tenant slugs:", error)
    return [{ slug: PLACEHOLDER_SLUG }]
  }
}

/**
 * Get all product slugs for a tenant (cached with max duration)
 */
export async function getProductSlugsForTenant(
  tenantSlug: string
): Promise<{ slug: string; productSlug: string }[]> {
  "use cache"
  cacheLife("max")
  cacheTag(`product-slugs-${tenantSlug}`)

  if (tenantSlug === PLACEHOLDER_SLUG) {
    return [{ slug: PLACEHOLDER_SLUG, productSlug: PLACEHOLDER_SLUG }]
  }

  try {
    const tenant = await sudoDb
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, tenantSlug))
      .limit(1)

    if (!tenant[0]) {
      return [{ slug: tenantSlug, productSlug: PLACEHOLDER_SLUG }]
    }

    const result = await sudoDb
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.tenantId, tenant[0].id))

    if (result.length === 0) {
      return [{ slug: tenantSlug, productSlug: PLACEHOLDER_SLUG }]
    }

    return result.map((p) => ({
      slug: tenantSlug,
      productSlug: p.slug,
    }))
  } catch (error) {
    console.error("Error fetching product slugs:", error)
    return [{ slug: tenantSlug, productSlug: PLACEHOLDER_SLUG }]
  }
}

/**
 * Get all category slugs for a tenant (cached with max duration)
 */
export async function getCategorySlugsForTenant(
  tenantSlug: string
): Promise<{ slug: string; categorySlug: string }[]> {
  "use cache"
  cacheLife("max")
  cacheTag(`category-slugs-${tenantSlug}`)

  if (tenantSlug === PLACEHOLDER_SLUG) {
    return [{ slug: PLACEHOLDER_SLUG, categorySlug: PLACEHOLDER_SLUG }]
  }

  try {
    const tenant = await sudoDb
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, tenantSlug))
      .limit(1)

    if (!tenant[0]) {
      return [{ slug: tenantSlug, categorySlug: PLACEHOLDER_SLUG }]
    }

    const result = await sudoDb
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.tenantId, tenant[0].id))

    if (result.length === 0) {
      return [{ slug: tenantSlug, categorySlug: PLACEHOLDER_SLUG }]
    }

    return result.map((c) => ({
      slug: tenantSlug,
      categorySlug: c.slug,
    }))
  } catch (error) {
    console.error("Error fetching category slugs:", error)
    return [{ slug: tenantSlug, categorySlug: PLACEHOLDER_SLUG }]
  }
}

/**
 * Get all static params for store routes
 * Combines tenant, product, and category slugs
 */
export async function getAllStoreStaticParams() {
  const tenantSlugs = await getAllTenantSlugs()
  
  const allParams = await Promise.all(
    tenantSlugs.map(async ({ slug }) => {
      const [productParams, categoryParams] = await Promise.all([
        getProductSlugsForTenant(slug),
        getCategorySlugsForTenant(slug),
      ])
      
      return {
        tenant: { slug },
        products: productParams,
        categories: categoryParams,
      }
    })
  )

  return allParams
}

/**
 * Tenant info type for storefront
 */
export interface StoreTenant {
  id: string
  name: string
  slug: string
  description: string | null
  currency: string
  logoUrl: string | null
}

/**
 * Get tenant by slug (cached)
 */
export async function getTenantBySlug(slug: string): Promise<StoreTenant | null> {
  "use cache"
  cacheLife("days")
  cacheTag(`tenant-${slug}`)

  try {
    const result = await sudoDb
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        description: tenants.description,
        currency: tenants.currency,
        logoUrl: tenants.logoUrl,
      })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1)

    if (!result[0]) return null

    return {
      id: result[0].id,
      name: result[0].name,
      slug: result[0].slug,
      description: result[0].description,
      currency: result[0].currency || "USD",
      logoUrl: result[0].logoUrl,
    }
  } catch (error) {
    console.error("Error fetching tenant:", error)
    return null
  }
}
