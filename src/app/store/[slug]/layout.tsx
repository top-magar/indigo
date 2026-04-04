import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { CartProvider } from "@/features/store/cart-provider"
import { StoreHeader } from "@/components/store/store-header"
import { StoreFooter } from "@/components/store/store-footer"
import { StoreShell } from "@/components/store/store-shell"
import { retrieveCart } from "@/features/store/data/cart"

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
    .select("id, name, slug, currency, logo_url, primary_color, secondary_color, description, display_currency, price_includes_tax, stripe_account_id, stripe_onboarding_complete, settings, created_at, updated_at")
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

  return (
    <CartProvider tenantId={tenant.id} initialCart={cart}>
      <StoreShell
        storeSlug={slug}
        header={globalHeaderEnabled ? <StoreHeader tenant={tenant as any} categories={categories ?? []} /> : null}
        footer={globalFooterEnabled ? <StoreFooter tenant={tenant as any} /> : null}
      >
        {children}
      </StoreShell>
    </CartProvider>
  )
}
