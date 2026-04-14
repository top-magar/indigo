import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { CartProvider } from "@/features/store/cart-provider"
import { StoreHeader } from "@/components/store/store-header"
import { StoreFooter } from "@/components/store/store-footer"
import { StoreShell } from "@/components/store/store-shell"
import { retrieveCart } from "@/features/store/data/cart"
import { CookieConsent } from "@/features/store/cookie-consent"
import { unstable_cache } from "next/cache"

/** Cached tenant lookup — revalidates on settings change via revalidateTag(`tenant:${slug}`) */
const getTenant = unstable_cache(
  async (slug: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from("tenants")
      .select("id, name, slug, currency, logo_url, primary_color, secondary_color, description, display_currency, price_includes_tax, settings, created_at, updated_at")
      .eq("slug", slug)
      .single()
    return data
  },
  ["store-tenant"],
  { revalidate: 300, tags: ["store-tenant"] }
)

/** Cached categories — revalidates when categories change */
const getCategories = unstable_cache(
  async (tenantId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("tenant_id", tenantId)
      .order("name")
    return data ?? []
  },
  ["store-categories"],
  { revalidate: 300, tags: ["store-categories"] }
)

/** Cached homepage layout for cookie/theme settings */
const getHomepageLayout = unstable_cache(
  async (tenantId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from("store_layouts")
      .select("theme_overrides")
      .eq("tenant_id", tenantId)
      .eq("is_homepage", true)
      .maybeSingle()
    return data
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

  // Parallelize all remaining queries
  const [categories, cart, homepageLayout] = await Promise.all([
    getCategories(tenant.id),
    retrieveCart(tenant.id),
    getHomepageLayout(tenant.id),
  ])

  const tenantSettings = (tenant.settings as Record<string, any>) ?? {}
  const globalHeaderEnabled = tenantSettings.globalHeader?.enabled ?? false
  const globalFooterEnabled = tenantSettings.globalFooter?.enabled ?? false

  const themeOverrides = (homepageLayout?.theme_overrides as Record<string, unknown>) ?? {}
  const cookieEnabled = themeOverrides.cookieConsent === true
  const cookieText = (themeOverrides.cookieText as string) || "We use cookies to improve your experience."

  return (
    <CartProvider tenantId={tenant.id} initialCart={cart}>
      <StoreShell
        storeSlug={slug}
        header={globalHeaderEnabled ? <StoreHeader tenant={tenant as any} categories={categories} /> : null}
        footer={globalFooterEnabled ? <StoreFooter tenant={tenant as any} /> : null}
      >
        {children}
        <CookieConsent enabled={cookieEnabled} text={cookieText} />
      </StoreShell>
    </CartProvider>
  )
}
