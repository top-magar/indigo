/**
 * Server-side product data layer for storefront
 * Inspired by Medusa's data fetching pattern
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import { getCacheTag } from "./cookies"
import { revalidateTag } from "next/cache"

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
 * List products for storefront
 */
export async function listProducts(
  tenantId: string,
  params: ProductListParams = {}
): Promise<ProductListResponse> {
  const { limit = 12, offset = 0, categoryId, search, sortBy = "created_at" } = params

  const supabase = await createClient()

  // Build query
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

  // Filters
  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Sorting
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

  // Pagination
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return { products: [], count: 0, nextOffset: null }
  }

  const products: StoreProduct[] = (data || []).map((p) => {
    // Handle categories - could be array or object depending on query
    const categories = p.categories as unknown
    let categoryName: string | null = null
    if (Array.isArray(categories) && categories.length > 0) {
      categoryName = (categories[0] as { name: string })?.name || null
    } else if (categories && typeof categories === "object") {
      categoryName = (categories as { name: string })?.name || null
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
      images: Array.isArray(p.images) ? p.images : [],
      status: p.status,
      categoryId: p.category_id,
      categoryName,
      createdAt: p.created_at,
    }
  })

  const totalCount = count || 0
  const nextOffset = offset + limit < totalCount ? offset + limit : null

  return { products, count: totalCount, nextOffset }
}

/**
 * Get single product by slug
 */
export async function getProductBySlug(
  tenantId: string,
  slug: string
): Promise<StoreProduct | null> {
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

  // Handle categories - could be array or object depending on query
  const categories = data.categories as unknown
  let categoryName: string | null = null
  if (Array.isArray(categories) && categories.length > 0) {
    categoryName = (categories[0] as { name: string })?.name || null
  } else if (categories && typeof categories === "object") {
    categoryName = (categories as { name: string })?.name || null
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: Number(data.price),
    compareAtPrice: data.compare_at_price ? Number(data.compare_at_price) : null,
    images: Array.isArray(data.images) ? data.images : [],
    status: data.status,
    categoryId: data.category_id,
    categoryName,
    createdAt: data.created_at,
  }
}

/**
 * Get product by ID
 */
export async function getProductById(
  tenantId: string,
  productId: string
): Promise<StoreProduct | null> {
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

  // Handle categories - could be array or object depending on query
  const categories = data.categories as unknown
  let categoryName: string | null = null
  if (Array.isArray(categories) && categories.length > 0) {
    categoryName = (categories[0] as { name: string })?.name || null
  } else if (categories && typeof categories === "object") {
    categoryName = (categories as { name: string })?.name || null
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: Number(data.price),
    compareAtPrice: data.compare_at_price ? Number(data.compare_at_price) : null,
    images: Array.isArray(data.images) ? data.images : [],
    status: data.status,
    categoryId: data.category_id,
    categoryName,
    createdAt: data.created_at,
  }
}

/**
 * Get featured products (for homepage)
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
 * Get products by category
 */
export async function getProductsByCategory(
  tenantId: string,
  categoryId: string,
  params: Omit<ProductListParams, "categoryId"> = {}
): Promise<ProductListResponse> {
  return listProducts(tenantId, { ...params, categoryId })
}

/**
 * Search products
 */
export async function searchProducts(
  tenantId: string,
  query: string,
  params: Omit<ProductListParams, "search"> = {}
): Promise<ProductListResponse> {
  return listProducts(tenantId, { ...params, search: query })
}

/**
 * Revalidate products cache for tenant
 */
export async function revalidateProductsCache(tenantId: string): Promise<void> {
  const cacheTag = await getCacheTag("products", tenantId)
  revalidateTag(cacheTag, "max")
}
