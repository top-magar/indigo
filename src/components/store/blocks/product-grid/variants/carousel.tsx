"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ArrowLeft01Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons"
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

interface CarouselGridProps {
  blockId: string
  settings: ProductGridBlock["settings"]
  products: Product[]
  storeSlug: string
  currency: string
}

export function CarouselGrid({ blockId, settings, products, storeSlug, currency }: CarouselGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const displayProducts = products.slice(0, settings.productsToShow)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
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
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => scroll("left")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll("right")}>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </Button>
            {settings.showViewAll && (
              <Button variant="ghost" asChild className="ml-2">
                <Link href={`/store/${storeSlug}/products`}>
                  View All
                  <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {displayProducts.map((product) => (
            <Card
              key={product.id}
              className="group w-[280px] flex-shrink-0 overflow-hidden"
              style={{ scrollSnapAlign: "start" }}
            >
              <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden">
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
                </div>
              </Link>
              <CardContent className="p-4">
                <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                  <h3 className="font-medium transition-colors group-hover:text-primary line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                {settings.showPrices && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-semibold">{formatPrice(product.price, currency)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.compareAtPrice, currency)}
                      </span>
                    )}
                  </div>
                )}
                {settings.showQuickAdd && (
                  <Button size="sm" className="mt-3 w-full">
                    <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
