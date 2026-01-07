import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { withTenant, sudoDb } from "@/infrastructure/db";
import { orders, orderItems, carts, tenants, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateTenantId } from "@/shared/errors";
import { auditLogger } from "@/infrastructure/services/audit-logger";
import { inngest } from "@/infrastructure/inngest";
import type { OrderDetails, StoreInfo, OrderItemDetails } from "@/infrastructure/services/email/types";

/**
 * Stripe Webhook Handler
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.4
 * @see SYSTEM-ARCHITECTURE.md Section 5.2 (S7: Stripe Metadata Validation)
 * 
 * Handles payment events from Stripe:
 * - payment_intent.succeeded: Create order from cart
 * - payment_intent.payment_failed: Log failure
 * - checkout.session.completed: Alternative flow
 * 
 * Background jobs are dispatched via Inngest for:
 * - Order confirmation emails
 * - Merchant notification emails
 * - Inventory decrements
 * - Webhook event sync/audit
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing signature");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, event.id);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, event.id);
        break;

      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, event.id);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    
    // Return 200 to acknowledge receipt (Stripe will retry on 4xx/5xx)
    // Log the error for investigation
    return NextResponse.json({ received: true, error: "Processing error" });
  }
}

/**
 * Handle successful payment
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.4 (Webhook Endpoints)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, eventId: string) {
  const { tenant_id, cart_id } = paymentIntent.metadata;

  // S7: Validate metadata exists
  if (!tenant_id || !cart_id) {
    console.error("[Stripe Webhook] Missing metadata in payment intent", {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
    return;
  }

  // S7: Validate tenant_id format
  try {
    validateTenantId(tenant_id);
  } catch (error) {
    console.error("[Stripe Webhook] Invalid tenant_id format", { tenant_id });
    return;
  }

  await withTenant(tenant_id, async (tx) => {
    // Get cart with items
    const cart = await tx.query.carts.findFirst({
      where: eq(carts.id, cart_id),
      with: { items: true },
    });

    if (!cart) {
      console.error("[Stripe Webhook] Cart not found", { cart_id, tenant_id });
      return;
    }

    // Check if order already exists (idempotency)
    const existingOrder = await tx.query.orders.findFirst({
      where: eq(orders.stripePaymentIntentId, paymentIntent.id),
    });

    if (existingOrder) {
      console.log("[Stripe Webhook] Order already exists", { orderId: existingOrder.id });
      return;
    }

    // Create order
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const [order] = await tx.insert(orders).values({
      tenantId: tenant_id,
      orderNumber,
      status: "pending",
      total: (paymentIntent.amount / 100).toFixed(2),
      subtotal: cart.subtotal || (paymentIntent.amount / 100).toFixed(2),
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: "paid",
      customerEmail: cart.email || paymentIntent.receipt_email,
      customerName: cart.customerName,
      shippingAddress: cart.shippingAddress ? {
        street: cart.shippingAddress,
        city: cart.shippingCity,
        area: cart.shippingArea,
        postalCode: cart.shippingPostalCode,
        country: cart.shippingCountry,
      } : null,
      currency: cart.currency || "USD",
    }).returning();

    console.log("[Stripe Webhook] Order created", { orderId: order.id });

    // Create order items from cart items
    if (cart.items && cart.items.length > 0) {
      await tx.insert(orderItems).values(
        cart.items.map(item => ({
          tenantId: tenant_id,
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
        }))
      );
    }

    // Mark cart as completed
    await tx.update(carts)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(carts.id, cart_id));

    // Get tenant info for store branding
    const tenant = await tx.query.tenants.findFirst({
      where: eq(tenants.id, tenant_id),
    });

    // Get merchant email for notification
    const merchantUser = await tx.query.users.findFirst({
      where: eq(users.tenantId, tenant_id),
    });

    // Prepare order details for email
    const shippingAddr = order.shippingAddress as { street?: string; city?: string; area?: string; postalCode?: string; country?: string } | null;
    const orderDetails: OrderDetails = {
      orderId: order.id,
      orderNumber: order.orderNumber || order.id.slice(0, 8).toUpperCase(),
      customerName: order.customerName || undefined,
      customerEmail: order.customerEmail || undefined,
      items: (cart.items || []).map((item): OrderItemDetails => ({
        productName: item.productName,
        productSku: item.productSku || undefined,
        productImage: item.productImage || undefined,
        variantTitle: undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
      })),
      subtotal: cart.subtotal || order.subtotal || "0",
      shippingTotal: cart.shippingTotal || order.shippingTotal || undefined,
      taxTotal: cart.taxTotal || order.taxTotal || undefined,
      discountTotal: cart.discountTotal || order.discountTotal || undefined,
      total: order.total || (paymentIntent.amount / 100).toFixed(2),
      currency: cart.currency || order.currency || "USD",
      shippingAddress: shippingAddr ? {
        street: shippingAddr.street,
        city: shippingAddr.city,
        area: shippingAddr.area,
        postalCode: shippingAddr.postalCode,
        country: shippingAddr.country,
      } : undefined,
      paymentStatus: order.paymentStatus || "paid",
      createdAt: order.createdAt,
    };

    const storeInfo: StoreInfo = {
      name: tenant?.name || "Store",
      slug: tenant?.slug || "store",
      logoUrl: tenant?.logoUrl || undefined,
      currency: tenant?.currency || "USD",
    };

    // Dispatch background jobs via Inngest
    const inngestEvents: Array<{
      name: string;
      data: Record<string, unknown>;
    }> = [];

    // Queue customer confirmation email
    if (order.customerEmail) {
      inngestEvents.push({
        name: "order/send-confirmation",
        data: {
          tenantId: tenant_id,
          customerEmail: order.customerEmail,
          orderDetails,
          storeInfo,
        },
      });
      console.log("[Stripe Webhook] Queued customer confirmation email", { 
        orderId: order.id, 
        email: order.customerEmail 
      });
    } else {
      console.warn("[Stripe Webhook] No customer email for order confirmation", { orderId: order.id });
    }

    // Queue merchant notification email
    if (merchantUser?.email) {
      inngestEvents.push({
        name: "order/send-notification",
        data: {
          tenantId: tenant_id,
          merchantEmail: merchantUser.email,
          orderDetails,
          storeInfo,
        },
      });
      console.log("[Stripe Webhook] Queued merchant notification email", { 
        orderId: order.id, 
        email: merchantUser.email 
      });
    } else {
      console.warn("[Stripe Webhook] No merchant email for order notification", { orderId: order.id });
    }
    
    // Queue inventory decrement
    if (cart.items && cart.items.length > 0) {
      const inventoryItems = cart.items
        .filter(item => item.variantId) // Only process items with variant IDs
        .map(item => ({
          variantId: item.variantId!,
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName,
        }));

      if (inventoryItems.length > 0) {
        inngestEvents.push({
          name: "inventory/decrement",
          data: {
            tenantId: tenant_id,
            orderId: order.id,
            items: inventoryItems,
          },
        });
        console.log("[Stripe Webhook] Queued inventory decrement", {
          orderId: order.id,
          itemCount: inventoryItems.length,
        });
      }
    }

    // Queue webhook sync for audit trail
    inngestEvents.push({
      name: "stripe/webhook-sync",
      data: {
        tenantId: tenant_id,
        eventType: "payment_intent.succeeded",
        eventId,
        paymentIntentId: paymentIntent.id,
        cartId: cart_id,
        amount: paymentIntent.amount / 100,
        metadata: paymentIntent.metadata,
      },
    });

    // Send all events to Inngest in a single batch
    if (inngestEvents.length > 0) {
      try {
        await inngest.send(inngestEvents);
        console.log("[Stripe Webhook] Dispatched background jobs", {
          orderId: order.id,
          jobCount: inngestEvents.length,
        });
      } catch (inngestError) {
        // Log error but don't fail the webhook - order is already created
        console.error("[Stripe Webhook] Failed to dispatch background jobs:", inngestError);
      }
    }
    
    // Audit log checkout completion - synchronous for immediate tracking
    try {
      await auditLogger.logCheckout(tenant_id, "checkout.complete", {
        cartId: cart_id,
        orderId: order.id,
        total: paymentIntent.amount / 100,
      });
    } catch (auditError) {
      console.error("[Stripe Webhook] Audit logging failed:", auditError);
    }
    
    console.log("[Stripe Webhook] Payment processed successfully", {
      orderId: order.id,
      amount: paymentIntent.amount / 100,
    });
  });
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, eventId: string) {
  const { tenant_id, cart_id } = paymentIntent.metadata;

  console.error("[Stripe Webhook] Payment failed", {
    paymentIntentId: paymentIntent.id,
    tenant_id,
    cart_id,
    error: paymentIntent.last_payment_error?.message,
  });

  // Dispatch webhook sync for audit trail
  if (tenant_id) {
    try {
      await inngest.send({
        name: "stripe/webhook-sync",
        data: {
          tenantId: tenant_id,
          eventType: "payment_intent.payment_failed",
          eventId,
          paymentIntentId: paymentIntent.id,
          cartId: cart_id,
          metadata: {
            ...paymentIntent.metadata,
            error: paymentIntent.last_payment_error?.message || "Payment failed",
          },
        },
      });
    } catch (inngestError) {
      console.error("[Stripe Webhook] Failed to dispatch webhook sync:", inngestError);
    }

    // Also log synchronously for immediate tracking
    try {
      await auditLogger.logCheckout(tenant_id, "checkout.fail", {
        cartId: cart_id,
        error: paymentIntent.last_payment_error?.message || "Payment failed",
      });
    } catch (auditError) {
      console.error("[Stripe Webhook] Audit logging failed:", auditError);
    }
  }
}

/**
 * Handle checkout session completed (alternative flow)
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, eventId: string) {
  console.log("[Stripe Webhook] Checkout session completed", {
    sessionId: session.id,
    paymentStatus: session.payment_status,
  });

  // Dispatch webhook sync for audit trail
  const tenantId = session.metadata?.tenant_id;
  if (tenantId) {
    try {
      await inngest.send({
        name: "stripe/webhook-sync",
        data: {
          tenantId,
          eventType: "checkout.session.completed",
          eventId,
          metadata: session.metadata || {},
        },
      });
    } catch (inngestError) {
      console.error("[Stripe Webhook] Failed to dispatch webhook sync:", inngestError);
    }
  }

  // If using Stripe Checkout, handle order creation here
}

/**
 * Handle Stripe Connect account updates
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 3.4.1
 */
async function handleAccountUpdated(account: Stripe.Account) {
  const isOnboardingComplete = 
    account.charges_enabled && 
    account.payouts_enabled &&
    account.details_submitted;

  console.log("[Stripe Webhook] Account updated", {
    accountId: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    isOnboardingComplete,
  });

  // Update tenant's Stripe onboarding status
  // Note: We need to find tenant by stripe_account_id
  // This requires a query outside tenant context (platform admin)
  if (isOnboardingComplete) {
    await sudoDb
      .update(tenants)
      .set({ 
        stripeOnboardingComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(tenants.stripeAccountId, account.id));
  }
}
