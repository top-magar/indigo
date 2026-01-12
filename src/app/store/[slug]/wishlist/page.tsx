"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/infrastructure/supabase/client"
import { useCart } from "@/features/store/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Price } from "@/components/ui/price"
import {
  Heart,
  ShoppingCart,
  Trash2,
  ImageIcon,
  Loader2,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/infrastructure/supabase/types"

// Wishlist storage key per store
function getWishlistKey(storeSlug: string) {
  return `wishlist_${storeSlug}`
}

// Get wishlist from localStorage
function getWishlist(storeSlug: string): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(getWishlistKey(storeSlug))
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save wishlist to localStorage
function saveWishlist(storeSlug: string, productIds: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(getWishlistKey(storeSlug), JSON.stringify(productIds))
}

// Add to wishlist
export function addToWishlist(storeSlug: string, productId: string) {
  const wishlist = getWishlist(storeSlug)
  if (!wishlist.includes(productId)) {
    saveWishlist(storeSlug, [...wishlist, productId])
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { storeSlug } }))
  }
}

// Remove from wishlist
export function removeFromWishlist(storeSlug: string, productId: string) {
  const wishlist = getWishlist(storeSlug)
  saveWishlist(storeSlug, wishlist.filter((id) => id !== productId))
  window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { storeSlug } }))
}

// Check if product is in wishlist
export function isInWishlist(storeSlug: string, productId: string): boolean {
  return getWishlist(storeSlug).includes(productId)
}

function WishlistItemSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="aspect-square w-full sm:w-40" />
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>
    </Card>
  )
}

interface WishlistItemProps {
  product: Product
  storeSlug: string
  currency?: string
  onRemove: (productId: string) => void
}

function WishlistItem({ product, storeSlug, currency = "NPR", onRemove }: WishlistItemProps) {
  const { addItem, isPending } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const productUrl = `/store/${storeSlug}/products/${product.slug}`
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  const handleAddToCart = async () => {
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

  const handleRemove = () => {
    setIsRemoving(true)
    onRemove(product.id)
    toast.success(`${product.name} removed from wishlist`)
  }

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Product Image */}
        <Link href={productUrl} className="relative aspect-square w-full sm:w-40 shrink-0">
          <div className="relative h-full w-full overflow-hidden bg-muted">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0].url || "/placeholder.svg"}
                alt={product.images[0].alt || product.name}
                fill
                sizes="(max-width: 640px) 100vw, 160px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            {hasDiscount && (
              <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
                Sale
              </span>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <CardContent className="flex flex-1 flex-col justify-between p-4">
          <div>
            <Link href={productUrl}>
              <h3 className="font-medium hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            {product.category && (
              <p className="mt-1 text-sm text-muted-foreground">{product.category.name}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Price 
                amount={product.price} 
                currency={currency}
                originalAmount={hasDiscount && product.compare_at_price ? product.compare_at_price : undefined}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAdding || isPending}
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove from wishlist</span>
            </Button>
            <Button variant="ghost" size="sm" asChild className="ml-auto">
              <Link href={productUrl}>
                View Details
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export default function WishlistPage() {
  const params = useParams()
  const slug = params.slug as string

  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  // Fetch wishlist products
  const fetchWishlistProducts = useCallback(async () => {
    const ids = getWishlist(slug)
    setWishlistIds(ids)

    if (ids.length === 0) {
      setProducts([])
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    const { data } = await supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .in("id", ids)
      .eq("status", "active")

    // Maintain wishlist order
    const productMap = new Map((data || []).map((p) => [p.id, p]))
    const orderedProducts = ids
      .map((id) => productMap.get(id))
      .filter((p): p is Product => p !== undefined)

    setProducts(orderedProducts)
    setIsLoading(false)
  }, [slug])

  // Initial fetch
  useEffect(() => {
    fetchWishlistProducts()
  }, [fetchWishlistProducts])

  // Listen for wishlist updates from other components
  useEffect(() => {
    const handleWishlistUpdate = (e: CustomEvent<{ storeSlug: string }>) => {
      if (e.detail.storeSlug === slug) {
        fetchWishlistProducts()
      }
    }

    window.addEventListener("wishlist-updated", handleWishlistUpdate as EventListener)
    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdate as EventListener)
    }
  }, [slug, fetchWishlistProducts])

  const handleRemoveItem = (productId: string) => {
    removeFromWishlist(slug, productId)
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    setWishlistIds((prev) => prev.filter((id) => id !== productId))
  }

  const handleClearWishlist = () => {
    saveWishlist(slug, [])
    setProducts([])
    setWishlistIds([])
    toast.success("Wishlist cleared")
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { storeSlug: slug } }))
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="mt-1 text-muted-foreground">
              {isLoading
                ? "Loading..."
                : products.length === 0
                  ? "No saved items"
                  : `${products.length} saved item${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {products.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearWishlist}>
              Clear All
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <WishlistItemSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <WishlistItem
                  key={product.id}
                  product={product}
                  storeSlug={slug}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="rounded-full bg-muted flex items-center justify-center mb-4 h-16 w-16">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">
                Your wishlist is empty
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-base">
                Save items you love by clicking the heart icon on any product.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Button onClick={() => {
                  window.location.href = `/store/${slug}/products`
                }}>
                  Browse Products
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Continue Shopping */}
        {products.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href={`/store/${slug}/products`}>
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
