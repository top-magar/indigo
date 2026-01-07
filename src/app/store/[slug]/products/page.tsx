import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/store/product-card"
import { getAllTenantSlugs } from "@/features/store/data/tenants"

/**
 * Generate static params for all tenant product listing pages
 * 
 * Cache Strategy (Next.js 16 Cache Components):
 * - Data fetching uses `use cache` directive with cacheLife() in data layer
 * - On-demand revalidation via revalidatePath/revalidateTag in Server Actions
 * - External revalidation via /api/revalidate endpoint
 * 
 * @see https://nextjs.org/docs/app/guides/incremental-static-regeneration
 */
export async function generateStaticParams() {
  return getAllTenantSlugs()
}

export default async function ProductsPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Parallel fetch: tenant and products at the same time
  const [tenantResult, productsResult] = await Promise.all([
    supabase.from("tenants").select("id, name").eq("slug", slug).single(),
    // Start products query - will filter by tenant_id after
    supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ])

  const tenant = tenantResult.data
  if (!tenant) notFound()

  // Filter products by tenant (since we fetched in parallel)
  const products = (productsResult.data || []).filter(p => p.tenant_id === tenant.id)

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="mt-2 text-muted-foreground">Browse our complete collection</p>

        {products.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={slug} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">No products available yet.</p>
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
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", slug)
    .single()

  if (!tenant) {
    return { title: "Products" }
  }

  return {
    title: `All Products | ${tenant.name}`,
    description: `Browse all products at ${tenant.name}`,
  }
}
