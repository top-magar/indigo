import { createClient } from "@/lib/supabase/server"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"
import { BlockRenderer } from "@/components/store/blocks"
import { LiveBlockRenderer } from "@/components/store/blocks/live-block-renderer"
import { getHomepageLayout, getDraftLayout } from "@/lib/store/layout-service"
import { getAllTenantSlugs } from "@/lib/data/tenants"
import type { Product } from "@/components/store/blocks"

/**
 * Generate static params for all tenant store pages
 * This enables static generation at build time for known tenants
 * 
 * Cache Strategy (Next.js 16 Cache Components):
 * - Data fetching uses `use cache` directive with cacheLife() in data layer
 * - On-demand revalidation via revalidatePath/revalidateTag in Server Actions
 * - External revalidation via /api/revalidate endpoint
 * 
 * @see https://nextjs.org/docs/app/guides/incremental-static-regeneration
 */
export async function generateStaticParams() {
  return getAllTenantSlugs()
}

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
  
  // Check if draft mode is enabled
  const draft = await draftMode()
  const isDraftMode = draft.isEnabled
  
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

  // Fetch layout - use draft layout if draft mode is enabled
  let layout
  let isDefault = false
  
  if (isDraftMode) {
    // In draft mode, fetch the draft version of the layout
    const draftResult = await getDraftLayout(tenant.id, slug)
    if (draftResult) {
      layout = draftResult.layout
      isDefault = draftResult.isDefault
    } else {
      // Fall back to published layout if no draft exists
      const publishedResult = await getHomepageLayout(tenant.id, slug)
      layout = publishedResult.layout
      isDefault = publishedResult.isDefault
    }
  } else {
    const result = await getHomepageLayout(tenant.id, slug)
    layout = result.layout
    isDefault = result.isDefault
  }

  // Fetch products - include draft products if draft mode is enabled
  const productQuery = supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, images, status")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(24)

  // In draft mode, show both active and draft products
  // In normal mode, only show active products
  if (isDraftMode) {
    productQuery.in("status", ["active", "draft"])
  } else {
    productQuery.eq("status", "active")
  }

  const { data: rawProducts } = await productQuery

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
    <>
      {/* Draft mode indicator */}
      {isDraftMode && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
          <span>Draft Mode</span>
          <a
            href={`/api/draft/disable?redirect=/store/${slug}`}
            className="rounded bg-amber-600 px-2 py-1 text-xs hover:bg-amber-700"
          >
            Exit
          </a>
        </div>
      )}
      <BlockRenderer
        layout={finalLayout}
        storeName={tenant.name}
        storeSlug={slug}
        products={products}
        currency={tenant.currency || "USD"}
      />
    </>
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

  const description = tenant.description || `Shop at ${tenant.name}`

  return {
    title: tenant.name,
    description,
    openGraph: {
      title: tenant.name,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tenant.name,
      description,
    },
  }
}
