"use server"

import { z } from "zod"
import { updateCart, completeCart, retrieveCart } from "@/lib/data/cart"
import { redirect } from "next/navigation"

/**
 * Checkout form validation schema
 */
const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Please enter a valid country"),
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
 * Server Action for processing checkout
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
  const updateResult = await updateCart(tenantId, {
    email,
    shippingAddress: {
      name,
      address_line1: address,
      city,
      state: state || "",
      postal_code: postalCode || "",
      country,
      phone: phone || "",
    },
    billingAddress: {
      name,
      address_line1: address,
      city,
      state: state || "",
      postal_code: postalCode || "",
      country,
      phone: phone || "",
    },
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
