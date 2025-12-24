"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Tenant } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

interface CheckoutFormProps {
  tenant: Tenant
}

export function CheckoutForm({ tenant }: CheckoutFormProps) {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("US")
  const [phone, setPhone] = useState("")

  if (cart.items.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Add some products before checking out.</p>
        </div>
        <Button asChild>
          <Link href={`/store/${tenant.slug}/products`}>Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          items: cart.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productSku: item.product.sku,
            productImage: item.product.images?.[0]?.url,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
          customerEmail: email,
          customerName: `${firstName} ${lastName}`,
          shippingAddress: {
            first_name: firstName,
            last_name: lastName,
            address_line1: address,
            city,
            state,
            postal_code: postalCode,
            country,
            phone,
          },
          subtotal: cart.subtotal,
          total: cart.total,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Checkout failed")
      }

      const { orderId, orderNumber } = await response.json()

      clearCart()
      router.push(`/store/${tenant.slug}/order-confirmation?order=${orderNumber}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-2">
      {/* Customer Info */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="CA" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">ZIP code</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="94102"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.product.id} className="flex gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {item.product.images?.[0]?.url ? (
                    <Image
                      src={item.product.images[0].url || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>Calculated at next step</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Complete Order"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              This is a demo checkout. No real payment will be processed.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
