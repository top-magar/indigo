import { createClient } from "@/infrastructure/supabase/server"

export interface StorefrontProduct {
  id: string
  name: string
  slug: string
  price: number
  images: { url: string }[] | null
  status: string
}

/** Fetch products for a collection (storefront rendering) */
export async function getCollectionProducts(
  tenantId: string,
  collectionId: string,
  limit: number = 12
): Promise<StorefrontProduct[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("collection_products")
    .select("product:products(id, name, slug, price, images, status)")
    .eq("collection_id", collectionId)
    .eq("products.tenant_id", tenantId)
    .eq("products.status", "active")
    .limit(limit)

  if (!data) return []
  return data
    .map((row: any) => row.product)
    .filter(Boolean) as StorefrontProduct[]
}

/** Fetch a single product by ID (storefront rendering) */
export async function getProduct(
  tenantId: string,
  productId: string
): Promise<StorefrontProduct | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, images, status")
    .eq("id", productId)
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .single()

  return data as StorefrontProduct | null
}

/** Fetch latest products for a tenant (fallback when no collection selected) */
export async function getLatestProducts(
  tenantId: string,
  limit: number = 12
): Promise<StorefrontProduct[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, images, status")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit)

  return (data ?? []) as StorefrontProduct[]
}
