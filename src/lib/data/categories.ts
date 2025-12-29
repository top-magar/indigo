/**
 * Server-side category data layer for storefront
 * Uses Next.js 16 Cache Components for optimal performance
 */
import "server-only"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"
import { 
  tagTenantCache, 
  getTenantCacheTag, 
  CACHE_PROFILES 
} from "./cache"

// Types
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
 * Transform raw category data to StoreCategory
 */
function transformCategory(c: Record<string, unknown>): StoreCategory {
  return {
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    description: c.description as string | null,
    imageUrl: c.image_url as string | null,
    parentId: c.parent_id as string | null,
    productCount: (c.products as { count: number }[])?.[0]?.count || 0,
  }
}

/**
 * List all categories for a tenant (cached)
 */
export async function listCategories(tenantId: string): Promise<StoreCategory[]> {
  "use cache"
  CACHE_PROFILES.categories()
  tagTenantCache("categories", tenantId)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id, name, slug, description, image_url, parent_id,
      products(count)
    `
    )
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return (data || []).map(transformCategory)
}

/**
 * Get category by slug (cached)
 */
export async function getCategoryBySlug(
  tenantId: string,
  slug: string
): Promise<StoreCategory | null> {
  "use cache"
  CACHE_PROFILES.categories()
  tagTenantCache("category", tenantId, slug)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id, name, slug, description, image_url, parent_id,
      products(count)
    `
    )
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return null
  }

  return transformCategory(data)
}

/**
 * Get root categories - no parent (cached)
 */
export async function getRootCategories(tenantId: string): Promise<StoreCategory[]> {
  "use cache"
  CACHE_PROFILES.categories()
  tagTenantCache("categories", tenantId)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id, name, slug, description, image_url, parent_id,
      products(count)
    `
    )
    .eq("tenant_id", tenantId)
    .is("parent_id", null)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching root categories:", error)
    return []
  }

  return (data || []).map(transformCategory)
}

/**
 * Get child categories (cached)
 */
export async function getChildCategories(
  tenantId: string,
  parentId: string
): Promise<StoreCategory[]> {
  "use cache"
  CACHE_PROFILES.categories()
  tagTenantCache("categories", tenantId)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id, name, slug, description, image_url, parent_id,
      products(count)
    `
    )
    .eq("tenant_id", tenantId)
    .eq("parent_id", parentId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching child categories:", error)
    return []
  }

  return (data || []).map(transformCategory)
}

/**
 * Revalidate all categories cache for a tenant
 */
export async function revalidateCategoriesCache(tenantId: string): Promise<void> {
  revalidateTag(getTenantCacheTag("categories", tenantId), "days")
}

/**
 * Revalidate single category cache
 */
export async function revalidateCategoryCache(
  tenantId: string,
  slug: string
): Promise<void> {
  revalidateTag(getTenantCacheTag("category", tenantId, slug), "days")
  revalidateTag(getTenantCacheTag("categories", tenantId), "days")
}
