import { createClient } from "@/infrastructure/supabase/server"
import { ProductCard } from "@/components/store/product-card"
import Link from "next/link"
import { storeHref } from "@/features/store/url"
import { ArrowRight, Truck, Shield, CreditCard } from "lucide-react"

interface DefaultHomepageProps {
  tenantId: string
  tenantName: string
  tenantDescription: string | null
  storeSlug: string
  heroTitle?: string
  heroSubtitle?: string
  heroCta?: string
  heroImageUrl?: string
}

export async function DefaultHomepage({
  tenantId, tenantName, tenantDescription, storeSlug,
  heroTitle, heroSubtitle, heroCta, heroImageUrl,
}: DefaultHomepageProps) {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products")
      .select("*, category:categories(id, name, slug)")
      .eq("tenant_id", tenantId).eq("status", "active")
      .order("created_at", { ascending: false }).limit(8),
    supabase.from("categories")
      .select("id, name, slug, image_url")
      .eq("tenant_id", tenantId).order("sort_order").limit(6),
  ])

  const hasProducts = products && products.length > 0
  const hasCategories = categories && categories.length > 1

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={heroImageUrl ? { backgroundImage: `url(${heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {heroImageUrl && <div className="absolute inset-0 bg-foreground/40" />}
        <div className={`relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-28 lg:px-8 ${heroImageUrl ? "text-white" : ""}`}>
          <div className="max-w-2xl">
            <h1 className="text-lg font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {heroTitle || tenantName}
            </h1>
            {(heroSubtitle || tenantDescription) && (
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {heroSubtitle || tenantDescription}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={storeHref(storeSlug, "/products")}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity"
              >
                {heroCta || "Shop Now"} <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Truck className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Fast Delivery</p>
                <p className="text-xs text-muted-foreground">Across Nepal via Pathao</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">Digital Wallets & Cards</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Buyer Protection</p>
                <p className="text-xs text-muted-foreground">Easy returns & refunds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {hasCategories && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-lg font-semibold tracking-tight">Shop by Category</h2>
            <Link href={storeHref(storeSlug, "/products")} className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {categories!.map((cat) => (
              <Link
                key={cat.id}
                href={storeHref(storeSlug, `/products?category=${cat.slug}`)}
                className="group rounded-xl border bg-card p-4 text-center transition-colors hover:border-foreground/20"
              >
                <div className="mx-auto mb-3 size-12 rounded-full bg-muted flex items-center justify-center text-lg">
                  {cat.name.charAt(0)}
                </div>
                <p className="text-sm font-medium group-hover:text-foreground">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {hasProducts && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">New Arrivals</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Featured Products</h2>
            </div>
            <Link href={storeHref(storeSlug, "/products")} className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products!.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!hasProducts && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-medium">Coming soon</p>
          <p className="mt-2 text-muted-foreground">We&apos;re adding products. Check back shortly!</p>
        </section>
      )}
    </div>
  )
}
