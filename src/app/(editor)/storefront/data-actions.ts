"use server"

import { createClient } from "@/infrastructure/supabase/server"

export interface EditorProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  status: string
}

export interface EditorCollection {
  id: string
  name: string
  slug: string
  description: string | null
  productCount: number
  image: string | null
}

/**
 * Fetch products for the editor picker
 */
export async function getEditorProducts(
  search?: string,
  limit = 50
): Promise<EditorProduct[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // Get user's tenant
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single()

  if (!userData?.tenant_id) return []

  let query = supabase
    .from("products")
    .select("id, name, slug, price, images, status")
    .eq("tenant_id", userData.tenant_id)
    .eq("status", "active")
    .order("name", { ascending: true })
    .limit(limit)

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
    status: p.status,
  }))
}

/**
 * Fetch a single product by ID
 */
export async function getEditorProductById(
  productId: string
): Promise<EditorProduct | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's tenant
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single()

  if (!userData?.tenant_id) return null

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, images, status")
    .eq("tenant_id", userData.tenant_id)
    .eq("id", productId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    price: Number(data.price),
    image: Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null,
    status: data.status,
  }
}

/**
 * Fetch multiple products by IDs
 */
export async function getEditorProductsByIds(
  productIds: string[]
): Promise<EditorProduct[]> {
  if (productIds.length === 0) return []

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // Get user's tenant
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single()

  if (!userData?.tenant_id) return []

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, images, status")
    .eq("tenant_id", userData.tenant_id)
    .in("id", productIds)

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
    status: p.status,
  }))
}

/**
 * Fetch collections for the editor picker
 */
export async function getEditorCollections(
  search?: string,
  limit = 50
): Promise<EditorCollection[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // Get user's tenant
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single()

  if (!userData?.tenant_id) return []

  let query = supabase
    .from("collections")
    .select("id, name, slug, description, image")
    .eq("tenant_id", userData.tenant_id)
    .order("name", { ascending: true })
    .limit(limit)

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching collections:", error)
    return []
  }

  // Get product counts for each collection
  const collectionsWithCounts = await Promise.all(
    (data || []).map(async (c) => {
      const { count } = await supabase
        .from("collection_products")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", c.id)

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        productCount: count || 0,
        image: c.image,
      }
    })
  )

  return collectionsWithCounts
}

/**
 * Fetch a single collection by ID
 */
export async function getEditorCollectionById(
  collectionId: string
): Promise<EditorCollection | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's tenant
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single()

  if (!userData?.tenant_id) return null

  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, image")
    .eq("tenant_id", userData.tenant_id)
    .eq("id", collectionId)
    .single()

  if (error || !data) return null

  // Get product count
  const { count } = await supabase
    .from("collection_products")
    .select("*", { count: "exact", head: true })
    .eq("collection_id", collectionId)

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    productCount: count || 0,
    image: data.image,
  }
}
