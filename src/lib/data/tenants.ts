import { sudoDb } from "@/lib/db"
import { tenants, products, categories } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Placeholder slug used when database is unavailable at build time
 * This allows the build to succeed while routes remain dynamic
 */
const PLACEHOLDER_SLUG = "__placeholder__"

/**
 * Get all tenant slugs for static generation
 * Used by generateStaticParams in store routes
 * Returns a placeholder when database is unavailable (build time)
 */
export async function getAllTenantSlugs(): Promise<{ slug: string }[]> {
  try {
    const result = await sudoDb
      .select({ slug: tenants.slug })
      .from(tenants)

    if (result.length === 0) {
      // Return placeholder for build-time validation
      return [{ slug: PLACEHOLDER_SLUG }]
    }

    return result.map((t) => ({ slug: t.slug }))
  } catch (error) {
    console.error("Error fetching tenant slugs:", error)
    // Return placeholder when DB is unavailable (build time)
    return [{ slug: PLACEHOLDER_SLUG }]
  }
}

/**
 * Get all product slugs for a tenant
 * Used by generateStaticParams in product detail routes
 * Returns a placeholder when database is unavailable (build time)
 */
export async function getProductSlugsForTenant(
  tenantSlug: string
): Promise<{ slug: string; productSlug: string }[]> {
  // Skip DB query for placeholder tenant
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
 * Get all category slugs for a tenant
 * Used by generateStaticParams in category routes
 * Returns a placeholder when database is unavailable (build time)
 */
export async function getCategorySlugsForTenant(
  tenantSlug: string
): Promise<{ slug: string; categorySlug: string }[]> {
  // Skip DB query for placeholder tenant
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
