import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { db, withTenant } from "@/infrastructure/db"
import { tenants } from "@/db/schema/tenants"
import { categories } from "@/db/schema/products"
import { storeLayouts } from "@/db/schema/store-layouts"
import { eq, asc, and } from "drizzle-orm"
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

/** Cached homepage layout via Drizzle */
const getHomepageLayout = unstable_cache(
  async (tenantId: string) => {
    const rows = await db.select({ themeOverrides: storeLayouts.themeOverrides })
      .from(storeLayouts)
      .where(and(eq(storeLayouts.tenantId, tenantId), eq(storeLayouts.isHomepage, true)))
      .limit(1)
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

  // Block suspended stores
  if ((tenant.settings as Record<string, unknown> | null)?.suspended) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Store Unavailable</p>
          <p className="text-sm text-muted-foreground">This store is temporarily unavailable.</p>
        </div>
      </div>
    )
  }

  // Block unverified stores (but allow owner to preview)
  const { tenantKyc } = await import("@/db/schema/tenant-kyc")
  const [kyc] = await db.select({ status: tenantKyc.status })
    .from(tenantKyc).where(eq(tenantKyc.tenantId, tenant.id)).limit(1)
  const isVerified = kyc?.status === "verified"

  if (!isVerified) {
    // Check if visitor is the store owner
    const { createClient } = await import("@/infrastructure/supabase/server")
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    let isOwner = false
    if (authUser) {
      const { users } = await import("@/db/schema/users")
      const [u] = await db.select({ tenantId: users.tenantId })
        .from(users).where(eq(users.id, authUser.id)).limit(1)
      isOwner = u?.tenantId === tenant.id
    }

    if (!isOwner) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">Store Coming Soon</p>
            <p className="text-sm text-muted-foreground">This store is being set up. Check back soon!</p>
          </div>
        </div>
      )
    }
    // Owner can preview — show banner below
  }

  const [cats, cart, homepageLayout] = await Promise.all([
    getCategories(tenant.id),
    retrieveCart(tenant.id),
    getHomepageLayout(tenant.id),
  ])

  const tenantSettings = (tenant.settings as Record<string, any>) ?? {}
  const sf = (tenantSettings.storefront ?? {}) as Record<string, any>

  const themeOverrides = (homepageLayout?.themeOverrides as Record<string, unknown>) ?? {}
  const cookieEnabled = themeOverrides.cookieConsent === true
  const cookieText = (themeOverrides.cookieText as string) || "We use cookies to improve your experience."

  // Theme CSS variables from storefront settings — sanitized to prevent CSS injection
  const sanitizeCss = (v: string, fallback: string) => {
    const s = (v || fallback).replace(/[;{}()<>\\]/g, "").replace(/\/\*/g, "").replace(/\*\//g, "").trim()
    return s || fallback
  }
  const sanitizeFont = (v: string, fallback: string) => {
    const s = (v || fallback).replace(/[;{}()<>\\'"]/g, "").replace(/\/\*/g, "").trim()
    return s || fallback
  }
  const primaryColor = sanitizeCss(sf.primaryColor as string, "#3b82f6")
  const secondaryColor = sanitizeCss(sf.secondaryColor as string, "#8b5cf6")
  const backgroundColor = sanitizeCss(sf.backgroundColor as string, "#ffffff")
  const headingFont = sanitizeFont(sf.headingFont as string, "Inter")
  const bodyFont = sanitizeFont(sf.bodyFont as string, "Inter")
  const logoUrl = (sf.logoUrl as string) || tenant.logoUrl || ""
  const announcementBar = (sf.announcementBar as string) || ""

  const cssVars = ""
  const fontsUrl = ""

  // Read sections config for announcement bar
  const sections = (sf.sections as Array<{ type: string; content: Record<string, string>; visible: boolean; order: number }>) ?? []
  const announcementSection = sections.find(s => s.type === "announcement" && s.visible)
  const announcementText = announcementSection?.content?.text || announcementBar || ""

  return (
    <CartProvider tenantId={tenant.id} initialCart={cart}>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      {cssVars && <style dangerouslySetInnerHTML={{ __html: cssVars }} />}
      {/* Force light mode: override dark theme variables within store */}
      <div className="store-light" data-theme="light" style={{ colorScheme: "light" }}>
      <StoreShell
        storeSlug={slug}
        header={<>
          {!isVerified && (
            <div className="bg-warning text-warning-foreground text-center py-2 text-xs font-medium">
              Preview mode — not visible to customers.
              <a href="/dashboard/settings/verification" className="underline ml-1">Complete verification →</a>
            </div>
          )}
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
      </div>
    </CartProvider>
  )
}
