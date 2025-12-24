"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import type { Tenant } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react"

interface CartSheetProps {
  tenant: Tenant
  onClose: () => void
}

export function CartSheet({ tenant, onClose }: CartSheetProps) {
  const { cart, updateQuantity, removeFromCart } = useCart()

  if (cart.items.length === 0) {
    return (
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Your cart is empty</p>
          <Button asChild onClick={onClose}>
            <Link href={`/store/${tenant.slug}/products`}>Continue Shopping</Link>
          </Button>
        </div>
      </SheetContent>
    )
  }

  return (
    <SheetContent className="flex w-full flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart ({cart.items.length})</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                {item.product.images?.[0]?.url ? (
                  <Image
                    src={item.product.images[0].url || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">${Number(item.product.price).toFixed(2)}</p>
                <div className="mt-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SheetFooter className="border-t pt-4">
        <div className="w-full space-y-4">
          <div className="flex justify-between text-lg font-medium">
            <span>Subtotal</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <Button asChild className="w-full" size="lg" onClick={onClose}>
            <Link href={`/store/${tenant.slug}/checkout`}>Checkout</Link>
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={onClose} asChild>
            <Link href={`/store/${tenant.slug}/products`}>Continue Shopping</Link>
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  )
}
