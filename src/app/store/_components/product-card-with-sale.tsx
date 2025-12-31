"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface ProductSale {
  saleId: string
  saleName: string
  type: "percentage" | "fixed"
  value: number
  salePrice: number
}

interface Product {
  id: string
  name: string
  price: number | string
  description?: string | null
  images?: { url: string; alt?: string }[] | null
  compareAtPrice?: number | string | null
}

interface ProductCardWithSaleProps {
  product: Product
  sale?: ProductSale | null
  currency?: string
  onAddToCart: (product: { id: string; name: string; price: number }) => void
}

export function ProductCardWithSale({
  product,
  sale,
  currency = "USD",
  onAddToCart,
}: ProductCardWithSaleProps) {
  const originalPrice = typeof product.price === "string" ? parseFloat(product.price) : product.price
  const compareAtPrice = product.compareAtPrice
    ? typeof product.compareAtPrice === "string"
      ? parseFloat(product.compareAtPrice)
      : product.compareAtPrice
    : null

  // Use sale price if available, otherwise original price
  const displayPrice = sale ? sale.salePrice : originalPrice
  const hasDiscount = sale || (compareAtPrice && compareAtPrice > originalPrice)
  const discountPercentage = sale
    ? sale.type === "percentage"
      ? sale.value
      : Math.round(((originalPrice - sale.salePrice) / originalPrice) * 100)
    : compareAtPrice
    ? Math.round(((compareAtPrice - originalPrice) / compareAtPrice) * 100)
    : 0

  const firstImage = product.images?.[0]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price)
  }

  return (
    <Card className="flex flex-col h-full group overflow-hidden">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.alt || product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {hasDiscount && discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
            -{discountPercentage}%
          </Badge>
        )}
        {sale && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            {sale.saleName}
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold">{formatPrice(displayPrice)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(sale ? originalPrice : compareAtPrice!)}
            </span>
          )}
        </div>
        {sale && (
          <p className="text-xs text-green-600 mt-1">
            You save {formatPrice(originalPrice - sale.salePrice)}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() =>
            onAddToCart({
              id: product.id,
              name: product.name,
              price: displayPrice,
            })
          }
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
