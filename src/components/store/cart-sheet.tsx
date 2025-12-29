"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/store/cart-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, MinusSignIcon, Delete02Icon, ShoppingCart01Icon, Loading03Icon } from "@hugeicons/core-free-icons"

interface CartSheetProps {
  storeSlug?: string
  children: React.ReactNode
}

export function CartSheet({ storeSlug, children }: CartSheetProps) {
  const { cart, isPending, updateItem, removeItem } = useCart()

  const slug = storeSlug || ""
  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Your Cart {items.length > 0 && `(${items.length})`}
            {isPending && <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon icon={ShoppingCart01Icon} className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Your cart is empty</p>
            {slug && (
              <Button asChild>
                <Link href={`/store/${slug}/products`}>Continue Shopping</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <HugeiconsIcon icon={ShoppingCart01Icon} className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.productName}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeItem(item.id)}
                          disabled={isPending}
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)}</p>
                      <div className="mt-auto flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          disabled={isPending}
                        >
                          <HugeiconsIcon icon={MinusSignIcon} className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={isPending}
                        >
                          <HugeiconsIcon icon={Add01Icon} className="h-3 w-3" />
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
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {slug && (
                  <>
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/store/${slug}/checkout`}>Checkout</Link>
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href={`/store/${slug}/products`}>Continue Shopping</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
