import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/store/product-card"
import { getAllTenantSlugs, getCategorySlugsForTenant } from "@/lib/data/tenants"

/**
 * Generate static params for all category pages
 * Fetches all tenant slugs, then all category slugs for each tenant
 */
export async function generateStaticParams() {
  const tenants = await getAllTenantSlugs()
  
  const allParams = await Promise.all(
    tenants.map(({ slug }) => getCategorySlugsForTenant(slug))
  )
  
  return allParams.flat()
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>
}) {
  const { slug, categorySlug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", slug).single()

  if (!tenant) notFound()

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("slug", categorySlug)
    .single()

  if (!category) notFound()

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("tenant_id", tenant.id)
    .eq("category_id", category.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && <p className="mt-2 text-muted-foreground">{category.description}</p>}

        {products && products.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={slug} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">No products in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
