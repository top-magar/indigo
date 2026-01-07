"use client"

import { useParams } from "next/navigation"
import { useCart } from "@/features/store/cart-provider"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingCart01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { CheckoutForm } from "./checkout-form"

export default function CheckoutPage() {
  const params = useParams()
  const slug = params.slug as string
  const { cart, tenantId } = useCart()

  const items = cart?.items || []

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <HugeiconsIcon icon={ShoppingCart01Icon} className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add some products to checkout</p>
        <Button asChild>
          <Link href={`/store/${slug}/products`}>Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  if (!tenantId || !cart) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Checkout</h1>

        <div className="mt-8">
          <CheckoutForm tenantId={tenantId} slug={slug} cart={cart} />
        </div>
      </div>
    </div>
  )
}
