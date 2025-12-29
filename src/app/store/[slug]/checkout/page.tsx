"use client"

import { useActionState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useCart } from "@/lib/store/cart-provider"
import { processCheckout, type CheckoutState } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SubmitButton } from "@/components/ui/submit-button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingCart01Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"

/**
 * Form field with error display
 */
function FormField({
  id,
  name,
  label,
  type = "text",
  required = false,
  errors,
  ...props
}: {
  id: string
  name: string
  label: string
  type?: string
  required?: boolean
  errors?: string[]
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-describedby={errors ? `${id}-error` : undefined}
        className={errors ? "border-destructive" : ""}
        {...props}
      />
      {errors && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {errors[0]}
        </p>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  const params = useParams()
  const slug = params.slug as string
  const { cart, tenantId } = useCart()

  // Bind tenantId and storeSlug to the action
  const boundAction = useMemo(() => {
    if (!tenantId) return null
    return processCheckout.bind(null, tenantId, slug)
  }, [tenantId, slug])

  const initialState: CheckoutState = { errors: undefined }
  const [state, formAction] = useActionState(
    boundAction || (async () => initialState),
    initialState
  )

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
              <form action={formAction} className="space-y-4">
                {/* Form-level errors */}
                {state?.errors?._form && (
                  <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{state.errors._form[0]}</span>
                  </div>
                )}

                <FormField
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  errors={state?.errors?.email}
                />

                <FormField
                  id="name"
                  name="name"
                  label="Full Name"
                  required
                  autoComplete="name"
                  errors={state?.errors?.name}
                />

                <FormField
                  id="address"
                  name="address"
                  label="Address"
                  required
                  autoComplete="street-address"
                  errors={state?.errors?.address}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    id="city"
                    name="city"
                    label="City"
                    required
                    autoComplete="address-level2"
                    errors={state?.errors?.city}
                  />
                  <FormField
                    id="state"
                    name="state"
                    label="State"
                    autoComplete="address-level1"
                    errors={state?.errors?.state}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    id="postalCode"
                    name="postalCode"
                    label="Postal Code"
                    autoComplete="postal-code"
                    errors={state?.errors?.postalCode}
                  />
                  <FormField
                    id="country"
                    name="country"
                    label="Country"
                    required
                    autoComplete="country-name"
                    errors={state?.errors?.country}
                  />
                </div>

                <FormField
                  id="phone"
                  name="phone"
                  label="Phone (optional)"
                  type="tel"
                  autoComplete="tel"
                  errors={state?.errors?.phone}
                />

                <SubmitButton className="w-full" size="lg" pendingText="Processing...">
                  Pay ${total.toFixed(2)}
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
