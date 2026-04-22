"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { storeHref } from "@/features/store/url"
import type { Product } from "@/infrastructure/supabase/types"
import { Button } from "@/components/ui/button"
import { useCart } from "@/features/store/cart-provider"
import { ShoppingCart, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { HoverPrefetchLink } from "@/components/ui/prefetch-link"
import StarRating from "@/components/commerce-ui/star-rating-basic"
import PriceFormatSale from "@/components/commerce-ui/price-format-sale"

interface ProductCardProps {
  product: Product
  storeSlug: string
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const { addItem, isPending } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const productUrl = storeHref(storeSlug, `/products/${product.slug}`)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      const images = product.images || []
      await addItem(product.id, 1, {
        name: product.name,
        sku: product.sku || undefined,
        image: images[0]?.url || undefined,
        price: Number(product.price),
        compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
      })
      toast.success(`${product.name} added to cart`)
    } catch {
      toast.error("Failed to add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  // Mock rating until we add real ratings to the data model
  const rating = ((product as unknown as Record<string, unknown>).rating as number) ?? 0

  return (
    <div className="group">
      <HoverPrefetchLink href={productUrl}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted/50">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url || "/placeholder.svg"}
              alt={product.images[0].alt || product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
              Sale
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-3 pt-10 transition-transform duration-300 group-hover:translate-y-0">
            <Button
              variant="secondary"
             
              className="w-full backdrop-blur-sm"
              onClick={handleAddToCart}
              disabled={isAdding || isPending}
            >
              {isAdding ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </HoverPrefetchLink>

      <div className="mt-3 space-y-1">
        <HoverPrefetchLink href={productUrl}>
          <p className="text-sm font-medium leading-tight transition-colors group-hover:text-primary">
            {product.name}
          </p>
        </HoverPrefetchLink>

        {rating > 0 && (
          <div className="flex items-center gap-1">
            <StarRating value={rating} readOnly iconSize={12} />
            <span className="text-[10px] text-muted-foreground">{rating.toFixed(1)}</span>
          </div>
        )}

        {hasDiscount ? (
          <PriceFormatSale
            originalPrice={Number(product.compare_at_price)}
            salePrice={Number(product.price)}
            prefix="$"
            showSavePercentage={false}
            className="text-sm"
            classNameSalePrice="font-semibold tabular-nums"
            classNameOriginalPrice="text-xs text-muted-foreground/60 tabular-nums"
          />
        ) : (
          <span className="text-sm font-semibold tabular-nums">
            ${Number(product.price).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  )
}
