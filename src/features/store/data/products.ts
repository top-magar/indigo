/**
 * Server-side product data layer for storefront — Drizzle + withTenant
 */
import "server-only"

import { withTenant } from "@/infrastructure/db"
import { products, categories } from "@/db/schema/products"
import { eq, and, ilike, or, asc, desc, count, sql } from "drizzle-orm"
import { revalidateTag, updateTag } from "next/cache"
import {
  tagTenantCache,
  getTenantCacheTag,
  CACHE_PROFILES,
} from "@/features/store/data/cache"
import { createLogger } from "@/lib/logger"
const log = createLogger("features:store-products")

export interface StoreProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compareAtPrice: number | null
  images: string[]
  status: string
  categoryId: string | null
  categoryName: string | null
  createdAt: string
}

export interface ProductListParams {
  limit?: number
  offset?: number
  categoryId?: string
  collectionId?: string
  search?: string
  sortBy?: "created_at" | "price_asc" | "price_desc" | "name"
}

export interface ProductListResponse {
  products: StoreProduct[]
  count: number
  nextOffset: number | null
}

/**
 * List products for storefront (cached, RLS enforced via withTenant)
 */
export async function listProducts(
  tenantId: string,
  params: ProductListParams = {}
): Promise<ProductListResponse> {
  "use cache"
  CACHE_PROFILES.products()
  tagTenantCache("products", tenantId)

  const { limit = 12, offset = 0, categoryId, search, sortBy = "created_at" } = params

  try {
    return await withTenant(tenantId, async (tx) => {
      // Build where conditions
      const conditions = [eq(products.status, "active")]
      if (categoryId) conditions.push(eq(products.categoryId, categoryId))
      if (search) {
        conditions.push(or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`),
        )!)
      }

      const where = conditions.length === 1 ? conditions[0] : and(...conditions)

      // Sort
      const orderBy = sortBy === "price_asc" ? asc(products.price)
        : sortBy === "price_desc" ? desc(products.price)
        : sortBy === "name" ? asc(products.name)
        : desc(products.createdAt)

      // Parallel: data + count
      const [rows, [{ total }]] = await Promise.all([
        tx.select({
          id: products.id, name: products.name, slug: products.slug,
          description: products.description, price: products.price,
          compareAtPrice: products.compareAtPrice, images: products.images,
          status: products.status, categoryId: products.categoryId,
          createdAt: products.createdAt,
          categoryName: categories.name,
        })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(where)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        tx.select({ total: count() }).from(products).where(where),
      ])

      const result: StoreProduct[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        price: Number(r.price),
        compareAtPrice: r.compareAtPrice ? Number(r.compareAtPrice) : null,
        images: Array.isArray(r.images) ? (r.images as Array<{ url: string }>).map(i => i.url) : [],
        status: r.status,
        categoryId: r.categoryId,
        categoryName: r.categoryName ?? null,
        createdAt: r.createdAt?.toISOString() ?? "",
      }))

      const nextOffset = offset + limit < total ? offset + limit : null
      return { products: result, count: total, nextOffset }
    })
  } catch (error) {
    log.error("Error fetching products:", error)
    return { products: [], count: 0, nextOffset: null }
  }
}

/**
 * Get single product by slug (cached, RLS enforced)
 */
export async function getProductBySlug(
  tenantId: string,
  slug: string
): Promise<StoreProduct | null> {
  "use cache"
  CACHE_PROFILES.product()
  tagTenantCache("product", tenantId, slug)

  try {
    return await withTenant(tenantId, async (tx) => {
      const [row] = await tx.select({
        id: products.id, name: products.name, slug: products.slug,
        description: products.description, price: products.price,
        compareAtPrice: products.compareAtPrice, images: products.images,
        status: products.status, categoryId: products.categoryId,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.slug, slug), eq(products.status, "active")))
        .limit(1)

      if (!row) return null
      return {
        id: row.id, name: row.name, slug: row.slug,
        description: row.description, price: Number(row.price),
        compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : null,
        images: Array.isArray(row.images) ? (row.images as Array<{ url: string }>).map(i => i.url) : [],
        status: row.status, categoryId: row.categoryId,
        categoryName: row.categoryName ?? null,
        createdAt: row.createdAt?.toISOString() ?? "",
      }
    })
  } catch {
    return null
  }
}

/**
 * Get product by ID (cached, RLS enforced)
 */
export async function getProductById(
  tenantId: string,
  productId: string
): Promise<StoreProduct | null> {
  "use cache"
  CACHE_PROFILES.product()
  tagTenantCache("product", tenantId, productId)

  try {
    return await withTenant(tenantId, async (tx) => {
      const [row] = await tx.select({
        id: products.id, name: products.name, slug: products.slug,
        description: products.description, price: products.price,
        compareAtPrice: products.compareAtPrice, images: products.images,
        status: products.status, categoryId: products.categoryId,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.id, productId))
        .limit(1)

      if (!row) return null
      return {
        id: row.id, name: row.name, slug: row.slug,
        description: row.description, price: Number(row.price),
        compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : null,
        images: Array.isArray(row.images) ? (row.images as Array<{ url: string }>).map(i => i.url) : [],
        status: row.status, categoryId: row.categoryId,
        categoryName: row.categoryName ?? null,
        createdAt: row.createdAt?.toISOString() ?? "",
      }
    })
  } catch {
    return null
  }
}

export async function getFeaturedProducts(tenantId: string, limit = 8): Promise<StoreProduct[]> {
  const { products } = await listProducts(tenantId, { limit, sortBy: "created_at" })
  return products
}

export async function getProductsByCategory(
  tenantId: string, categoryId: string, params: Omit<ProductListParams, "categoryId"> = {}
): Promise<ProductListResponse> {
  return listProducts(tenantId, { ...params, categoryId })
}

export async function searchProducts(
  tenantId: string, query: string, params: Omit<ProductListParams, "search"> = {}
): Promise<ProductListResponse> {
  return listProducts(tenantId, { ...params, search: query })
}

export async function revalidateProductsCache(tenantId: string): Promise<void> {
  revalidateTag(getTenantCacheTag("products", tenantId), "hours")
}

export async function revalidateProductCache(tenantId: string, slug: string): Promise<void> {
  revalidateTag(getTenantCacheTag("product", tenantId, slug), "hours")
  revalidateTag(getTenantCacheTag("products", tenantId), "hours")
}

export async function expireProductsCache(tenantId: string): Promise<void> {
  updateTag(getTenantCacheTag("products", tenantId))
}

export async function expireProductCache(tenantId: string, slug?: string): Promise<void> {
  if (slug) updateTag(getTenantCacheTag("product", tenantId, slug))
  updateTag(getTenantCacheTag("products", tenantId))
}
