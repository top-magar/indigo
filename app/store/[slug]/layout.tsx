import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CartProvider } from "@/lib/cart-context"
import { StoreHeader } from "@/components/store/store-header"
import { StoreFooter } from "@/components/store/store-footer"

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase.from("tenants").select("*").eq("slug", slug).single()

  if (!tenant) notFound()

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("tenant_id", tenant.id)
    .order("sort_order")

  return (
    <CartProvider tenantSlug={slug}>
      <div className="flex min-h-screen flex-col">
        <StoreHeader tenant={tenant} categories={categories || []} />
        <main className="flex-1">{children}</main>
        <StoreFooter tenant={tenant} />
      </div>
    </CartProvider>
  )
}
