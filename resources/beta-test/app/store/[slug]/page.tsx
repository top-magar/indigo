import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/store/product-card"
import { ArrowRight } from "lucide-react"

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase.from("tenants").select("*").eq("slug", slug).single()

  if (!tenant) notFound()

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("tenant_id", tenant.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8)

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("tenant_id", tenant.id)
    .limit(4)

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative py-24"
        style={{
          background: `linear-gradient(135deg, ${tenant.primary_color}15 0%, ${tenant.secondary_color}15 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{tenant.name}</h1>
          {tenant.description && (
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">{tenant.description}</p>
          )}
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href={`/store/${slug}/products`}>
                Shop All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/store/${slug}/category/${category.slug}`}
                  className="group relative overflow-hidden rounded-xl border bg-muted/50 p-6 transition-colors hover:bg-muted"
                >
                  <h3 className="text-lg font-semibold group-hover:text-primary">{category.name}</h3>
                  <ArrowRight className="mt-2 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="border-t py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Button variant="ghost" asChild>
                <Link href={`/store/${slug}/products`}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} storeSlug={slug} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
