import Link from "next/link"
import { ArrowRight, ShoppingBag, Star, Quote, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SectionConfig } from "@/features/store/section-registry"
import { listProducts, type StoreProduct } from "@/features/store/data/products"
import { listCategories, type StoreCategory } from "@/features/store/data/categories"

interface RenderProps {
  sections: SectionConfig[]
  tenantId: string
  storeSlug: string
  storeName: string
  primaryColor: string
}

export async function SectionRenderer({ sections, tenantId, storeSlug, storeName, primaryColor }: RenderProps) {
  // Pre-fetch data needed by sections
  const needsProducts = sections.some(s => s.type === "product-grid" && s.visible)
  const needsCategories = sections.some(s => s.type === "categories" && s.visible)

  const [products, categories] = await Promise.all([
    needsProducts ? listProducts(tenantId, { limit: 12 }).then(r => r.products) : Promise.resolve([]),
    needsCategories ? listCategories(tenantId) : Promise.resolve([]),
  ])

  return (
    <>
      {sections.filter(s => s.visible).sort((a, b) => a.order - b.order).map((section) => (
        <RenderSection key={section.id} section={section} products={products} categories={categories}
          storeSlug={storeSlug} storeName={storeName} primaryColor={primaryColor} />
      ))}
    </>
  )
}

function RenderSection({ section, products, categories, storeSlug, storeName, primaryColor }: {
  section: SectionConfig; products: StoreProduct[]; categories: StoreCategory[]
  storeSlug: string; storeName: string; primaryColor: string
}) {
  const c = section.content
  const href = (path: string) => `/store/${storeSlug}${path}`

  switch (section.type) {
    // ── ANNOUNCEMENT ──
    case "announcement":
      if (!c.text) return null
      return (
        <div className="text-center py-2 px-4 text-sm font-medium" style={{ backgroundColor: primaryColor, color: "#fff" }}>
          {c.text}
        </div>
      )

    // ── HERO ──
    case "hero": {
      const title = c.title || storeName
      const subtitle = c.subtitle || ""
      const cta = c.cta || "Shop Now"
      const imageUrl = c.imageUrl

      if (section.variant === "hero-split") {
        return (
          <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
              <Button asChild size="lg" className="mt-8" style={{ backgroundColor: primaryColor }}>
                <Link href={href("/products")}>{cta} <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
            </div>
            {imageUrl && (
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
          </section>
        )
      }

      if (section.variant === "hero-minimal") {
        return (
          <section className="max-w-3xl mx-auto px-4 py-20 sm:py-32 text-center">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-6 text-xl text-muted-foreground max-w-xl mx-auto">{subtitle}</p>}
            <Button asChild size="lg" className="mt-10" style={{ backgroundColor: primaryColor }}>
              <Link href={href("/products")}>{cta}</Link>
            </Button>
          </section>
        )
      }

      // Default: hero-fullwidth
      return (
        <section className="relative overflow-hidden" style={imageUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundColor: primaryColor }}>
          <div className="max-w-7xl mx-auto px-4 py-24 sm:py-36 text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-2xl">{title}</h1>
            {subtitle && <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl">{subtitle}</p>}
            <Button asChild size="lg" className="mt-10 bg-white text-black hover:bg-white/90">
              <Link href={href("/products")}>{cta} <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </div>
        </section>
      )
    }

    // ── PRODUCTS ──
    case "product-grid": {
      const title = c.title || "Featured Products"
      const limit = Math.min(Number(c.limit) || 8, products.length)
      const items = products.slice(0, limit)
      if (items.length === 0) return null

      const cols = section.variant === "products-grid-4" ? "sm:grid-cols-2 lg:grid-cols-4"
        : section.variant === "products-carousel" ? "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4"
        : "sm:grid-cols-2 lg:grid-cols-3"
      const isCarousel = section.variant === "products-carousel"

      return (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
            <Link href={href("/products")} className="text-sm font-medium hover:underline" style={{ color: primaryColor }}>
              View all <ArrowRight className="inline size-3.5 ml-1" />
            </Link>
          </div>
          <div className={isCarousel ? cols : `grid ${cols} gap-6`}>
            {items.map((p) => (
              <Link key={p.id} href={href(`/products/${p.slug}`)}
                className={`group block ${isCarousel ? "min-w-[260px] snap-start" : ""}`}>
                <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="size-8 text-muted-foreground/30" /></div>
                  )}
                </div>
                <h3 className="font-medium text-sm truncate">{p.name}</h3>
                <p className="text-sm mt-0.5" style={{ color: primaryColor }}>Rs {p.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </section>
      )
    }

    // ── CATEGORIES ──
    case "categories": {
      const title = c.title || "Shop by Category"
      if (categories.length === 0) return null

      if (section.variant === "categories-full-bg") {
        return (
          <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">{title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat.id} href={href(`/category/${cat.slug}`)}
                  className="relative h-48 rounded-xl overflow-hidden bg-muted group">
                  {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-white/70">{cat.productCount} products</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      }

      // Default: categories-cards
      return (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">{title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} href={href(`/category/${cat.slug}`)}
                className="rounded-xl border p-4 text-center hover:border-primary/30 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                  <ShoppingBag className="size-5" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-medium text-sm">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{cat.productCount} products</p>
              </Link>
            ))}
          </div>
        </section>
      )
    }

    // ── BANNER ──
    case "banner": {
      const title = c.title || ""
      if (!title) return null

      if (section.variant === "banner-split") {
        return (
          <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
            <div className="rounded-2xl overflow-hidden grid md:grid-cols-2" style={{ backgroundColor: `${primaryColor}10` }}>
              {c.imageUrl && <img src={c.imageUrl} alt={title} className="w-full h-64 md:h-auto object-cover" />}
              <div className="p-8 sm:p-12 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
                {c.subtitle && <p className="mt-3 text-muted-foreground">{c.subtitle}</p>}
                {c.cta && (
                  <Button asChild className="mt-6 w-fit" style={{ backgroundColor: primaryColor }}>
                    <Link href={c.ctaUrl || href("/products")}>{c.cta}</Link>
                  </Button>
                )}
              </div>
            </div>
          </section>
        )
      }

      // Default: banner-cta
      return (
        <section className="py-12 sm:py-16" style={{ backgroundColor: primaryColor }}>
          <div className="max-w-3xl mx-auto px-4 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
            {c.subtitle && <p className="mt-3 text-white/80">{c.subtitle}</p>}
            {c.cta && (
              <Button asChild className="mt-6 bg-white text-black hover:bg-white/90">
                <Link href={c.ctaUrl || href("/products")}>{c.cta}</Link>
              </Button>
            )}
          </div>
        </section>
      )
    }

    // ── TESTIMONIALS ──
    case "testimonials": {
      const title = c.title || "What Our Customers Say"
      // Placeholder testimonials — in production, these would come from the reviews table
      const reviews = [
        { name: "Sita R.", text: "Amazing quality and fast delivery!", rating: 5 },
        { name: "Rajesh K.", text: "Best online shopping experience in Nepal.", rating: 5 },
        { name: "Anita S.", text: "Great products at affordable prices.", rating: 4 },
      ]

      return (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">{title}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-xl border p-6">
                <Quote className="size-5 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">{r.text}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="size-8 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: primaryColor }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="size-3 fill-yellow-400 text-yellow-400" />)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )
    }

    // Header and Footer are handled by the layout, not the section renderer
    case "header":
    case "footer":
      return null

    default:
      return null
  }
}
