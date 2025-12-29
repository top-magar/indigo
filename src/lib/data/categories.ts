/**
 * Server-side category data layer for storefront
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import { getCacheTag } from "./cookies"
import { revalidateTag } from "next/cache"

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
 * List all categories for a tenant
 */
export async function listCategories(tenantId: string): Promise<StoreCategory[]> {
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

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.image_url,
    parentId: c.parent_id,
    productCount: (c.products as { count: number }[])?.[0]?.count || 0,
  }))
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(
  tenantId: string,
  slug: string
): Promise<StoreCategory | null> {
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

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    imageUrl: data.image_url,
    parentId: data.parent_id,
    productCount: (data.products as { count: number }[])?.[0]?.count || 0,
  }
}

/**
 * Get root categories (no parent)
 */
export async function getRootCategories(tenantId: string): Promise<StoreCategory[]> {
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

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.image_url,
    parentId: c.parent_id,
    productCount: (c.products as { count: number }[])?.[0]?.count || 0,
  }))
}

/**
 * Get child categories
 */
export async function getChildCategories(
  tenantId: string,
  parentId: string
): Promise<StoreCategory[]> {
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

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.image_url,
    parentId: c.parent_id,
    productCount: (c.products as { count: number }[])?.[0]?.count || 0,
  }))
}

/**
 * Revalidate categories cache
 */
export async function revalidateCategoriesCache(tenantId: string): Promise<void> {
  const cacheTag = await getCacheTag("categories", tenantId)
  revalidateTag(cacheTag, "max")
}
