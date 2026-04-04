import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/store/product-card"
import { getAllTenantSlugs } from "@/features/store/data/tenants"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/shared/utils"

export async function generateStaticParams() {
  return getAllTenantSlugs()
}

const PAGE_SIZE = 12

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; q?: string; category?: string }>
}) {
  const { slug } = await params
  const { page: pageStr, q, category } = await searchParams
  const currentPage = Math.max(1, parseInt(pageStr || "1", 10))
  const offset = (currentPage - 1) * PAGE_SIZE

  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (!tenant) notFound()

  // Fetch categories for filter bar
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("tenant_id", tenant.id)
    .order("name")

  // Build product query
  let query = supabase
    .from("products")
    .select("*, category:categories(id, name, slug)", { count: "exact" })
    .eq("tenant_id", tenant.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (q) {
    query = query.ilike("name", `%${q}%`)
  }

  if (category) {
    // Filter by category slug via join
    query = query.eq("category.slug", category)
  }

  const { data: products, count } = await query
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  // Build URL helper for filter links
  const filterUrl = (cat?: string) => {
    const p = new URLSearchParams()
    if (cat) p.set("category", cat)
    if (q) p.set("q", q)
    const qs = p.toString()
    return `/store/${slug}/products${qs ? `?${qs}` : ""}`
  }

  const pageUrl = (page: number) => {
    const p = new URLSearchParams()
    if (page > 1) p.set("page", String(page))
    if (q) p.set("q", q)
    if (category) p.set("category", category)
    const qs = p.toString()
    return `/store/${slug}/products${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Shop</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">All Products</h1>
          </div>
          <p className="text-sm text-muted-foreground tabular-nums">
            {count ? `${count} product${count !== 1 ? "s" : ""}` : "Browse our collection"}
          </p>
        </div>

        {/* Category filter */}
        {categories && categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={filterUrl()}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                !category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={filterUrl(cat.slug)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  category === cat.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {products && products.length > 0 ? (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} storeSlug={slug} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={pageUrl(currentPage - 1)}>
                      <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={pageUrl(currentPage + 1)}>
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              {category ? "No products in this category." : "No products available yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({
  params,
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

  if (!tenant) return { title: "Products" }

  return {
    title: `All Products | ${tenant.name}`,
    description: `Browse all products at ${tenant.name}. Shop our full collection with free shipping on select items.`,
  }
}
