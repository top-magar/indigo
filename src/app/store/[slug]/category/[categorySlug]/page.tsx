import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/store/product-card"
import { getAllTenantSlugs, getCategorySlugsForTenant } from "@/lib/data/tenants"

/**
 * Generate static params for all category pages
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

  // Parallel fetch: tenant and category at the same time
  const [tenantResult, categoryResult] = await Promise.all([
    supabase.from("tenants").select("id").eq("slug", slug).single(),
    supabase.from("categories").select("*").eq("slug", categorySlug).single(),
  ])

  const tenant = tenantResult.data
  const category = categoryResult.data

  if (!tenant) notFound()
  if (!category) notFound()

  // Verify category belongs to tenant
  if (category.tenant_id !== tenant.id) notFound()

  // Fetch products for this category
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
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}

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

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>
}) {
  const { slug, categorySlug } = await params
  const supabase = await createClient()

  // Parallel fetch for metadata
  const [tenantResult, categoryResult] = await Promise.all([
    supabase.from("tenants").select("name").eq("slug", slug).single(),
    supabase.from("categories").select("name, description").eq("slug", categorySlug).single(),
  ])

  const tenant = tenantResult.data
  const category = categoryResult.data

  if (!tenant || !category) {
    return { title: "Category Not Found" }
  }

  return {
    title: `${category.name} | ${tenant.name}`,
    description: category.description || `Shop ${category.name} at ${tenant.name}`,
  }
}
