import { createClient } from "@/infrastructure/supabase/server"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"
import { getHomepageLayout, getDraftLayout } from "@/features/store/layout-service"
import { hydrateCraftJson } from "@/features/store/hydrate-craft"
import { WebsiteJsonLd, OrganizationJsonLd } from "@/shared/seo"
import { StorefrontLite } from "@/features/store/storefront-lite"
import { AnalyticsScripts } from "@/features/store/analytics-scripts"
import { DefaultHomepage } from "@/components/store/default-homepage"

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
  // Check for v2 editor data first
  const publishedSource = layout?.blocks
  if (Array.isArray(publishedSource) && publishedSource.length > 0 && (publishedSource[0] as Record<string, unknown>)?._v2) {
    const { RenderSections } = await import("@/features/editor-v2/render")
    const v2Sections = (publishedSource[0] as Record<string, unknown>).sections as { type: string; props: Record<string, unknown> }[]
    const { seo: _seo, ...storeTheme } = themeOverrides
    const t = storeTheme as Record<string, unknown>
    const primaryColor = (t.primaryColor as string) ?? '#3b82f6'
    const secondaryColor = (t.secondaryColor as string) ?? '#8b5cf6'
    const accentColor = (t.accentColor as string) ?? '#06b6d4'
    const bgColor = (t.backgroundColor as string) ?? '#ffffff'
    const surfaceColor = (t.surfaceColor as string) ?? '#f8fafc'
    const textColor = (t.textColor as string) ?? '#0f172a'
    const mutedColor = (t.mutedColor as string) ?? '#64748b'
    const headingFont = (t.headingFont as string) ?? 'Inter'
    const bodyFont = (t.bodyFont as string) ?? 'Inter'
    const headingWeight = (t.headingWeight as string) ?? '700'
    const baseSize = (t.baseSize as number) ?? 16
    const lh = (t.lineHeight as number) ?? 1.6
    const ls = (t.letterSpacing as number) ?? 0
    const borderRadius = (t.borderRadius as number) ?? 8
    const buttonStyle = (t.buttonStyle as string) ?? 'rounded'
    const sectionSpacing = (t.sectionSpacing as number) ?? 64
    const containerWidth = (t.containerWidth as number) ?? 1200
    const isDark = (t.mode as string) === 'dark'
    const effectiveBg = isDark ? ((t.darkBg as string) ?? '#0f172a') : bgColor
    const effectiveText = isDark ? ((t.darkText as string) ?? '#f1f5f9') : textColor
    const effectiveSurface = isDark ? ((t.darkSurface as string) ?? '#1e293b') : surfaceColor
    return (
      <>
        <AnalyticsScripts gaId={themeOverrides.gaId as string} fbPixelId={themeOverrides.fbPixelId as string} headCode={themeOverrides.headCode as string} bodyCode={themeOverrides.bodyCode as string} />
        <WebsiteJsonLd name={tenant.name} url={storeUrl} description={tenant.description || undefined} searchUrl={`${storeUrl}/products?q={search_term_string}`} />
        <div style={{
          '--store-color-primary': primaryColor,
          '--store-color-secondary': secondaryColor,
          '--store-color-accent': accentColor,
          '--store-color-bg': effectiveBg,
          '--store-color-surface': effectiveSurface,
          '--store-color-text': effectiveText,
          '--store-color-muted': mutedColor,
          '--store-font-heading': `"${headingFont}", sans-serif`,
          '--store-font-body': `"${bodyFont}", sans-serif`,
          '--store-heading-weight': headingWeight,
          '--store-base-size': `${baseSize}px`,
          '--store-line-height': String(lh),
          '--store-letter-spacing': `${ls}px`,
          '--store-radius': `${borderRadius}px`,
          '--store-btn-radius': buttonStyle === 'pill' ? '9999px' : buttonStyle === 'sharp' ? '0px' : `${borderRadius}px`,
          '--store-section-spacing': `${sectionSpacing}px`,
          '--store-container-width': `${containerWidth}px`,
          backgroundColor: effectiveBg,
          color: effectiveText,
          fontFamily: `"${bodyFont}", sans-serif`,
          fontSize: `${baseSize}px`,
          lineHeight: String(lh),
          letterSpacing: `${ls}px`,
        } as React.CSSProperties}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
            <RenderSections sections={v2Sections} slug={slug} />
          </div>
        </div>
      </>
    )
  }

  let craftJson: string | null = null
  const source = layout?.blocks
  if (Array.isArray(source) && source.length > 0 && (source[0] as any)?._craftjs) {
    craftJson = (source[0] as any).json
  }

  // Hydrate with live product data
  if (craftJson) {
    const { migrateCraftJson } = await import("@/features/editor/lib/block-versioning")
    craftJson = migrateCraftJson(craftJson)
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
        <StorefrontLite craftJson={craftJson} theme={storeTheme} />
      ) : (
        <DefaultHomepage
          tenantId={tenant.id}
          tenantName={tenant.name}
          tenantDescription={tenant.description}
          storeSlug={slug}
        />
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

  const theme = layout?.theme_overrides as Record<string, unknown> | undefined
  const seo = theme?.seo as { title?: string; description?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; twitterCard?: "summary" | "summary_large_image" } | undefined
  const title = (theme?.seoTitle as string) || seo?.title || tenant.name
  const description = (theme?.seoDescription as string) || seo?.description || tenant.description || `Shop at ${tenant.name}`
  const ogImage = (theme?.ogImage as string) || seo?.ogImage
  const ogTitle = seo?.ogTitle || title
  const ogDescription = seo?.ogDescription || description

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website" as const,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: seo?.twitterCard || "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}
