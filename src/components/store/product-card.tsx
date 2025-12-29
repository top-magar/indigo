"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/store/cart-provider"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingCart01Icon, Image01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
  storeSlug: string
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const { addItem, isPending } = useCart()
  const [isAdding, setIsAdding] = useState(false)

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

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/store/${storeSlug}/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url || "/placeholder.svg"}
              alt={product.images[0].alt || product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <HugeiconsIcon icon={Image01Icon} className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
              Sale
            </span>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/store/${storeSlug}/products/${product.slug}`}>
          <h3 className="font-medium hover:text-primary">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold">${Number(product.price).toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${Number(product.compare_at_price).toFixed(2)}
            </span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 w-full bg-transparent" 
          onClick={handleAddToCart}
          disabled={isAdding || isPending}
        >
          {isAdding ? (
            <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-4 w-4" />
          )}
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  )
}
