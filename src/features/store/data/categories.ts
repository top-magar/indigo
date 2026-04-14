/**
 * Server-side category data layer for storefront — Drizzle + withTenant
 */
import "server-only"

import { withTenant } from "@/infrastructure/db"
import { categories, products } from "@/db/schema/products"
import { eq, and, isNull, asc, count, sql } from "drizzle-orm"
import { revalidateTag, updateTag } from "next/cache"
import { tagTenantCache, getTenantCacheTag, CACHE_PROFILES } from "@/features/store/data/cache"
import { createLogger } from "@/lib/logger"
const log = createLogger("features:store-categories")

export interface StoreCategory {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  productCount: number
}

/**
 * List all categories for a tenant (cached, RLS enforced)
 */
export async function listCategories(tenantId: string): Promise<StoreCategory[]> {
  "use cache"
  CACHE_PROFILES.categories()
  tagTenantCache("categories", tenantId)

  try {
    return await withTenant(tenantId, async (tx) => {
      const rows = await tx
        .select({
          id: categories.id, name: categories.name, slug: categories.slug,
          description: categories.description, imageUrl: categories.imageUrl,
          parentId: categories.parentId,
          productCount: sql<number>`(SELECT count(*) FROM products WHERE products.category_id = ${categories.id} AND products.status = 'active')`.as("product_count"),
        })
        .from(categories)
        .orderBy(asc(categories.name))

      return rows.map((r) => ({ ...r, productCount: Number(r.productCount) }))
    })
  } catch (error) {
    log.error("Error fetching categories:", error)
    return []
  }
}

/**
 * Get category by slug (cached, RLS enforced)
 */
export async function getCategoryBySlug(tenantId: string, slug: string): Promise<StoreCategory | null> {
  "use cache"
  CACHE_PROFILES.categories()
  tagTenantCache("category", tenantId, slug)

  try {
    return await withTenant(tenantId, async (tx) => {
      const [row] = await tx
        .select({
          id: categories.id, name: categories.name, slug: categories.slug,
          description: categories.description, imageUrl: categories.imageUrl,
          parentId: categories.parentId,
          productCount: sql<number>`(SELECT count(*) FROM products WHERE products.category_id = ${categories.id} AND products.status = 'active')`.as("product_count"),
        })
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1)

      if (!row) return null
      return { ...row, productCount: Number(row.productCount) }
    })
  } catch {
    return null
  }
}

/**
 * Get root categories — no parent (cached, RLS enforced)
 */
export async function getRootCategories(tenantId: string): Promise<StoreCategory[]> {
  "use cache"
  CACHE_PROFILES.categories()
  tagTenantCache("categories", tenantId)

  try {
    return await withTenant(tenantId, async (tx) => {
      const rows = await tx
        .select({
          id: categories.id, name: categories.name, slug: categories.slug,
          description: categories.description, imageUrl: categories.imageUrl,
          parentId: categories.parentId,
          productCount: sql<number>`(SELECT count(*) FROM products WHERE products.category_id = ${categories.id} AND products.status = 'active')`.as("product_count"),
        })
        .from(categories)
        .where(isNull(categories.parentId))
        .orderBy(asc(categories.name))

      return rows.map((r) => ({ ...r, productCount: Number(r.productCount) }))
    })
  } catch (error) {
    log.error("Error fetching root categories:", error)
    return []
  }
}

/**
 * Get child categories (cached, RLS enforced)
 */
export async function getChildCategories(tenantId: string, parentId: string): Promise<StoreCategory[]> {
  "use cache"
  CACHE_PROFILES.categories()
  tagTenantCache("categories", tenantId)

  try {
    return await withTenant(tenantId, async (tx) => {
      const rows = await tx
        .select({
          id: categories.id, name: categories.name, slug: categories.slug,
          description: categories.description, imageUrl: categories.imageUrl,
          parentId: categories.parentId,
          productCount: sql<number>`(SELECT count(*) FROM products WHERE products.category_id = ${categories.id} AND products.status = 'active')`.as("product_count"),
        })
        .from(categories)
        .where(eq(categories.parentId, parentId))
        .orderBy(asc(categories.name))

      return rows.map((r) => ({ ...r, productCount: Number(r.productCount) }))
    })
  } catch (error) {
    log.error("Error fetching child categories:", error)
    return []
  }
}

export async function revalidateCategoriesCache(tenantId: string): Promise<void> {
  revalidateTag(getTenantCacheTag("categories", tenantId), "days")
}

export async function revalidateCategoryCache(tenantId: string, slug: string): Promise<void> {
  revalidateTag(getTenantCacheTag("category", tenantId, slug), "days")
  revalidateTag(getTenantCacheTag("categories", tenantId), "days")
}

export async function expireCategoriesCache(tenantId: string): Promise<void> {
  updateTag(getTenantCacheTag("categories", tenantId))
}

export async function expireCategoryCache(tenantId: string, slug?: string): Promise<void> {
  if (slug) updateTag(getTenantCacheTag("category", tenantId, slug))
  updateTag(getTenantCacheTag("categories", tenantId))
}
