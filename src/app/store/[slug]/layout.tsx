import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { CartProvider } from "@/features/store/cart-provider"
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

  // Fetch tenant first (needed for cart retrieval)
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name, slug, currency")
    .eq("slug", slug)
    .single()

  if (error || !tenant) {
    notFound()
  }

  // Fetch cart in parallel with page render
  // Cart retrieval is non-blocking - page can render while cart loads
  const cart = await retrieveCart(tenant.id)

  return (
    <CartProvider tenantId={tenant.id} initialCart={cart}>
      {children}
    </CartProvider>
  )
}
