"use client"

import { useState } from "react"
import Image from "next/image"
import type { Product } from "@/infrastructure/supabase/types"
import { Button } from "@/components/ui/button"
import { useCart } from "@/features/store/cart-provider"
import { ProductCard } from "./product-card"
import { HugeiconsIcon } from "@hugeicons/react"
import { MinusSignIcon, Add01Icon, ShoppingCart01Icon, Image01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

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

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
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
                  <HugeiconsIcon icon={Image01Icon} className="h-24 w-24 text-muted-foreground" />
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
              <p className="text-sm text-muted-foreground">{(product.category as { name: string }).name}</p>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                {currency === "USD" ? "$" : currency} {Number(product.price).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ${Number(product.compare_at_price).toFixed(2)}
                </span>
              )}
            </div>

            {product.description && (
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>{product.description}</p>
              </div>
            )}

            <div className="space-y-4 border-t pt-6">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <HugeiconsIcon icon={MinusSignIcon} className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
                  </Button>
                </div>
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
                    <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {/* Additional Info */}
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
            <h2 className="text-2xl font-bold">Related Products</h2>
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
