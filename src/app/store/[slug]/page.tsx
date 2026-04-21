import { db } from "@/infrastructure/db"
import { tenants } from "@/db/schema/tenants"
import { editorProjects } from "@/db/schema/editor-projects"
import { editorPages } from "@/db/schema/editor-pages"
import { eq, and, desc, asc, sql } from "drizzle-orm"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"
import { getHomepageLayout, getDraftLayout } from "@/features/store/layout-service"
import { hydrateCraftJson } from "@/features/store/hydrate-craft"
import { WebsiteJsonLd, OrganizationJsonLd } from "@/shared/seo"
import { StorefrontLite } from "@/features/store/storefront-lite"
import { AnalyticsScripts } from "@/features/store/analytics-scripts"
import { DefaultHomepage } from "@/components/store/default-homepage"
import { SectionRenderer } from "@/features/store/section-renderer"
import { PasswordGate } from "@/features/store/password-gate"

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

  const [tenant] = await db.select({
    id: tenants.id, name: tenants.name, slug: tenants.slug,
    description: tenants.description, currency: tenants.currency, logoUrl: tenants.logoUrl,
  }).from(tenants).where(eq(tenants.slug, slug)).limit(1)

  if (!tenant) notFound()

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

  // Fetch theme_overrides directly via Drizzle raw SQL
  const layoutRows = await db.execute(
    sql`SELECT theme_overrides FROM store_layouts WHERE tenant_id = ${tenant.id} AND is_homepage = true LIMIT 1`
  )
  if (layoutRows[0]?.theme_overrides) {
    themeOverrides = layoutRows[0].theme_overrides as Record<string, unknown>
  }

  // Merge storefront settings from dashboard (takes priority over store_layouts)
  const [tenantFull] = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenant.id)).limit(1)
  const sfSettings = ((tenantFull?.settings as Record<string, unknown>)?.storefront ?? {}) as Record<string, unknown>
  themeOverrides = { ...themeOverrides, ...sfSettings }

  // Check for pages built with the new visual editor (highest priority)
  const [editorProject] = await db.select({ id: editorProjects.id })
    .from(editorProjects)
    .where(and(eq(editorProjects.tenantId, tenant.id), eq(editorProjects.published, true)))
    .orderBy(desc(editorProjects.updatedAt))
    .limit(1);

  if (editorProject) {
    const pages = await db.select({
      name: editorPages.name, slug: editorPages.slug,
      isHomepage: editorPages.isHomepage, publishedHtml: editorPages.publishedHtml,
    }).from(editorPages)
      .where(and(eq(editorPages.projectId, editorProject.id), eq(editorPages.published, true)))
      .orderBy(asc(editorPages.order));

    const homepage = pages.find(p => p.isHomepage) || pages[0];
    if (homepage?.publishedHtml) {
      const nav = pages.length > 1
        ? `<nav style="display:flex;gap:24px;padding:12px 24px;background:#fff;border-bottom:1px solid #eee;font-family:Inter,system-ui,sans-serif;font-size:14px">${pages.map(p => `<a href="/store/${slug}${p.isHomepage ? '' : `/p/${p.slug}`}" style="color:#333;text-decoration:none;font-weight:${p.isHomepage ? '600' : '400'}">${p.name}</a>`).join('')}</nav>`
        : '';
      const html = homepage.publishedHtml.replace(/<body[^>]*>/, (m) => `${m}${nav}`);
      return <html><body dangerouslySetInnerHTML={{ __html: html }} /></html>;
    }
  }

  // Section-based rendering — if merchant configured sections in dashboard, use those
  const storefrontSections = sfSettings.sections as import("@/features/store/section-registry").SectionConfig[] | undefined
  if (storefrontSections && storefrontSections.length > 0) {
    return (
      <>
        <WebsiteJsonLd name={tenant.name} url={`${process.env.NEXT_PUBLIC_APP_URL}/store/${slug}`} description={tenant.description || undefined} />
        <SectionRenderer
          sections={storefrontSections}
          tenantId={tenant.id} storeSlug={slug} storeName={tenant.name}
          primaryColor={(sfSettings.primaryColor as string) || "#3b82f6"}
        />
      </>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com"
  const storeUrl = `${baseUrl}/store/${slug}`

  // v2 editor data is no longer supported (editor-v2 removed)

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
    <PasswordGate enabled={!!themeOverrides.passwordProtected} password={(themeOverrides.sitePassword as string) ?? ""} slug={slug}>
      <WebsiteJsonLd
        name={tenant.name}
        url={storeUrl}
        description={tenant.description || undefined}
        searchUrl={`${storeUrl}/products?q={search_term_string}`}
      />
      <OrganizationJsonLd
        name={tenant.name}
        url={storeUrl}
        logo={tenant.logoUrl || undefined}
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
      ) : (themeOverrides.sections as unknown[])?.length ? (
        <SectionRenderer
          sections={themeOverrides.sections as import("@/features/store/section-registry").SectionConfig[]}
          tenantId={tenant.id} storeSlug={slug} storeName={tenant.name}
          primaryColor={(themeOverrides.primaryColor as string) || "#3b82f6"}
        />
      ) : (
        <DefaultHomepage
          tenantId={tenant.id}
          tenantName={tenant.name}
          tenantDescription={tenant.description}
          storeSlug={slug}
          heroTitle={(themeOverrides.heroTitle as string) || ""}
          heroSubtitle={(themeOverrides.heroSubtitle as string) || ""}
          heroCta={(themeOverrides.heroCta as string) || ""}
          heroImageUrl={(themeOverrides.heroImageUrl as string) || ""}
        />
      )}
    </PasswordGate>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [tenant] = await db.select({ id: tenants.id, name: tenants.name, description: tenants.description })
    .from(tenants).where(eq(tenants.slug, slug)).limit(1)

  if (!tenant) return { title: "Store Not Found" }

  const layoutRows = await db.execute(
    sql`SELECT theme_overrides FROM store_layouts WHERE tenant_id = ${tenant.id} AND is_homepage = true LIMIT 1`
  )

  const theme = layoutRows[0]?.theme_overrides as Record<string, unknown> | undefined
  const seo = theme?.seo as { title?: string; description?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; twitterCard?: "summary" | "summary_large_image" } | undefined
  const title = (theme?.seoTitle as string) || seo?.title || tenant.name
  const description = (theme?.seoDescription as string) || seo?.description || tenant.description || `Shop at ${tenant.name}`
  const ogImage = (theme?.ogImage as string) || seo?.ogImage
  const ogTitle = seo?.ogTitle || title
  const ogDescription = seo?.ogDescription || description
  const faviconUrl = (theme?.faviconUrl as string) || "/favicon.ico"

  return {
    title,
    description,
    icons: { icon: faviconUrl },
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
