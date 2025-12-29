import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/store/product-detail"
import { getAllTenantSlugs, getProductSlugsForTenant } from "@/lib/data/tenants"

/**
 * Generate static params for all product detail pages
 * Fetches all tenant slugs, then all product slugs for each tenant
 */
export async function generateStaticParams() {
  const tenants = await getAllTenantSlugs()
  
  const allParams = await Promise.all(
    tenants.map(({ slug }) => getProductSlugsForTenant(slug))
  )
  
  return allParams.flat()
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>
}) {
  const { slug, productSlug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase.from("tenants").select("id, currency").eq("slug", slug).single()

  if (!tenant) notFound()

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("tenant_id", tenant.id)
    .eq("slug", productSlug)
    .eq("status", "active")
    .single()

  if (!product) notFound()

  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("tenant_id", tenant.id)
    .eq("status", "active")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4)

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts || []}
      storeSlug={slug}
      currency={tenant.currency}
    />
  )
}
