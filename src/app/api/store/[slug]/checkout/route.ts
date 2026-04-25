// Checkout API route — processes orders from the storefront

import { db } from "@/infrastructure/db"
import { tenants, type TenantSettings } from "@/db/schema/tenants"
import { carts, cartItems, orders, orderItems, products, users } from "@/db/schema"
import { codCollections } from "@/db/schema/cod"
import { eq, and, sql } from "drizzle-orm"
import { getCartId, removeCartId } from "@/features/store/data/cookies"
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from "@/infrastructure/services/email/actions"
import { sendWhatsAppMessage, orderReceivedMessage } from "@/infrastructure/services/whatsapp"
import { createLogger } from "@/lib/logger"
import { NextResponse } from "next/server"

const log = createLogger("api:checkout")

const VALID_PAYMENT_METHODS = ['cod', 'bank_transfer', 'esewa', 'khalti', 'stripe', 'card'] as const
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

    // [Fix 4] Validate paymentMethod against allowlist
    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: { message: "Invalid payment method" } }, { status: 400 })
    }

    // [Fix 10] Validate email if provided
    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: { message: "Invalid email address" } }, { status: 400 })
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

    // [Fix 8] Order number with random suffix
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`

    // [Fix 1] Wrap order creation in a transaction
    const order = await db.transaction(async (tx) => {
      // [Fix 2] Lock the cart row with FOR UPDATE
      const lockedCart = await tx.execute(sql`SELECT id FROM carts WHERE id = ${cartId} AND tenant_id = ${tenant.id} AND status = 'active' FOR UPDATE`)
      if (!lockedCart.length) {
        throw new Error("CART_UNAVAILABLE")
      }

      // [Fix 3] Stock validation
      for (const item of items) {
        if (item.productId) {
          const [product] = await tx.select({ quantity: products.quantity, trackQuantity: products.trackQuantity, allowBackorder: products.allowBackorder }).from(products).where(and(eq(products.id, item.productId), eq(products.tenantId, tenant.id))).limit(1)
          if (product && product.trackQuantity && !product.allowBackorder && (product.quantity ?? 0) < item.quantity) {
            throw new Error(`INSUFFICIENT_STOCK:${item.productName}`)
          }
        }
      }

      // Create order — [Fix 7] pass shippingAddress object directly
      const [created] = await tx.insert(orders).values({
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
        shippingAddress: { address: shippingAddress, city: shippingCity, area: shippingArea, country: "Nepal", phone: customerPhone },
        currency: tenant.currency || "NPR",
        metadata: { paymentMethod },
      }).returning()

      // Create order items
      for (const item of items) {
        await tx.insert(orderItems).values({
          orderId: created.id,
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
        await tx.insert(codCollections).values({
          tenantId: tenant.id,
          orderId: created.id,
          expectedAmount: String(total),
          currency: tenant.currency || "NPR",
          status: "pending",
        })
      }

      // [Fix 9] Stock decrement inside transaction
      for (const item of items) {
        if (item.productId) {
          await tx.update(products)
            .set({ quantity: sql`GREATEST(0, ${products.quantity} - ${item.quantity})` })
            .where(and(eq(products.id, item.productId), eq(products.tenantId, tenant.id)))
        }
      }

      // Mark cart completed
      await tx.update(carts).set({ status: "completed", updatedAt: new Date() }).where(eq(carts.id, cartId))

      return created
    })

    await removeCartId()

    // --- Payment processing (outside transaction, but order exists) ---

    // [Fix 5] eSewa: return form data for frontend POST
    let esewaFormData: Record<string, string> | undefined
    let esewaFormAction: string | undefined

    if (paymentMethod === "esewa") {
      const paySettings = (settings as Record<string, unknown>).payments as Record<string, unknown> | undefined;
      const merchantCode = paySettings?.esewamerchantCode as string;
      const merchantSecret = paySettings?.esewaSecret as string;
      if (merchantCode && merchantSecret) {
        const { initiateEsewaPayment } = await import("@/infrastructure/payments/esewa");
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const result = initiateEsewaPayment({
          amount: total,
          transactionUuid: order.id,
          merchantCode,
          merchantSecret,
          successUrl: `${baseUrl}/api/store/${slug}/payment/esewa`,
          failureUrl: `${baseUrl}/store/${slug}?payment=failed`,
        });
        esewaFormData = result.formData
        esewaFormAction = result.redirectUrl
      }
    }

    // Khalti: initiate and get redirect URL
    let paymentRedirectUrl: string | undefined

    if (paymentMethod === "khalti") {
      const paySettings = (settings as Record<string, unknown>).payments as Record<string, unknown> | undefined;
      const secretKey = paySettings?.khaltiSecretKey as string;
      if (secretKey) {
        const { initiateKhaltiPayment } = await import("@/infrastructure/payments/khalti");
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const result = await initiateKhaltiPayment({
          amount: Math.round(total * 100), // paisa
          purchaseOrderId: order.id,
          purchaseOrderName: `Order ${orderNumber}`,
          returnUrl: `${baseUrl}/api/store/${slug}/payment/khalti`,
          websiteUrl: `${baseUrl}/store/${slug}`,
          secretKey,
          customerName: customerName,
          customerEmail: email,
          customerPhone: customerPhone,
        });
        if (result.success && result.paymentUrl) {
          paymentRedirectUrl = result.paymentUrl;
          await db.update(orders).set({ metadata: sql`COALESCE(${orders.metadata}, '{}'::jsonb) || ${JSON.stringify({ paymentMethod: "khalti", khaltiPidx: result.pidx })}::jsonb` }).where(and(eq(orders.id, order.id), eq(orders.tenantId, tenant.id)));
        }
      }
    }

    // [Fix 6] Stripe: delete order on failure
    let stripeClientSecret: string | undefined

    if (paymentMethod === "stripe" || paymentMethod === "card") {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const pi = await stripe.paymentIntents.create({
          amount: Math.round(total * 100),
          currency: (tenant.currency || "NPR").toLowerCase(),
          metadata: { orderId: order.id, orderNumber, tenantId: tenant.id },
          ...(tenant.stripeAccountId ? { transfer_data: { destination: tenant.stripeAccountId } } : {}),
        });
        await db.update(orders).set({ stripePaymentIntentId: pi.id, metadata: sql`COALESCE(${orders.metadata}, '{}'::jsonb) || ${JSON.stringify({ paymentMethod: "stripe" })}::jsonb` }).where(and(eq(orders.id, order.id), eq(orders.tenantId, tenant.id)));
        stripeClientSecret = pi.client_secret ?? undefined
      } catch (stripeErr) {
        log.error("Stripe PaymentIntent creation failed:", stripeErr);
        await db.delete(orders).where(and(eq(orders.id, order.id), eq(orders.tenantId, tenant.id)))
        return NextResponse.json({ error: { message: "Payment initialization failed. Please try again." } }, { status: 500 })
      }
    }

    // --- Fire-and-forget side effects ---

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

    // WhatsApp notification to merchant (fire-and-forget)
    if (settings.whatsapp?.enabled && settings.whatsapp.apiUrl && settings.whatsapp.apiToken && settings.whatsapp.merchantPhone) {
      const msg = orderReceivedMessage(orderNumber, String(total), currency, customerName)
      sendWhatsAppMessage({
        to: settings.whatsapp.merchantPhone,
        message: msg,
        config: { apiUrl: settings.whatsapp.apiUrl, apiToken: settings.whatsapp.apiToken },
      }).catch(err => log.error("WhatsApp merchant notification failed:", err))
    }

    return NextResponse.json({
      data: {
        orderId: order.id,
        orderNumber,
        total,
        paymentMethod,
        ...(paymentRedirectUrl && { paymentRedirectUrl }),
        ...(esewaFormData && { esewaFormData, esewaFormAction }),
        ...(stripeClientSecret && { stripeClientSecret }),
      }
    })
  } catch (error) {
    if (error instanceof Error && error.message === "CART_UNAVAILABLE") {
      return NextResponse.json({ error: { message: "Cart is no longer available" } }, { status: 400 })
    }
    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const productName = error.message.split(":")[1]
      return NextResponse.json({ error: { message: `Insufficient stock for ${productName}` } }, { status: 400 })
    }
    log.error("Checkout error:", error)
    return NextResponse.json({ error: { message: "Checkout failed. Please try again." } }, { status: 500 })
  }
}
