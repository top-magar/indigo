import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons"
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

interface ListViewProps {
  blockId: string
  settings: ProductGridBlock["settings"]
  products: Product[]
  storeSlug: string
  currency: string
}

export function ListView({ blockId, settings, products, storeSlug, currency }: ListViewProps) {
  const displayProducts = products.slice(0, settings.productsToShow)

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
                  <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* List */}
        <div className="space-y-4">
          {displayProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <Link
                  href={`/store/${storeSlug}/products/${product.slug}`}
                  className="relative aspect-square w-full sm:aspect-[4/3] sm:w-48 lg:w-64"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="absolute left-3 top-3 rounded-full bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
                      Sale
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
                  <div>
                    <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                      <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
                        {product.name}
                      </h3>
                    </Link>

                    {settings.showReviews && product.rating && (
                      <div className="mt-2 flex items-center gap-1">
                        <svg className="h-4 w-4 fill-chart-4 text-chart-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-sm text-muted-foreground">
                          {product.rating} ({product.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    {settings.showPrices && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xl font-bold">{formatPrice(product.price, currency)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-muted-foreground line-through">
                            {formatPrice(product.compareAtPrice, currency)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {settings.showQuickAdd && (
                    <div className="mt-4">
                      <Button>
                        <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
