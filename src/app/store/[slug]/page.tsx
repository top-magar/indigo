import { createClient } from "@/infrastructure/supabase/server"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"
import { getHomepageLayout, getDraftLayout } from "@/features/store/layout-service"
import { hydrateCraftJson } from "@/features/store/hydrate-craft"
import { WebsiteJsonLd, OrganizationJsonLd } from "@/shared/seo"
import { StorefrontRenderer } from "@/features/store/storefront-renderer"

export async function generateStaticParams() {
  const { getAllTenantSlugs } = await import("@/features/store/data/tenants")
  return getAllTenantSlugs()
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const draft = await draftMode()
  const isDraftMode = draft.isEnabled
  const supabase = await createClient()

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug, description, currency, logo_url")
    .eq("slug", slug)
    .single()

  if (tenantError || !tenant) notFound()

  // Fetch layout + theme
  let layout
  let themeOverrides: Record<string, unknown> = {}
  if (isDraftMode) {
    const draftResult = await getDraftLayout(tenant.id, slug)
    layout = draftResult?.layout
  }
  if (!layout) {
    const result = await getHomepageLayout(tenant.id, slug)
    layout = result.layout
  }

  // Fetch theme_overrides directly (not on PageLayout type)
  const { data: layoutRow } = await supabase
    .from("store_layouts")
    .select("theme_overrides")
    .eq("tenant_id", tenant.id)
    .eq("is_homepage", true)
    .maybeSingle()
  if (layoutRow?.theme_overrides) {
    themeOverrides = layoutRow.theme_overrides as Record<string, unknown>
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com"
  const storeUrl = `${baseUrl}/store/${slug}`

  // Extract Craft.js JSON from published blocks
  let craftJson: string | null = null
  const source = layout?.blocks
  if (Array.isArray(source) && source.length > 0 && (source[0] as any)?._craftjs) {
    craftJson = (source[0] as any).json
  }

  // Hydrate with live product data
  if (craftJson) {
    craftJson = await hydrateCraftJson(craftJson, tenant.id)
  }

  // Extract theme from layout
  const { seo: _seo, ...storeTheme } = themeOverrides

  return (
    <>
      <WebsiteJsonLd
        name={tenant.name}
        url={storeUrl}
        description={tenant.description || undefined}
        searchUrl={`${storeUrl}/products?q={search_term_string}`}
      />
      <OrganizationJsonLd
        name={tenant.name}
        url={storeUrl}
        logo={tenant.logo_url || undefined}
        description={tenant.description || undefined}
      />
      {isDraftMode && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-white shadow-lg">
          <span>Draft Mode</span>
          <a href={`/api/draft/disable?redirect=/store/${slug}`} className="rounded bg-amber-500 px-2 py-1 text-xs hover:bg-orange-700">Exit</a>
        </div>
      )}
      {/* Storefront renderer */}
      {craftJson ? (
        <StorefrontRenderer craftJson={craftJson} theme={storeTheme} />
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg">This store hasn&apos;t been set up yet</p>
        </div>
      )}
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, description")
    .eq("slug", slug)
    .single()

  if (!tenant) return { title: "Store Not Found" }

  // Check for custom SEO in theme_overrides
  const { data: layout } = await supabase
    .from("store_layouts")
    .select("theme_overrides")
    .eq("tenant_id", tenant.id)
    .eq("is_homepage", true)
    .maybeSingle()

  const seo = (layout?.theme_overrides as any)?.seo as { title?: string; description?: string; ogImage?: string } | undefined
  const title = seo?.title || tenant.name
  const description = seo?.description || tenant.description || `Shop at ${tenant.name}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website" as const,
      ...(seo?.ogImage ? { images: [{ url: seo.ogImage }] } : {}),
    },
  }
}
