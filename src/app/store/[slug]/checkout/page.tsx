"use client"

import { useState, useTransition } from "react"
import { useRouter, useParams } from "next/navigation"
import { useCart } from "@/lib/store/cart-provider"
import { completeCart, updateCart } from "@/lib/data/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function CheckoutPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { cart } = useCart()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cart) {
      toast.error("No cart found")
      return
    }

    startTransition(async () => {
      try {
        // Update cart with customer info
        await updateCart(cart.tenantId, {
          email: formData.email,
          shippingAddress: {
            name: formData.name,
            address_line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
          },
          billingAddress: {
            name: formData.name,
            address_line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
          },
        })

        // Complete the cart (convert to order)
        const result = await completeCart(cart.tenantId, slug)

        if (!result.success) {
          throw new Error(result.error || "Checkout failed")
        }

        toast.success("Order placed successfully!")
        router.push(`/store/${slug}/order-confirmation?order=${result.orderNumber}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to place order. Please try again.")
      }
    })
  }

  const items = cart?.items || []
  const total = cart?.total || 0

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

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Checkout</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" required value={formData.address} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" required value={formData.country} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                  {isPending ? (
                    <>
                      <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${total.toFixed(2)}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
