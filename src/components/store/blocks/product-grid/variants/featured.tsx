import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ShoppingCart } from "lucide-react"
import type { ProductGridBlock } from "@/types/blocks"
import type { Product } from "../index"
import { EditableText } from "../../editable-text"

// Simple price formatter
function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

interface FeaturedGridProps {
  blockId: string
  settings: ProductGridBlock["settings"]
  products: Product[]
  storeSlug: string
  currency: string
}

export function FeaturedGrid({ blockId, settings, products, storeSlug, currency }: FeaturedGridProps) {
  const [featured, ...rest] = products.slice(0, settings.productsToShow)
  const gridProducts = rest.slice(0, 4)

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(settings.sectionTitle || settings.showViewAll) && (
          <div className="mb-8 flex items-center justify-between">
            {settings.sectionTitle && (
              <EditableText
                blockId={blockId}
                fieldPath="sectionTitle"
                value={settings.sectionTitle}
                placeholder="Section title..."
                as="h2"
                className="text-2xl font-bold"
              />
            )}
            {settings.showViewAll && (
              <Button variant="ghost" asChild>
                <Link href={`/store/${storeSlug}/products`}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Featured + Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Featured Product */}
          {featured && (
            <Card className="group overflow-hidden">
              <Link href={`/store/${storeSlug}/products/${featured.slug}`}>
                <div className="relative aspect-square overflow-hidden lg:aspect-[4/5]">
                  <Image
                    src={featured.image}
                    alt={featured.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {featured.compareAtPrice && featured.compareAtPrice > featured.price && (
                    <span className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground">
                      Sale
                    </span>
                  )}
                </div>
              </Link>
              <CardContent className="p-6">
                <Link href={`/store/${storeSlug}/products/${featured.slug}`}>
                  <h3 className="text-xl font-semibold transition-colors group-hover:text-primary">
                    {featured.name}
                  </h3>
                </Link>
                {settings.showPrices && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold">{formatPrice(featured.price, currency)}</span>
                    {featured.compareAtPrice && featured.compareAtPrice > featured.price && (
                      <span className="text-muted-foreground line-through">
                        {formatPrice(featured.compareAtPrice, currency)}
                      </span>
                    )}
                  </div>
                )}
                {settings.showQuickAdd && (
                  <Button className="mt-4 w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grid of smaller products */}
          <div className="grid grid-cols-2 gap-4">
            {gridProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden">
                <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <CardContent className="p-3">
                  <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                    <h3 className="text-sm font-medium transition-colors group-hover:text-primary line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  {settings.showPrices && (
                    <p className="mt-1 font-semibold">{formatPrice(product.price, currency)}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
