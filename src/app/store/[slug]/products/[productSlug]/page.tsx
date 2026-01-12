import { createClient } from "@/infrastructure/supabase/server"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ProductDetail } from "@/components/store/product-detail"
import { ProductCard } from "@/components/store/product-card"
import { getAllTenantSlugs, getProductSlugsForTenant } from "@/features/store/data/tenants"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductJsonLd, BreadcrumbJsonLd } from "@/shared/seo"

/**
 * Generate static params for all product detail pages
 * 
 * Cache Strategy (Next.js 16 Cache Components):
 * - Data fetching uses `use cache` directive with cacheLife() in data layer
 * - On-demand revalidation via revalidatePath/revalidateTag in Server Actions
 * - External revalidation via /api/revalidate endpoint
 * 
 * @see https://nextjs.org/docs/app/guides/incremental-static-regeneration
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
  isDraftMode = false,
}: { 
  tenantId: string
  categoryId: string | null
  excludeProductId: string
  storeSlug: string
  isDraftMode?: boolean
}) {
  if (!categoryId) return null

  const supabase = await createClient()
  
  // Build query - include draft products in draft mode
  let query = supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("tenant_id", tenantId)
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(4)

  if (isDraftMode) {
    query = query.in("status", ["active", "draft"])
  } else {
    query = query.eq("status", "active")
  }

  const { data: relatedProducts } = await query

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
            <Skeleton className="aspect-square w-full rounded-xl" />
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
  
  // Check if draft mode is enabled
  const draft = await draftMode()
  const isDraftMode = draft.isEnabled

  // Parallel fetch: tenant and product at the same time
  // In draft mode, also fetch draft products
  const [tenantResult, productResult] = await Promise.all([
    supabase.from("tenants").select("id, name, currency").eq("slug", slug).single(),
    isDraftMode
      ? supabase
          .from("products")
          .select("*, category:categories(id, name, slug)")
          .eq("slug", productSlug)
          .in("status", ["active", "draft"])
          .single()
      : supabase
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

  // Build URLs for JSON-LD
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com"
  const productUrl = `${baseUrl}/store/${slug}/products/${productSlug}`
  const storeUrl = `${baseUrl}/store/${slug}`
  const productImage = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : undefined

  // Build breadcrumb items
  const breadcrumbItems = [
    { name: "Home", url: storeUrl },
    { name: "Products", url: `${storeUrl}/products` },
  ]
  if (product.category) {
    breadcrumbItems.push({
      name: product.category.name,
      url: `${storeUrl}/category/${product.category.slug}`,
    })
  }
  breadcrumbItems.push({ name: product.name, url: productUrl })

  return (
    <>
      {/* JSON-LD Structured Data */}
      <ProductJsonLd
        name={product.name}
        description={product.description || undefined}
        image={productImage}
        sku={product.sku || undefined}
        price={product.price}
        priceCurrency={tenant.currency || "USD"}
        availability={product.stock_quantity > 0 ? "InStock" : "OutOfStock"}
        url={productUrl}
        category={product.category?.name}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Draft mode indicator */}
      {isDraftMode && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[var(--ds-amber-700)] px-4 py-2 text-sm font-medium text-white shadow-lg">
          <span>Draft Mode</span>
          {product.status === "draft" && (
            <span className="rounded bg-[var(--ds-amber-800)] px-2 py-0.5 text-xs">Draft Product</span>
          )}
          <a
            href={`/api/draft/disable?redirect=/store/${slug}`}
            className="rounded bg-[var(--ds-amber-800)] px-2 py-1 text-xs hover:bg-[var(--ds-amber-900)]"
          >
            Exit
          </a>
        </div>
      )}
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
            isDraftMode={isDraftMode}
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
