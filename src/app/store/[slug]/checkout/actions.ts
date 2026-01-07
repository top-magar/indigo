"use server"

import { z } from "zod"
import { updateCart, completeCart, retrieveCart } from "@/features/store/data/cart"
import { redirect } from "next/navigation"

/**
 * Checkout form validation schema
 * Error messages explain what's wrong AND how to fix it
 */
const checkoutSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required — we'll send your order confirmation here")
    .email("Invalid email format — please enter a valid email like name@example.com"),
  name: z
    .string()
    .min(2, "Name is too short — please enter your full name (at least 2 characters)"),
  address: z
    .string()
    .min(5, "Address is too short — please enter your complete street address"),
  city: z
    .string()
    .min(2, "City name is too short — please enter a valid city name"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z
    .string()
    .min(2, "Country is required — please select or enter your country"),
  phone: z.string().optional(),
})

export interface CheckoutState {
  errors?: {
    email?: string[]
    name?: string[]
    address?: string[]
    city?: string[]
    state?: string[]
    postalCode?: string[]
    country?: string[]
    phone?: string[]
    _form?: string[]
  }
  success?: boolean
}

/**
 * Response type for createPaymentIntent action
 */
export interface PaymentIntentResponse {
  success: boolean
  clientSecret?: string
  orderId?: string
  amount?: string
  currency?: string
  error?: string
  code?: string
}

/**
 * Server Action for creating a Stripe PaymentIntent
 * 
 * This action calls the checkout API to create a PaymentIntent
 * and returns the client secret for use with Stripe Elements.
 * 
 * @param tenantId - The tenant ID
 * @param storeSlug - The store slug
 * @param customerInfo - Optional customer information
 */
export async function createPaymentIntent(
  tenantId: string,
  storeSlug: string,
  customerInfo?: {
    email?: string
    customerName?: string
    customerPhone?: string
    shippingAddress?: string
    shippingCity?: string
    shippingArea?: string
    shippingPostalCode?: string
    shippingCountry?: string
  }
): Promise<PaymentIntentResponse> {
  try {
    // Get the base URL for the API call
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/store/${storeSlug}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerInfo || {}),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to create payment intent",
        code: data.code,
      }
    }

    return {
      success: true,
      clientSecret: data.data.clientSecret,
      orderId: data.data.orderId,
      amount: data.data.amount,
      currency: data.data.currency,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return {
      success: false,
      error: "Failed to initialize payment. Please try again.",
    }
  }
}

/**
 * Server Action for processing checkout (non-Stripe fallback)
 * Uses useActionState pattern for proper validation and error handling
 * 
 * @see https://nextjs.org/docs/app/guides/forms#form-validation
 */
export async function processCheckout(
  tenantId: string,
  storeSlug: string,
  prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  // Extract form data
  const rawData = {
    email: formData.get("email"),
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    phone: formData.get("phone"),
  }

  // Validate form data
  const validatedFields = checkoutSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, name, address, city, state, postalCode, country, phone } = validatedFields.data

  // Check cart exists
  const cart = await retrieveCart(tenantId)
  if (!cart || cart.items.length === 0) {
    return {
      errors: {
        _form: ["Your cart is empty. Please add items before checkout."],
      },
    }
  }

  // Update cart with customer info
  // Address fields are stored as JSON strings in the database
  const updateResult = await updateCart(tenantId, {
    email,
    shippingAddress: JSON.stringify({
      name,
      address_line1: address,
      city,
      state: state || "",
      postal_code: postalCode || "",
      country,
      phone: phone || "",
    }),
    billingAddress: JSON.stringify({
      name,
      address_line1: address,
      city,
      state: state || "",
      postal_code: postalCode || "",
      country,
      phone: phone || "",
    }),
  })

  if (!updateResult.success) {
    return {
      errors: {
        _form: [updateResult.error || "Failed to update shipping information"],
      },
    }
  }

  // Complete the cart (convert to order)
  const result = await completeCart(tenantId, storeSlug)

  if (!result.success) {
    return {
      errors: {
        _form: [result.error || "Failed to place order. Please try again."],
      },
    }
  }

  // Redirect to confirmation page
  redirect(`/store/${storeSlug}/order-confirmation?order=${result.orderNumber}`)
}
