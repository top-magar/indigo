/**
 * Server-side cart data layer
 * Uses Drizzle ORM for type-safe database interactions
 * 
 * @deprecated Use cartRepository from @/lib/repositories instead
 * This file is kept for backward compatibility with existing code
 */
"use server"

import { revalidateTag } from "next/cache"
import { getCartId, setCartId, removeCartId, getCacheTag } from "@/features/store/data/cookies"
import { db } from "@/infrastructure/db"
import { carts, cartItems, orders, orderItems } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"

// Cache profile for cart revalidation (short-lived, user-specific)
const CART_CACHE_PROFILE = "seconds"

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
  shippingAddress: string | null
  billingAddress: string | null
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
    const [cartData] = await db.select().from(carts).where(and(eq(carts.id, id), eq(carts.tenantId, tenantId), eq(carts.status, "active"))).limit(1);

    if (!cartData) {
      return null
    }

    const itemsData = await db.select().from(cartItems).where(eq(cartItems.cartId, id)).orderBy(cartItems.createdAt);

    const items: CartItem[] = itemsData.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      productSku: item.productSku,
      productImage: item.productImage,
      unitPrice: Number(item.unitPrice),
      compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
      quantity: item.quantity,
      subtotal: Number(item.unitPrice) * item.quantity,
    }))

    return {
      id: cartData.id,
      tenantId: cartData.tenantId,
      customerId: cartData.customerId,
      email: cartData.email,
      items,
      subtotal: Number(cartData.subtotal || 0),
      discountTotal: Number(cartData.discountTotal || 0),
      shippingTotal: Number(cartData.shippingTotal || 0),
      taxTotal: Number(cartData.taxTotal || 0),
      total: Number(cartData.total || 0),
      currency: cartData.currency || "USD",
      shippingAddress: cartData.shippingAddress,
      billingAddress: cartData.billingAddress,
      status: cartData.status as "active" | "completed" | "abandoned",
      createdAt: cartData.createdAt.toISOString(),
      updatedAt: cartData.updatedAt.toISOString(),
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
  const [newCart] = await db.insert(carts).values({
    tenantId,
    currency,
    status: "active",
  }).returning();

  if (!newCart) {
    throw new Error("Failed to create cart")
  }

  await setCartId(newCart.id)

  // Revalidate cache
  const cacheTag = await getCacheTag("carts", tenantId)
  revalidateTag(cacheTag, CART_CACHE_PROFILE)

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
    createdAt: newCart.createdAt.toISOString(),
    updatedAt: newCart.updatedAt.toISOString(),
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

    // Check if item already exists
    const [existing] = await db.select().from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          options.variantId ? eq(cartItems.variantId, options.variantId) : sql`${cartItems.variantId} IS NULL`
        )
      )
      .limit(1);

    if (existing) {
      // Update quantity
      await db.update(cartItems)
        .set({
          quantity: existing.quantity + quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existing.id));
    } else {
      // Insert new item
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId,
        variantId: options.variantId || null,
        productName: options.productName,
        productSku: options.productSku || null,
        productImage: options.productImage || null,
        unitPrice: String(options.unitPrice),
        compareAtPrice: options.compareAtPrice ? String(options.compareAtPrice) : null,
        quantity,
      });
    }

    // Update cart totals
    await recalculateCartTotals(cart.id)

    // Revalidate cache
    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, CART_CACHE_PROFILE)

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
  // Get cart with discount info
  const [cart] = await db.select({
    discountTotal: carts.discountTotal,
    shippingTotal: carts.shippingTotal,
    taxTotal: carts.taxTotal
  }).from(carts).where(eq(carts.id, cartId)).limit(1);

  // Get all items
  const items = await db.select({
    unitPrice: cartItems.unitPrice,
    quantity: cartItems.quantity
  }).from(cartItems).where(eq(cartItems.cartId, cartId));

  const subtotal = (items || []).reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  )

  const discountTotal = Number(cart?.discountTotal || 0)
  const shippingTotal = Number(cart?.shippingTotal || 0)
  const taxTotal = Number(cart?.taxTotal || 0)
  const total = subtotal - discountTotal + shippingTotal + taxTotal

  // Update cart
  await db.update(carts)
    .set({
      subtotal: String(subtotal),
      total: String(Math.max(0, total)),
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId));
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
    // Get cart ID from item
    const [item] = await db.select({ cartId: cartItems.cartId }).from(cartItems).where(eq(cartItems.id, itemId)).limit(1);

    if (!item) {
      return { success: false, error: "Item not found" }
    }

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
    } else {
      await db.update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, itemId));
    }

    // Recalculate totals
    await recalculateCartTotals(item.cartId)

    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, CART_CACHE_PROFILE)

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
    shippingAddress?: string
    billingAddress?: string
    shippingMethodId?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { success: false, error: "No cart found" }
  }

  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (data.email !== undefined) {
      updateData.email = data.email
    }
    if (data.shippingAddress !== undefined) {
      updateData.shippingAddress = data.shippingAddress
    }
    if (data.billingAddress !== undefined) {
      updateData.billingAddress = data.billingAddress
    }

    await db.update(carts).set(updateData).where(eq(carts.id, cartId));

    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, CART_CACHE_PROFILE)

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
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    // Reset totals
    await db.update(carts)
      .set({
        subtotal: "0",
        total: "0",
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cartId));

    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, CART_CACHE_PROFILE)

    return { success: true }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return { success: false, error: "Failed to clear cart" }
  }
}

/**
 * Complete cart (convert to order)
 * 
 * @deprecated Use checkout API route instead which handles Stripe integration
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
    // Get cart with items
    const cart = await retrieveCart(tenantId, cartId)

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Cart is empty" }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

    // Create order using Drizzle
    const [order] = await db.insert(orders).values({
      tenantId,
      orderNumber,
      status: "pending",
      paymentStatus: "pending",
      subtotal: String(cart.subtotal),
      total: String(cart.total),
      customerEmail: cart.email,
    }).returning();

    // Create order items
    for (const item of cart.items) {
      await db.insert(orderItems).values({
        orderId: order.id,
        tenantId,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        productSku: item.productSku,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        totalPrice: String(item.subtotal),
      });
    }

    // Mark cart as completed
    await db.update(carts)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cartId));

    // Remove cart cookie
    await removeCartId()

    // Revalidate caches
    const cartCacheTag = await getCacheTag("carts", tenantId)
    const orderCacheTag = await getCacheTag("orders", tenantId)
    revalidateTag(cartCacheTag, CART_CACHE_PROFILE)
    revalidateTag(orderCacheTag, CART_CACHE_PROFILE)

    return { success: true, orderId: order.id, orderNumber }
  } catch (error) {
    console.error("Error completing cart:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to complete order" }
  }
}

/**
 * Apply voucher to cart data
 */
export async function applyVoucherToCartData(
  tenantId: string,
  discountId: string,
  voucherCodeId: string,
  voucherCode: string,
  discountAmount: number
): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { success: false, error: "No cart found" }
  }

  try {
    await db.update(carts)
      .set({
        discountId,
        voucherCodeId,
        voucherCode,
        discountTotal: String(discountAmount),
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cartId));

    // Recalculate totals
    await recalculateCartTotals(cartId)

    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, CART_CACHE_PROFILE)

    return { success: true }
  } catch (error) {
    console.error("Error applying voucher to cart:", error)
    return { success: false, error: "Failed to apply voucher" }
  }
}

/**
 * Remove voucher from cart
 */
export async function removeVoucherFromCart(
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { success: false, error: "No cart found" }
  }

  try {
    await db.update(carts)
      .set({
        discountId: null,
        voucherCodeId: null,
        voucherCode: null,
        discountTotal: "0",
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cartId));

    // Recalculate totals
    await recalculateCartTotals(cartId)

    const cacheTag = await getCacheTag("carts", tenantId)
    revalidateTag(cacheTag, CART_CACHE_PROFILE)

    return { success: true }
  } catch (error) {
    console.error("Error removing voucher from cart:", error)
    return { success: false, error: "Failed to remove voucher" }
  }
}
