import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ProductDetail } from "@/components/store/product-detail"
import { ProductCard } from "@/components/store/product-card"
import { getAllTenantSlugs, getProductSlugsForTenant } from "@/lib/data/tenants"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Generate static params for all product detail pages
 */
export async function generateStaticParams() {
  const tenants = await getAllTenantSlugs()
  
  const allParams = await Promise.all(
    tenants.map(({ slug }) => getProductSlugsForTenant(slug))
  )
  
  return allParams.flat()
}

/**
 * Related products component - streams separately
 */
async function RelatedProducts({ 
  tenantId, 
  categoryId, 
  excludeProductId,
  storeSlug,
}: { 
  tenantId: string
  categoryId: string | null
  excludeProductId: string
  storeSlug: string
}) {
  if (!categoryId) return null

  const supabase = await createClient()
  
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(4)

  if (!relatedProducts || relatedProducts.length === 0) return null

  return (
    <section className="mt-16 border-t pt-16">
      <h2 className="text-2xl font-bold">Related Products</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
        ))}
      </div>
    </section>
  )
}

function RelatedProductsSkeleton() {
  return (
    <section className="mt-16 border-t pt-16">
      <Skeleton className="h-8 w-48" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>
}) {
  const { slug, productSlug } = await params
  const supabase = await createClient()

  // Parallel fetch: tenant and product at the same time
  const [tenantResult, productResult] = await Promise.all([
    supabase.from("tenants").select("id, currency").eq("slug", slug).single(),
    supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .eq("slug", productSlug)
      .eq("status", "active")
      .single(),
  ])

  const tenant = tenantResult.data
  const product = productResult.data

  if (!tenant) notFound()
  if (!product) notFound()

  // Verify product belongs to tenant
  if (product.tenant_id !== tenant.id) notFound()

  return (
    <>
      <ProductDetail
        product={product}
        relatedProducts={[]}
        storeSlug={slug}
        currency={tenant.currency}
      />
      {/* Stream related products separately for faster initial load */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProducts
            tenantId={tenant.id}
            categoryId={product.category_id}
            excludeProductId={product.id}
            storeSlug={slug}
          />
        </Suspense>
      </div>
    </>
  )
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>
}) {
  const { slug, productSlug } = await params
  const supabase = await createClient()

  // Parallel fetch for metadata
  const [tenantResult, productResult] = await Promise.all([
    supabase.from("tenants").select("name").eq("slug", slug).single(),
    supabase.from("products").select("name, description, price").eq("slug", productSlug).single(),
  ])

  const tenant = tenantResult.data
  const product = productResult.data

  if (!tenant || !product) {
    return { title: "Product Not Found" }
  }

  const title = `${product.name} | ${tenant.name}`
  const description = product.description || `Shop ${product.name} at ${tenant.name}`

  return {
    title,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
    },
  }
}
