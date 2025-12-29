import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { BlockRenderer } from "@/components/store/blocks"
import { LiveBlockRenderer } from "@/components/store/blocks/live-block-renderer"
import { getHomepageLayout } from "@/lib/store/layout-service"
import type { Product } from "@/components/store/blocks"

// Force dynamic rendering to always get fresh data
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function StorePage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>
  searchParams: Promise<{ editor?: string }>
}) {
  const { slug } = await params
  const { editor } = await searchParams
  const isEditorMode = editor === "true"
  
  const supabase = await createClient()

  // Fetch tenant
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug, description, currency, logo_url")
    .eq("slug", slug)
    .single()

  if (tenantError || !tenant) {
    notFound()
  }

  // Fetch layout directly (no caching for now to ensure fresh data)
  const { layout, isDefault } = await getHomepageLayout(tenant.id, slug)

  // Fetch products for product grid blocks
  const { data: rawProducts } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, images, status")
    .eq("tenant_id", tenant.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(24)

  // Transform to block system Product type
  const products: Product[] = (rawProducts || []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compare_at_price,
    image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : undefined,
  }))

  // If using default layout, customize hero with tenant data
  const finalLayout = { ...layout }
  if (isDefault) {
    const heroBlock = finalLayout.blocks.find((b) => b.type === "hero")
    if (heroBlock && heroBlock.type === "hero") {
      heroBlock.settings.headline = tenant.name
      heroBlock.settings.subheadline = tenant.description || "Discover amazing products crafted with care"
    }
  }

  // Use LiveBlockRenderer when in editor mode for real-time updates
  if (isEditorMode) {
    return (
      <LiveBlockRenderer
        initialBlocks={finalLayout.blocks}
        storeName={tenant.name}
        storeSlug={slug}
        products={products}
        currency={tenant.currency || "USD"}
      />
    )
  }

  return (
    <BlockRenderer
      layout={finalLayout}
      storeName={tenant.name}
      storeSlug={slug}
      products={products}
      currency={tenant.currency || "USD"}
    />
  )
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name, description")
    .eq("slug", slug)
    .single()

  if (!tenant) {
    return { title: "Store Not Found" }
  }

  return {
    title: tenant.name,
    description: tenant.description || `Shop at ${tenant.name}`,
  }
}
