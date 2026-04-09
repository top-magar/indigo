import { createClient } from "@/infrastructure/supabase/server"
import { ProductCard } from "@/components/store/product-card"
import Link from "next/link"
import { storeHref } from "@/features/store/url"
import { ArrowRight } from "lucide-react"

interface DefaultHomepageProps {
  tenantId: string
  tenantName: string
  tenantDescription: string | null
  storeSlug: string
}

export async function DefaultHomepage({ tenantId, tenantName, tenantDescription, storeSlug }: DefaultHomepageProps) {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8)

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("tenant_id", tenantId)
    .order("name")
    .limit(6)

  return (
    <div>
      {/* Hero — no generic icon, asymmetric layout, strong CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
              Welcome to
            </p>
            <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              {tenantName}
            </h1>
            {tenantDescription && (
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {tenantDescription}
              </p>
            )}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={storeHref(storeSlug, "/products")}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              {categories && categories.length > 0 && (
                <Link
                  href={storeHref(storeSlug, `/products?category=${categories[0].slug}`)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-accent"
                >
                  Browse {categories[0].name}
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* Subtle decorative element — not a generic gradient */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-primary/[0.03]" />
      </section>

      {/* Featured Products — with visual rhythm */}
      {products && products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b border-border/50 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Curated for you</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Featured Products</h2>
            </div>
            <Link
              href={storeHref(storeSlug, "/products")}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
