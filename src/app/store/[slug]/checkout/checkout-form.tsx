"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { loadStripe, type Stripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Price } from "@/components/ui/price"
import {
  AlertCircle,
  Ticket,
  X,
  CheckCircle,
  Loader2,
  CreditCard,
} from "lucide-react"
import type { Cart } from "@/features/store/data/cart"
import { applyVoucherToCart } from "@/features/store/data/discounts"
import { applyVoucherToCartData, removeVoucherFromCart } from "@/features/store/data/cart"
import { formatPrice } from "@/shared/currency"

// Initialize Stripe outside component to avoid recreating on each render
let stripePromise: Promise<Stripe | null> | null = null

function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set")
      return null
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

interface AppliedVoucher {
  code: string
  discountId: string
  voucherCodeId: string
  discountAmount: number
  discountType: string
  discountValue: number
  discountName: string
}

interface CustomerInfo {
  email: string
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

interface CheckoutFormProps {
  tenantId: string
  slug: string
  cart: Cart
  currency?: string
}

/**
 * Form field with error display
 */
function FormField({
  id,
  name,
  label,
  type = "text",
  required = false,
  value,
  onChange,
  error,
  disabled,
  ...props
}: {
  id: string
  name: string
  label: string
  type?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "size">) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? "border-destructive" : ""}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Inner payment form that uses Stripe hooks
 */
function PaymentForm({
  slug,
  total,
  customerInfo,
  onCustomerInfoChange,
  isCreatingIntent,
  paymentError,
}: {
  slug: string
  total: number
  customerInfo: CustomerInfo
  onCustomerInfoChange: (info: CustomerInfo) => void
  isCreatingIntent: boolean
  paymentError: string | null
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    // Validate required fields
    if (!customerInfo.email || !customerInfo.name || !customerInfo.address || !customerInfo.city || !customerInfo.country) {
      setError("Please fill in all required fields")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || "Payment validation failed")
        setIsProcessing(false)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/store/${slug}/order-confirmation`,
          payment_method_data: {
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone || undefined,
              address: {
                line1: customerInfo.address,
                city: customerInfo.city,
                state: customerInfo.state || undefined,
                postal_code: customerInfo.postalCode || undefined,
                country: customerInfo.country,
              },
            },
          },
        },
        redirect: "if_required",
      })

      if (confirmError) {
        setError(confirmError.message || "Payment failed. Please try again.")
        setIsProcessing(false)
        return
      }

      // Payment succeeded without redirect
      if (paymentIntent && paymentIntent.status === "succeeded") {
        router.push(`/store/${slug}/order-confirmation?payment_intent=${paymentIntent.id}`)
      }
    } catch (err) {
      console.error("Payment error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsProcessing(false)
    }
  }

  const displayError = error || paymentError

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="font-medium">Contact Information</h3>
        
        <FormField
          id="email"
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={customerInfo.email}
          onChange={(value) => onCustomerInfoChange({ ...customerInfo, email: value })}
          disabled={isProcessing || isCreatingIntent}
        />

        <FormField
          id="name"
          name="name"
          label="Full Name"
          required
          autoComplete="name"
          value={customerInfo.name}
          onChange={(value) => onCustomerInfoChange({ ...customerInfo, name: value })}
          disabled={isProcessing || isCreatingIntent}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Shipping Address</h3>

        <FormField
          id="address"
          name="address"
          label="Address"
          required
          autoComplete="street-address"
          value={customerInfo.address}
          onChange={(value) => onCustomerInfoChange({ ...customerInfo, address: value })}
          disabled={isProcessing || isCreatingIntent}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="city"
            name="city"
            label="City"
            required
            autoComplete="address-level2"
            value={customerInfo.city}
            onChange={(value) => onCustomerInfoChange({ ...customerInfo, city: value })}
            disabled={isProcessing || isCreatingIntent}
          />
          <FormField
            id="state"
            name="state"
            label="State"
            autoComplete="address-level1"
            value={customerInfo.state}
            onChange={(value) => onCustomerInfoChange({ ...customerInfo, state: value })}
            disabled={isProcessing || isCreatingIntent}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="postalCode"
            name="postalCode"
            label="Postal Code"
            autoComplete="postal-code"
            value={customerInfo.postalCode}
            onChange={(value) => onCustomerInfoChange({ ...customerInfo, postalCode: value })}
            disabled={isProcessing || isCreatingIntent}
          />
          <FormField
            id="country"
            name="country"
            label="Country"
            required
            autoComplete="country-name"
            value={customerInfo.country}
            onChange={(value) => onCustomerInfoChange({ ...customerInfo, country: value })}
            disabled={isProcessing || isCreatingIntent}
          />
        </div>

        <FormField
          id="phone"
          name="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={customerInfo.phone}
          onChange={(value) => onCustomerInfoChange({ ...customerInfo, phone: value })}
          disabled={isProcessing || isCreatingIntent}
        />
      </div>

      <Separator />

      {/* Payment Element */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Payment Details
        </h3>
        
        {isCreatingIntent ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
            <span className="ml-2 text-muted-foreground">Loading payment form...</span>
          </div>
        ) : (
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        )}
      </div>

      {/* Error Display */}
      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || !elements || isProcessing || isCreatingIntent}
      >
        {isProcessing ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Processing...
          </>
        ) : (
          `Pay $${total.toFixed(2)}`
        )}
      </Button>
    </form>
  )
}

/**
 * Main checkout form component with Stripe Elements
 */
export function CheckoutForm({ tenantId, slug, cart, currency = "NPR" }: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [stripeNotConfigured, setStripeNotConfigured] = useState(false)

  // Customer info state
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: "",
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  })

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("")
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null)

  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const discountAmount = appliedVoucher?.discountAmount || 0
  const total = Math.max(0, subtotal - discountAmount)

  // Create PaymentIntent when component mounts or total changes
  const createPaymentIntent = useCallback(async () => {
    if (total <= 0) return

    setIsCreatingIntent(true)
    setPaymentError(null)
    setStripeNotConfigured(false)

    try {
      const response = await fetch(`/api/store/${slug}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerInfo.email || undefined,
          customerName: customerInfo.name || undefined,
          customerPhone: customerInfo.phone || undefined,
          shippingAddress: customerInfo.address || undefined,
          shippingCity: customerInfo.city || undefined,
          shippingArea: customerInfo.state || undefined,
          shippingPostalCode: customerInfo.postalCode || undefined,
          shippingCountry: customerInfo.country || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === "STRIPE_NOT_CONFIGURED") {
          setStripeNotConfigured(true)
        } else {
          setPaymentError(data.error || "Failed to initialize payment")
        }
        return
      }

      setClientSecret(data.data.clientSecret)
    } catch (error) {
      console.error("Error creating payment intent:", error)
      setPaymentError("Failed to initialize payment. Please try again.")
    } finally {
      setIsCreatingIntent(false)
    }
  }, [slug, total, customerInfo])

  useEffect(() => {
    createPaymentIntent()
  }, []) // Only run on mount

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !tenantId) {
      setVoucherError("Please enter a voucher code")
      return
    }

    setVoucherError(null)
    setIsApplyingVoucher(true)

    try {
      const cartItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      }))

      const result = await applyVoucherToCart(tenantId, voucherCode.trim(), cartItems)

      if (result.valid && result.discountId && result.voucherCodeId) {
        await applyVoucherToCartData(
          tenantId,
          result.discountId,
          result.voucherCodeId,
          result.voucherCode || voucherCode.trim().toUpperCase(),
          result.discountAmount
        )

        setAppliedVoucher({
          code: result.voucherCode || voucherCode.trim().toUpperCase(),
          discountId: result.discountId,
          voucherCodeId: result.voucherCodeId,
          discountAmount: result.discountAmount,
          discountType: result.discountType || "percentage",
          discountValue: result.discountValue || 0,
          discountName: result.discountName || "Discount",
        })
        setVoucherCode("")
        
        // Recreate payment intent with new total
        createPaymentIntent()
      } else {
        setVoucherError(result.error || "Invalid voucher code")
      }
    } catch (error) {
      setVoucherError("Failed to apply voucher code")
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = async () => {
    if (tenantId) {
      await removeVoucherFromCart(tenantId)
    }
    setAppliedVoucher(null)
    setVoucherCode("")
    setVoucherError(null)
    
    // Recreate payment intent with original total
    createPaymentIntent()
  }

  // Show message if Stripe is not configured for this merchant
  if (stripeNotConfigured) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Not Available</AlertTitle>
            <AlertDescription>
              This store has not yet configured payment processing. Please contact the store owner
              or try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const stripePromise = getStripe()

  return (
    <div className="grid gap-8 lg:grid-cols-2">
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
              <Price amount={item.subtotal} currency={currency} />
            </div>
          ))}

          <Separator />

          {/* Voucher Input */}
          {appliedVoucher ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Voucher Applied</Label>
              <div className="flex items-center justify-between p-3 bg-[var(--ds-green-100)] border border-[var(--ds-green-200)] rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[var(--ds-green-700)]" />
                  <div>
                    <p className="font-medium text-[var(--ds-green-900)]">
                      {appliedVoucher.code}
                    </p>
                    <p className="text-sm text-[var(--ds-green-700)]">
                      {appliedVoucher.discountName}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveVoucher}
                  className="text-[var(--ds-green-800)] hover:text-[var(--ds-green-1000)] hover:bg-[var(--ds-green-200)]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="voucher-code" className="text-sm font-medium">
                Voucher Code
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  />
                  <Input
                    id="voucher-code"
                    placeholder="Enter code"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value.toUpperCase())
                      setVoucherError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleApplyVoucher()
                      }
                    }}
                    className="pl-9 uppercase"
                    disabled={isApplyingVoucher}
                  />
                </div>
                <Button
                  onClick={handleApplyVoucher}
                  disabled={isApplyingVoucher || !voucherCode.trim()}
                >
                  {isApplyingVoucher ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
              {voucherError && <p className="text-sm text-destructive">{voucherError}</p>}
            </div>
          )}

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <Price amount={subtotal} currency={currency} size="sm" />
            </div>
            {appliedVoucher && (
              <div className="flex justify-between text-sm text-[var(--ds-green-700)]">
                <span>Discount ({appliedVoucher.code})</span>
                <span>-{formatPrice(discountAmount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total</span>
              <Price amount={total} currency={currency} size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {clientSecret && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#0f172a",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <PaymentForm
                slug={slug}
                total={total}
                customerInfo={customerInfo}
                onCustomerInfoChange={setCustomerInfo}
                isCreatingIntent={isCreatingIntent}
                paymentError={paymentError}
              />
            </Elements>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Spinner className="h-8 w-8" />
              <p className="text-muted-foreground">Initializing payment...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
