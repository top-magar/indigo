/**
 * Server-side cart data layer
 * Inspired by Medusa's cart management pattern
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"
import { getCartId, setCartId, removeCartId, getCacheTag } from "./cookies"

// Types
export interface CartItem {
  id: string
  productId: string
  variantId: string | null
  productName: string
  productSku: string | null
  productImage: string | null
  unitPrice: number
  compareAtPrice: number | null
  quantity: number
  subtotal: number
}

export interface Cart {
  id: string
  tenantId: string
  customerId: string | null
  email: string | null
  items: CartItem[]
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  currency: string
  shippingAddress: Record<string, unknown> | null
  billingAddress: Record<string, unknown> | null
  status: "active" | "completed" | "abandoned"
  createdAt: string
  updatedAt: string
}

/**
 * Retrieve cart by ID with items
 */
export async function retrieveCart(tenantId: string, cartId?: string): Promise<Cart | null> {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  try {
    const supabase = await createClient()

    // Fetch cart
    const { data: cartData, error: cartError } = await supabase
      .from("carts")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .single()

    if (cartError || !cartData) {
      return null
    }

    // Fetch cart items
    const { data: itemsData } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", id)
      .order("created_at", { ascending: true })

    const items: CartItem[] = (itemsData || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id,
      productName: item.product_name,
      productSku: item.product_sku,
      productImage: item.product_image,
      unitPrice: Number(item.unit_price),
      compareAtPrice: item.compare_at_price ? Number(item.compare_at_price) : null,
      quantity: item.quantity,
      subtotal: Number(item.unit_price) * item.quantity,
    }))

    return {
      id: cartData.id,
      tenantId: cartData.tenant_id,
      customerId: cartData.customer_id,
      email: cartData.email,
      items,
      subtotal: Number(cartData.subtotal || 0),
      discountTotal: Number(cartData.discount_total || 0),
      shippingTotal: Number(cartData.shipping_total || 0),
      taxTotal: Number(cartData.tax_total || 0),
      total: Number(cartData.total || 0),
      currency: cartData.currency || "USD",
      shippingAddress: cartData.shipping_address as Record<string, unknown> | null,
      billingAddress: cartData.billing_address as Record<string, unknown> | null,
      status: cartData.status as "active" | "completed" | "abandoned",
      createdAt: cartData.created_at,
      updatedAt: cartData.updated_at,
    }
  } catch (error) {
    console.error("Error retrieving cart:", error)
    return null
  }
}

/**
 * Get or create cart for tenant
 */
export async function getOrCreateCart(tenantId: string, currency = "USD"): Promise<Cart> {
  // Try to get existing cart
  let cart = await retrieveCart(tenantId)

  if (cart) {
    return cart
  }

  // Create new cart
  const supabase = await createClient()

  const { data: newCart, error } = await supabase
    .from("carts")
    .insert({
      tenant_id: tenantId,
      currency,
      status: "active",
    })
    .select()
    .single()

  if (error || !newCart) {
    throw new Error("Failed to create cart")
  }

  await setCartId(newCart.id)

  // Revalidate cache
  const cacheTag = await getCacheTag("carts", tenantId)
  revalidateTag(cacheTag, "max")

  return {
    id: newCart.id,
    tenantId,
    customerId: null,
    email: null,
    items: [],
    subtotal: 0,
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 0,
    total: 0,
    currency,
    shippingAddress: null,
    billingAddress: null,
    status: "active",
    createdAt: newCart.created_at,
    updatedAt: newCart.updated_at,
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  tenantId: string,
  productId: string,
  quantity: number,
  options?: {
    variantId?: string
    productName: string
    productSku?: string
    productImage?: string
    unitPrice: number
    compareAtPrice?: number
  }
): Promise<{ success: boolean; error?: string }> {
  if (!options) {
    return { success: false, error: "Product details required" }
  }

  try {
    const cart = await getOrCreateCart(tenantId)
    const supabase = await createClient()

    // Check if item already exists
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .eq("variant_id", options.variantId || null)
      .maybeSingle()

    if (existing) {
      // Update quantity
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
    } else {
      // Insert new item
      await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: productId,
        variant_id: options.variantId || null,
        product_name: options.productName,
        product_sku: options.productSku || null,
        product_image: options.productImage || null,
        unit_price: options.unitPrice,
        compare_at_price: options.compareAtPrice || null,
        quantity,
      })
    }

    // Update cart totals
    await recalculateCartTotals(cart.id)

    // Revalidate cache
    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, "max")

    return { success: true }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return { success: false, error: "Failed to add item to cart" }
  }
}

/**
 * Recalculate cart totals
 */
async function recalculateCartTotals(cartId: string): Promise<void> {
  const supabase = await createClient()

  // Get all items
  const { data: items } = await supabase
    .from("cart_items")
    .select("unit_price, quantity")
    .eq("cart_id", cartId)

  const subtotal = (items || []).reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  )

  // Update cart
  await supabase
    .from("carts")
    .update({
      subtotal,
      total: subtotal, // For now, total = subtotal (no shipping/tax/discounts)
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartId)
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  tenantId: string,
  itemId: string,
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get cart ID from item
    const { data: item } = await supabase
      .from("cart_items")
      .select("cart_id")
      .eq("id", itemId)
      .single()

    if (!item) {
      return { success: false, error: "Item not found" }
    }

    if (quantity <= 0) {
      await supabase.from("cart_items").delete().eq("id", itemId)
    } else {
      await supabase
        .from("cart_items")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("id", itemId)
    }

    // Recalculate totals
    await recalculateCartTotals(item.cart_id)

    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, "max")

    return { success: true }
  } catch (error) {
    console.error("Error updating cart item:", error)
    return { success: false, error: "Failed to update cart item" }
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  tenantId: string,
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  return updateCartItem(tenantId, itemId, 0)
}

/**
 * Update cart (addresses, email, etc.)
 */
export async function updateCart(
  tenantId: string,
  data: {
    email?: string
    shippingAddress?: Record<string, unknown>
    billingAddress?: Record<string, unknown>
    shippingMethodId?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { success: false, error: "No cart found" }
  }

  try {
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (data.email !== undefined) {
      updateData.email = data.email
    }
    if (data.shippingAddress !== undefined) {
      updateData.shipping_address = data.shippingAddress
    }
    if (data.billingAddress !== undefined) {
      updateData.billing_address = data.billingAddress
    }
    if (data.shippingMethodId !== undefined) {
      updateData.shipping_method_id = data.shippingMethodId
    }

    await supabase.from("carts").update(updateData).eq("id", cartId)

    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, "max")

    return { success: true }
  } catch (error) {
    console.error("Error updating cart:", error)
    return { success: false, error: "Failed to update cart" }
  }
}

/**
 * Clear cart (remove all items)
 */
export async function clearCart(tenantId: string): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { success: true } // No cart to clear
  }

  try {
    const supabase = await createClient()

    await supabase.from("cart_items").delete().eq("cart_id", cartId)

    // Reset totals
    await supabase
      .from("carts")
      .update({
        subtotal: 0,
        total: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartId)

    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, "max")

    return { success: true }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return { success: false, error: "Failed to clear cart" }
  }
}

/**
 * Complete cart (convert to order)
 */
export async function completeCart(
  tenantId: string,
  _storeSlug: string
): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { success: false, error: "No cart found" }
  }

  try {
    const supabase = await createClient()

    // Get cart with items
    const cart = await retrieveCart(tenantId, cartId)

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Cart is empty" }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        tenant_id: tenantId,
        order_number: orderNumber,
        status: "pending",
        customer_email: cart.email,
        shipping_address: cart.shippingAddress,
        billing_address: cart.billingAddress,
        subtotal: cart.subtotal,
        total_amount: cart.total,
        currency: cart.currency,
      })
      .select("id, order_number")
      .single()

    if (orderError || !order) {
      throw new Error("Failed to create order")
    }

    // Create order items
    for (const item of cart.items) {
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        product_sku: item.productSku,
        product_image: item.productImage,
        unit_price: item.unitPrice,
        quantity: item.quantity,
      })
    }

    // Mark cart as completed
    await supabase
      .from("carts")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", cartId)

    // Remove cart cookie
    await removeCartId()

    // Revalidate caches
    const cartCacheTag = await getCacheTag("carts", tenantId)
    const orderCacheTag = await getCacheTag("orders", tenantId)
    revalidateTag(cartCacheTag, "max")
    revalidateTag(orderCacheTag, "max")

    return { success: true, orderId: order.id, orderNumber: order.order_number }
  } catch (error) {
    console.error("Error completing cart:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to complete order" }
  }
}

/**
 * Transfer anonymous cart to customer on login
 */
export async function transferCart(
  tenantId: string,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { success: true } // No cart to transfer
  }

  try {
    const supabase = await createClient()

    await supabase
      .from("carts")
      .update({
        customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartId)

    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, "max")

    return { success: true }
  } catch (error) {
    console.error("Error transferring cart:", error)
    return { success: false, error: "Failed to transfer cart" }
  }
}
