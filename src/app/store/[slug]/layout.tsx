import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CartProvider } from "@/lib/store/cart-provider"
import { retrieveCart } from "@/lib/data/cart"

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch tenant
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name, slug, currency")
    .eq("slug", slug)
    .single()

  if (error || !tenant) {
    notFound()
  }

  // Fetch cart (server-side)
  const cart = await retrieveCart(tenant.id)

  return (
    <CartProvider tenantId={tenant.id} initialCart={cart}>
      {children}
    </CartProvider>
  )
}
