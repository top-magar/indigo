"use client"

import { useState } from "react"
import Image from "next/image"
import type { Product } from "@/infrastructure/supabase/types"
import { Button } from "@/components/ui/button"
import { useCart } from "@/features/store/cart-provider"
import { ProductCard } from "./product-card"
import { ShoppingCart, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import StarRating from "@/components/commerce-ui/star-rating-basic";
import PriceFormatSale from "@/components/commerce-ui/price-format-sale";
import QuantityInput from "@/components/commerce-ui/quantity-input-basic"

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
  storeSlug: string
  currency: string
}

export function ProductDetail({ product, relatedProducts, storeSlug, currency }: ProductDetailProps) {
  const { addItem, isPending } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      const images = product.images || []
      await addItem(product.id, quantity, {
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
  const images = product.images || []
  const prefix = currency === "USD" ? "$" : currency + " "
  const rating = ((product as unknown as Record<string, unknown>).rating as number) ?? 0

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Images — main + thumbnails */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]?.url || "/placeholder.svg"}
                  alt={images[selectedImage]?.alt || product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={selectedImage === 0}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {product.category && (
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {(product.category as { name: string }).name}
              </p>
            )}
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>

            {/* Star Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={rating} readOnly iconSize={18} />
                <span className="text-sm text-muted-foreground">{rating.toFixed(1)}</span>
              </div>
            )}

            {/* Price — using commerce-ui */}
            {hasDiscount ? (
              <PriceFormatSale
                originalPrice={Number(product.compare_at_price)}
                salePrice={Number(product.price)}
                prefix={prefix}
                showSavePercentage
                className="text-2xl"
                classNameSalePrice="text-3xl font-semibold"
                classNameOriginalPrice="text-xl text-muted-foreground"
              />
            ) : (
              <span className="text-3xl font-semibold tabular-nums">
                {prefix}{Number(product.price).toFixed(2)}
              </span>
            )}

            {product.description && (
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>{product.description}</p>
              </div>
            )}

            <div className="space-y-4 border-t pt-6">
              {/* Quantity — using commerce-ui */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity</span>
                <QuantityInput
                  quantity={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={product.track_quantity ? product.quantity : 99}
                />
              </div>

              {/* Stock Status */}
              {product.track_quantity && (
                <p className={`text-sm ${product.quantity > 0 ? "text-green-600" : "text-destructive"}`}>
                  {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                </p>
              )}

              {/* Add to Cart */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={(product.track_quantity && product.quantity <= 0 && !product.allow_backorder) || isAdding || isPending}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {product.sku && (
              <p className="text-sm text-muted-foreground">
                SKU: <span className="font-medium">{product.sku}</span>
              </p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t pt-16">
            <h2 className="text-2xl font-semibold">Related Products</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} storeSlug={storeSlug} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
