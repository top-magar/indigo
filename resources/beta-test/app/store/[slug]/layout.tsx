import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CartProvider } from "@/lib/cart-context"
import { StoreHeader } from "@/components/store/header"
import { StoreFooter } from "@/components/store/footer"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase.from("tenants").select("name, description").eq("slug", slug).single()

  if (!tenant) return { title: "Store Not Found" }

  return {
    title: tenant.name,
    description: tenant.description || `Welcome to ${tenant.name}`,
  }
}

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
    .order("name")

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
