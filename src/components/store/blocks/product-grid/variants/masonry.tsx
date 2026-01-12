import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
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

interface MasonryGridProps {
  blockId: string
  settings: ProductGridBlock["settings"]
  products: Product[]
  storeSlug: string
  currency: string
}

export function MasonryGrid({ blockId, settings, products, storeSlug, currency }: MasonryGridProps) {
  const displayProducts = products.slice(0, settings.productsToShow)

  // Create alternating heights for masonry effect
  const getAspectRatio = (index: number) => {
    const patterns = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]"]
    return patterns[index % patterns.length]
  }

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

        {/* Masonry Grid */}
        <div className="columns-2 gap-4 lg:columns-3 xl:columns-4">
          {displayProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/store/${storeSlug}/products/${product.slug}`}
              className="group mb-4 block break-inside-avoid overflow-hidden rounded-xl"
            >
              <div className={`relative ${getAspectRatio(index)} overflow-hidden`}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40" />

                {/* Sale badge */}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="absolute left-3 top-3 rounded-full bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
                    Sale
                  </span>
                )}

                {/* Content overlay */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-black/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="font-medium text-white">{product.name}</h3>
                  {settings.showPrices && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {formatPrice(product.price, currency)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-white/70 line-through">
                          {formatPrice(product.compareAtPrice, currency)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
