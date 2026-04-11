import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { CartProvider } from "@/features/store/cart-provider"
import { StoreHeader } from "@/components/store/store-header"
import { StoreFooter } from "@/components/store/store-footer"
import { StoreShell } from "@/components/store/store-shell"
import { retrieveCart } from "@/features/store/data/cart"
import { CookieConsent } from "@/features/store/cookie-consent"

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug, currency, logo_url, primary_color, secondary_color, description, display_currency, price_includes_tax, settings, created_at, updated_at")
    .eq("slug", slug)
    .single()

  if (tenantError || !tenant) notFound()

  const [{ data: categories }, cart] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("tenant_id", tenant.id)
      .order("name"),
    retrieveCart(tenant.id),
  ])

  // Check if global header/footer is enabled in tenant settings
  const tenantSettings = (tenant.settings as Record<string, any>) ?? {}
  const globalHeaderEnabled = tenantSettings.globalHeader?.enabled ?? false
  const globalFooterEnabled = tenantSettings.globalFooter?.enabled ?? false

  // Cookie consent from homepage theme_overrides
  const { data: homepageLayout } = await supabase
    .from("store_layouts")
    .select("theme_overrides")
    .eq("tenant_id", tenant.id)
    .eq("is_homepage", true)
    .maybeSingle()
  const themeOverrides = (homepageLayout?.theme_overrides as Record<string, unknown>) ?? {}
  const cookieEnabled = themeOverrides.cookieConsent === true
  const cookieText = (themeOverrides.cookieText as string) || "We use cookies to improve your experience."

  return (
    <CartProvider tenantId={tenant.id} initialCart={cart}>
      <StoreShell
        storeSlug={slug}
        header={globalHeaderEnabled ? <StoreHeader tenant={tenant as any} categories={categories ?? []} /> : null}
        footer={globalFooterEnabled ? <StoreFooter tenant={tenant as any} /> : null}
      >
        {children}
        <CookieConsent enabled={cookieEnabled} text={cookieText} />
      </StoreShell>
    </CartProvider>
  )
}
