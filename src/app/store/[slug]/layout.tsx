import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { db, withTenant } from "@/infrastructure/db"
import { tenants } from "@/db/schema/tenants"
import { categories } from "@/db/schema/products"
import { eq, asc, sql } from "drizzle-orm"
import { CartProvider } from "@/features/store/cart-provider"
import { StoreHeader } from "@/components/store/store-header"
import { StoreFooter } from "@/components/store/store-footer"
import { StoreShell } from "@/components/store/store-shell"
import { retrieveCart } from "@/features/store/data/cart"
import { CookieConsent } from "@/features/store/cookie-consent"

/** Cached tenant lookup via Drizzle (no RLS needed — public lookup by slug) */
const getTenant = unstable_cache(
  async (slug: string) => {
    const rows = await db.select({
      id: tenants.id, name: tenants.name, slug: tenants.slug, currency: tenants.currency,
      logoUrl: tenants.logoUrl, description: tenants.description,
      displayCurrency: tenants.displayCurrency, priceIncludesTax: tenants.priceIncludesTax,
      settings: tenants.settings, createdAt: tenants.createdAt, updatedAt: tenants.updatedAt,
    }).from(tenants).where(eq(tenants.slug, slug)).limit(1)
    return rows[0] ?? null
  },
  ["store-tenant"],
  { revalidate: 300, tags: ["store-tenant"] }
)

/** Cached categories via Drizzle withTenant (RLS enforced) */
const getCategories = unstable_cache(
  async (tenantId: string) => {
    return withTenant(tenantId, async (tx) =>
      tx.select({ id: categories.id, name: categories.name, slug: categories.slug })
        .from(categories).orderBy(asc(categories.name))
    )
  },
  ["store-categories"],
  { revalidate: 300, tags: ["store-categories"] }
)

/** Cached homepage layout — raw SQL since store_layouts has no Drizzle schema */
const getHomepageLayout = unstable_cache(
  async (tenantId: string) => {
    const rows = await db.execute(
      sql`SELECT theme_overrides FROM store_layouts WHERE tenant_id = ${tenantId} AND is_homepage = true LIMIT 1`
    )
    return rows[0] ?? null
  },
  ["store-homepage-layout"],
  { revalidate: 300, tags: ["store-layout"] }
)

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const tenant = await getTenant(slug)
  if (!tenant) notFound()

  const [cats, cart, homepageLayout] = await Promise.all([
    getCategories(tenant.id),
    retrieveCart(tenant.id),
    getHomepageLayout(tenant.id),
  ])

  const tenantSettings = (tenant.settings as Record<string, any>) ?? {}
  const sf = (tenantSettings.storefront ?? {}) as Record<string, any>

  const themeOverrides = (homepageLayout?.theme_overrides as Record<string, unknown>) ?? {}
  const cookieEnabled = themeOverrides.cookieConsent === true
  const cookieText = (themeOverrides.cookieText as string) || "We use cookies to improve your experience."

  // Theme CSS variables from storefront settings
  const primaryColor = (sf.primaryColor as string) || "#3b82f6"
  const secondaryColor = (sf.secondaryColor as string) || "#8b5cf6"
  const backgroundColor = (sf.backgroundColor as string) || "#ffffff"
  const headingFont = (sf.headingFont as string) || "Inter"
  const bodyFont = (sf.bodyFont as string) || "Inter"
  const logoUrl = (sf.logoUrl as string) || tenant.logoUrl || ""
  const announcementBar = (sf.announcementBar as string) || ""

  const cssVars = `
    :root {
      --store-primary: ${primaryColor};
      --store-secondary: ${secondaryColor};
      --store-bg: ${backgroundColor};
      --store-heading-font: '${headingFont}', sans-serif;
      --store-body-font: '${bodyFont}', sans-serif;
    }
    body { font-family: var(--store-body-font); background-color: var(--store-bg); }
    h1, h2, h3, h4, h5, h6 { font-family: var(--store-heading-font); }
  `.trim()

  // Google Fonts link for selected fonts
  const fonts = new Set([headingFont, bodyFont])
  const fontsUrl = `https://fonts.googleapis.com/css2?${[...fonts].map(f => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join("&")}&display=swap`

  // Read sections config for announcement bar
  const sections = (sf.sections as Array<{ type: string; content: Record<string, string>; visible: boolean; order: number }>) ?? []
  const announcementSection = sections.find(s => s.type === "announcement" && s.visible)
  const announcementText = announcementSection?.content?.text || announcementBar || ""

  return (
    <CartProvider tenantId={tenant.id} initialCart={cart}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsUrl} />
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      <StoreShell
        storeSlug={slug}
        header={<>
          {announcementText && (
            <div className="text-center py-2 px-4 text-sm font-medium text-white" style={{ backgroundColor: primaryColor }}>{announcementText}</div>
          )}
          <StoreHeader tenant={{ ...tenant as any, logoUrl }} categories={cats} />
        </>}
        footer={<StoreFooter tenant={{ ...tenant as any, footerText: sf.footerText, contactEmail: sf.contactEmail, contactPhone: sf.contactPhone, socialLinks: sf.socialLinks }} />}
      >
        {children}
        <CookieConsent enabled={cookieEnabled} text={cookieText} />
      </StoreShell>
    </CartProvider>
  )
}
