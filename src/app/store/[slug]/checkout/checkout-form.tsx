"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Price } from "@/components/ui/price"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, Loader2, Banknote, Building2, Wallet, Gift, Truck } from "lucide-react"
import { toast } from "sonner"
import { validateGiftCard } from "./actions"
import type { Cart } from "@/features/store/data/cart"

interface ShippingZone {
  id: string; name: string; regions: string[]
  rates: { price: number; name: string }[]
}

interface CheckoutFormProps {
  tenantId: string
  slug: string
  cart: Cart
  currency?: string
  taxRate?: number
  taxName?: string
  priceIncludesTax?: boolean
  showTaxInCart?: boolean
  shippingZones?: ShippingZone[]
  freeShippingThreshold?: number | null
}

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery", icon: Banknote, description: "Pay when you receive your order" },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2, description: "Transfer to our bank account" },
  { value: "esewa", label: "eSewa", icon: Wallet, description: "Pay with eSewa" },
  { value: "khalti", label: "Khalti", icon: Wallet, description: "Pay with Khalti" },
] as const

export function CheckoutForm({
  tenantId, slug, cart, currency = "NPR",
  taxRate = 0, taxName = "Tax", priceIncludesTax = false, showTaxInCart = true,
  shippingZones = [], freeShippingThreshold = null,
}: CheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("cod")

  const [name, setName] = useState("")
  const [email, setEmail] = useState(cart.email || "")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState(cart.shippingAddress || "")
  const [city, setCity] = useState("")
  const [area, setArea] = useState("")

  const [giftCardCode, setGiftCardCode] = useState("")
  const [giftCardDiscount, setGiftCardDiscount] = useState(0)
  const [applyingGiftCard, setApplyingGiftCard] = useState(false)

  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discount = cart.discountTotal || 0

  // Shipping: match city to zone, check free threshold
  const shippingTotal = useMemo(() => {
    if (freeShippingThreshold && subtotal >= freeShippingThreshold) return 0
    if (!shippingZones.length) return 0
    const zone = shippingZones.find(z => z.regions.some(r => r.toLowerCase() === city.toLowerCase())) || shippingZones[0]
    return zone?.rates?.[0]?.price ?? 0
  }, [city, subtotal, shippingZones, freeShippingThreshold])

  // Tax
  const taxTotal = useMemo(() => {
    if (taxRate <= 0) return 0
    if (priceIncludesTax) return subtotal - (subtotal / (1 + taxRate / 100))
    return subtotal * (taxRate / 100)
  }, [subtotal, taxRate, priceIncludesTax])

  const total = subtotal - discount - giftCardDiscount + shippingTotal + (priceIncludesTax ? 0 : taxTotal)

  // Shipping info text
  const shippingLabel = useMemo(() => {
    if (freeShippingThreshold && subtotal >= freeShippingThreshold) return "Free shipping"
    if (!shippingZones.length) return null
    const zone = shippingZones.find(z => z.regions.some(r => r.toLowerCase() === city.toLowerCase()))
    return zone ? zone.name : shippingZones[0]?.name
  }, [city, subtotal, shippingZones, freeShippingThreshold])

  const applyGiftCard = async () => {
    if (!giftCardCode.trim()) return
    setApplyingGiftCard(true)
    try {
      const result = await validateGiftCard(giftCardCode, tenantId)
      if (result.valid) {
        const amount = Math.min(result.balance, subtotal - discount + shippingTotal + taxTotal)
        setGiftCardDiscount(amount)
        toast.success(`Gift card applied! -${currency} ${amount.toFixed(2)}`)
      } else {
        setGiftCardDiscount(0)
        toast.error(result.error)
      }
    } catch {
      toast.error("Failed to validate gift card.")
    } finally {
      setApplyingGiftCard(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Please enter your name"); return }
    if (!phone.trim()) { setError("Please enter your phone number"); return }
    if (!address.trim()) { setError("Please enter your delivery address"); return }
    if (!city.trim()) { setError("Please enter your city"); return }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/store/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name, email: email || undefined, customerPhone: phone,
          shippingAddress: address, shippingCity: city, shippingArea: area,
          shippingCountry: "Nepal", paymentMethod,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.data?.orderId) {
        setError(data.error?.message || "Checkout failed. Please try again.")
        setLoading(false)
        return
      }
      if (data.data.redirectUrl) {
        window.location.href = data.data.redirectUrl
        return
      }
      router.push(`/store/${slug}/order-confirmation?order=${data.data.orderNumber}`)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="name">Full Name *</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required /></div>
              <div><Label htmlFor="phone">Phone *</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" required /></div>
            </div>
            <div><Label htmlFor="email">Email (optional)</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Delivery Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="address">Address *</Label><Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" required /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="city">City *</Label><Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kathmandu" required /></div>
              <div><Label htmlFor="area">Area</Label><Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Thamel, Baneshwor..." /></div>
            </div>
            {shippingLabel && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="size-3.5" />
                {shippingTotal === 0 ? "Free shipping!" : `${shippingLabel} — ${currency} ${shippingTotal}`}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.value} className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${paymentMethod === m.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                  <RadioGroupItem value={m.value} />
                  <m.icon className="size-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.description}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Gift className="size-5" />Gift Card</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="Enter gift card code" value={giftCardCode} onChange={(e) => setGiftCardCode(e.target.value)} />
              <Button type="button" variant="outline" onClick={applyGiftCard} disabled={applyingGiftCard || !giftCardCode.trim()}>
                {applyingGiftCard ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Order Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.productName} × {item.quantity}</span>
                <Price amount={item.unitPrice * item.quantity} currency={currency} />
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm"><span>Subtotal</span><Price amount={subtotal} currency={currency} /></div>
            {discount > 0 && <div className="flex justify-between text-sm text-success"><span>Discount</span><span>-<Price amount={discount} currency={currency} /></span></div>}
            {giftCardDiscount > 0 && <div className="flex justify-between text-sm text-success"><span>Gift Card</span><span>-<Price amount={giftCardDiscount} currency={currency} /></span></div>}
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              {shippingTotal === 0 ? <span className="text-success">Free</span> : <Price amount={shippingTotal} currency={currency} />}
            </div>
            {showTaxInCart && taxTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span>{taxName}{priceIncludesTax ? " (included)" : ""}</span>
                <Price amount={Math.round(taxTotal * 100) / 100} currency={currency} />
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold"><span>Total</span><Price amount={total} currency={currency} /></div>
          </CardContent>
        </Card>

        {error && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Placing Order...</> : `Place Order — ${currency} ${total.toFixed(2)}`}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {paymentMethod === "cod" && "You will pay when your order is delivered."}
          {paymentMethod === "bank_transfer" && "Bank transfer details will be shown after placing the order."}
        </p>
      </div>
    </form>
  )
}
