"use server"

import { db } from "@/infrastructure/db"
import { tenants, type TenantSettings } from "@/db/schema/tenants"
import { carts, cartItems, orders, orderItems, products, users } from "@/db/schema"
import { codCollections } from "@/db/schema/cod"
import { eq, and, sql } from "drizzle-orm"
import { getCartId, removeCartId } from "@/features/store/data/cookies"
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from "@/infrastructure/services/email/actions"
import { createLogger } from "@/lib/logger"
import { NextResponse } from "next/server"

const log = createLogger("api:checkout")

interface ShippingRate {
  id: string; name: string; price: number; min_days: number; max_days: number
  condition_type?: "weight" | "price" | "none"; condition_min?: number; condition_max?: number
}
interface ShippingZone {
  id: string; name: string; regions: string[]; rates: ShippingRate[]
}
interface ShippingSettings {
  zones: ShippingZone[]
  freeShippingThreshold: number | null
}

function calculateShipping(settings: TenantSettings, subtotal: number, city: string): number {
  const shipping = (settings as Record<string, unknown>).shipping as ShippingSettings | undefined
  if (!shipping?.zones?.length) return 0

  // Check free shipping threshold
  if (shipping.freeShippingThreshold && subtotal >= shipping.freeShippingThreshold) return 0

  // Find matching zone by city/region
  const zone = shipping.zones.find(z =>
    z.regions.some(r => r.toLowerCase() === city.toLowerCase())
  ) || shipping.zones[0] // fallback to first zone

  if (!zone?.rates?.length) return 0

  // Find rate matching subtotal condition
  const rate = zone.rates.find(r => {
    if (!r.condition_type || r.condition_type === "none") return true
    if (r.condition_type === "price") {
      return (!r.condition_min || subtotal >= r.condition_min) && (!r.condition_max || subtotal <= r.condition_max)
    }
    return true
  }) || zone.rates[0]

  return rate?.price ?? 0
}

function calculateTax(settings: TenantSettings, subtotal: number, priceIncludesTax: boolean): number {
  const rate = settings.tax?.defaultRate ?? 0
  if (rate <= 0) return 0

  if (priceIncludesTax) {
    // Tax is already included in price — extract it
    return subtotal - (subtotal / (1 + rate / 100))
  }
  return subtotal * (rate / 100)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const body = await request.json()
    const { customerName, email, customerPhone, shippingAddress, shippingCity, shippingArea, paymentMethod } = body

    if (!customerName || !customerPhone || !shippingAddress || !shippingCity) {
      return NextResponse.json({ error: { message: "Missing required fields" } }, { status: 400 })
    }

    // Get tenant
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1)
    if (!tenant) return NextResponse.json({ error: { message: "Store not found" } }, { status: 404 })

    const settings = (tenant.settings ?? {}) as TenantSettings

    // Get cart
    const cartId = await getCartId()
    if (!cartId) return NextResponse.json({ error: { message: "No cart found" } }, { status: 400 })

    const [cartData] = await db.select().from(carts).where(and(eq(carts.id, cartId), eq(carts.tenantId, tenant.id))).limit(1)
    if (!cartData) return NextResponse.json({ error: { message: "Cart not found" } }, { status: 400 })

    const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId))
    if (!items.length) return NextResponse.json({ error: { message: "Cart is empty" } }, { status: 400 })

    // Calculate totals
    const subtotal = items.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0)
    const shippingTotal = calculateShipping(settings, subtotal, shippingCity)
    const taxTotal = calculateTax(settings, subtotal, tenant.priceIncludesTax ?? false)
    const discountTotal = Number(cartData.discountTotal || 0)
    const total = subtotal - discountTotal + shippingTotal + (tenant.priceIncludesTax ? 0 : taxTotal)

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

    // Create order
    const [order] = await db.insert(orders).values({
      tenantId: tenant.id,
      orderNumber,
      status: "pending",
      paymentStatus: "pending",
      subtotal: String(subtotal),
      shippingTotal: String(shippingTotal),
      taxTotal: String(taxTotal),
      discountTotal: String(discountTotal),
      total: String(total),
      customerName,
      customerEmail: email || null,
      shippingAddress: JSON.stringify({ address: shippingAddress, city: shippingCity, area: shippingArea, country: "Nepal", phone: customerPhone }),
      currency: tenant.currency || "NPR",
      metadata: { paymentMethod },
    }).returning()

    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: order.id,
        tenantId: tenant.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        productSku: item.productSku,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        totalPrice: String(Number(item.unitPrice) * item.quantity),
      })
    }

    // COD: create collection record
    if (paymentMethod === "cod") {
      await db.insert(codCollections).values({
        tenantId: tenant.id,
        orderId: order.id,
        expectedAmount: String(total),
        currency: tenant.currency || "NPR",
        status: "pending",
      })
    }

    // Mark cart completed
    await db.update(carts).set({ status: "completed", updatedAt: new Date() }).where(eq(carts.id, cartId))
    await removeCartId()

    // --- Fire-and-forget side effects ---

    // Stock decrement
    for (const item of items) {
      if (item.productId) {
        db.update(products)
          .set({ quantity: sql`GREATEST(0, ${products.quantity} - ${item.quantity})` })
          .where(and(eq(products.id, item.productId), eq(products.tenantId, tenant.id)))
          .catch(err => log.error("Stock decrement failed:", err))
      }
    }

    // Emails
    const currency = tenant.currency || "NPR"
    const orderDetails = {
      orderId: order.id,
      orderNumber,
      customerName,
      customerEmail: email,
      items: items.map(i => ({ productName: i.productName, quantity: i.quantity, unitPrice: String(i.unitPrice), totalPrice: String(Number(i.unitPrice) * i.quantity), productImage: i.productImage ?? undefined })),
      subtotal: String(subtotal),
      shippingTotal: String(shippingTotal),
      taxTotal: String(taxTotal),
      total: String(total),
      currency,
      createdAt: new Date(),
    }
    const storeInfo = { name: tenant.name, slug: tenant.slug }

    if (email) {
      sendOrderConfirmationEmail(email, orderDetails, storeInfo).catch(err => log.error("Confirmation email failed:", err))
    }

    const [owner] = await db.select({ email: users.email }).from(users).where(and(eq(users.tenantId, tenant.id), eq(users.role, "owner")))
    if (owner?.email) {
      sendOrderNotificationEmail(owner.email, orderDetails, storeInfo).catch(err => log.error("Merchant notification failed:", err))
    }

    return NextResponse.json({
      data: {
        orderId: order.id,
        orderNumber,
        total,
        paymentMethod,
      }
    })
  } catch (error) {
    log.error("Checkout error:", error)
    return NextResponse.json({ error: { message: "Checkout failed. Please try again." } }, { status: 500 })
  }
}
