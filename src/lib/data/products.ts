/**
 * Server-side product data layer for storefront
 * Uses Next.js 16 Cache Components for optimal performance
 */
import "server-only"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag, updateTag } from "next/cache"
import { 
  tagTenantCache, 
  getTenantCacheTag, 
  CACHE_PROFILES,
} from "./cache"

// Types
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
 * Transform raw product data to StoreProduct
 */
function transformProduct(p: Record<string, unknown>): StoreProduct {
  const categories = p.categories as unknown
  let categoryName: string | null = null
  if (Array.isArray(categories) && categories.length > 0) {
    categoryName = (categories[0] as { name: string })?.name || null
  } else if (categories && typeof categories === "object") {
    categoryName = (categories as { name: string })?.name || null
  }

  return {
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
    description: p.description as string | null,
    price: Number(p.price),
    compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
    images: Array.isArray(p.images) ? p.images : [],
    status: p.status as string,
    categoryId: p.category_id as string | null,
    categoryName,
    createdAt: p.created_at as string,
  }
}

/**
 * List products for storefront (cached)
 */
export async function listProducts(
  tenantId: string,
  params: ProductListParams = {}
): Promise<ProductListResponse> {
  "use cache"
  CACHE_PROFILES.products()
  tagTenantCache("products", tenantId)

  const { limit = 12, offset = 0, categoryId, search, sortBy = "created_at" } = params

  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select(
      `
      id, name, slug, description, price, compare_at_price, images, status, created_at,
      category_id,
      categories(name)
    `,
      { count: "exact" }
    )
    .eq("tenant_id", tenantId)
    .eq("status", "active")

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  switch (sortBy) {
    case "price_asc":
      query = query.order("price", { ascending: true })
      break
    case "price_desc":
      query = query.order("price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return { products: [], count: 0, nextOffset: null }
  }

  const products = (data || []).map(transformProduct)
  const totalCount = count || 0
  const nextOffset = offset + limit < totalCount ? offset + limit : null

  return { products, count: totalCount, nextOffset }
}

/**
 * Get single product by slug (cached)
 */
export async function getProductBySlug(
  tenantId: string,
  slug: string
): Promise<StoreProduct | null> {
  "use cache"
  CACHE_PROFILES.product()
  tagTenantCache("product", tenantId, slug)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, description, price, compare_at_price, images, status, created_at,
      category_id,
      categories(name)
    `
    )
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (error || !data) {
    return null
  }

  return transformProduct(data)
}

/**
 * Get product by ID (cached)
 */
export async function getProductById(
  tenantId: string,
  productId: string
): Promise<StoreProduct | null> {
  "use cache"
  CACHE_PROFILES.product()
  tagTenantCache("product", tenantId, productId)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, description, price, compare_at_price, images, status, created_at,
      category_id,
      categories(name)
    `
    )
    .eq("tenant_id", tenantId)
    .eq("id", productId)
    .single()

  if (error || !data) {
    return null
  }

  return transformProduct(data)
}

/**
 * Get featured products for homepage (cached)
 */
export async function getFeaturedProducts(
  tenantId: string,
  limit = 8
): Promise<StoreProduct[]> {
  const { products } = await listProducts(tenantId, {
    limit,
    sortBy: "created_at",
  })
  return products
}

/**
 * Get products by category (cached)
 */
export async function getProductsByCategory(
  tenantId: string,
  categoryId: string,
  params: Omit<ProductListParams, "categoryId"> = {}
): Promise<ProductListResponse> {
  return listProducts(tenantId, { ...params, categoryId })
}

/**
 * Search products (cached)
 */
export async function searchProducts(
  tenantId: string,
  query: string,
  params: Omit<ProductListParams, "search"> = {}
): Promise<ProductListResponse> {
  return listProducts(tenantId, { ...params, search: query })
}

/**
 * Revalidate all products cache for a tenant (background, stale-while-revalidate)
 * Use for background jobs or webhooks where immediate consistency isn't critical
 */
export async function revalidateProductsCache(tenantId: string): Promise<void> {
  revalidateTag(getTenantCacheTag("products", tenantId), "hours")
}

/**
 * Revalidate single product cache (background, stale-while-revalidate)
 */
export async function revalidateProductCache(
  tenantId: string, 
  slug: string
): Promise<void> {
  revalidateTag(getTenantCacheTag("product", tenantId, slug), "hours")
  revalidateTag(getTenantCacheTag("products", tenantId), "hours")
}

/**
 * Immediately expire all products cache for a tenant
 * Use in Server Actions for read-your-own-writes consistency
 */
export async function expireProductsCache(tenantId: string): Promise<void> {
  updateTag(getTenantCacheTag("products", tenantId))
}

/**
 * Immediately expire single product cache
 * Use in Server Actions for read-your-own-writes consistency
 */
export async function expireProductCache(
  tenantId: string, 
  slug?: string
): Promise<void> {
  if (slug) {
    updateTag(getTenantCacheTag("product", tenantId, slug))
  }
  // Always expire the products list too
  updateTag(getTenantCacheTag("products", tenantId))
}
