import { db } from "@/infrastructure/db";
import { orders, orderItems } from "@/db/schema/orders";
import { products } from "@/db/schema/products";
import { eq, and, sql } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import type { OrderStatus, PaymentStatus } from "@/shared/types/status";

const log = createLogger("workflows:order");

type OrderResult = { order: { id: string; order_number: string } | null; success: boolean; error?: string };

// --- Types ---
export interface CreateOrderInput {
  tenantId: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  items: { productId: string; variantId?: string; quantity: number; price: number }[];
  shippingAddress?: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  shippingMethod?: string;
  discountCode?: string;
  customerNote?: string;
  stripePaymentIntentId?: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  tenantId: string;
  status: OrderStatus;
  internalNotes?: string;
}

export interface CancelOrderInput {
  orderId: string;
  tenantId: string;
  reason?: string;
}

export interface CreateReturnInput {
  orderId: string;
  tenantId: string;
  items: { orderItemId: string; quantity: number; reason?: string }[];
}

export interface ProcessRefundInput {
  orderId: string;
  tenantId: string;
  amount?: number; // partial refund amount; omit for full
}

// --- Generate order number ---
function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

// --- Workflows ---

export async function createOrderWorkflow(input: CreateOrderInput): Promise<OrderResult> {
  try {
    const orderNumber = generateOrderNumber();
    const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal; // TODO: apply discount, tax, shipping

    const [order] = await db.insert(orders).values({
      tenantId: input.tenantId,
      customerId: input.customerId,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      orderNumber,
      status: "pending",
      paymentStatus: input.stripePaymentIntentId ? "pending" : "pending",
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      itemsCount: input.items.reduce((s, i) => s + i.quantity, 0),
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      shippingMethod: input.shippingMethod,
      discountCode: input.discountCode,
      customerNote: input.customerNote,
      stripePaymentIntentId: input.stripePaymentIntentId,
    }).returning({ id: orders.id, orderNumber: orders.orderNumber });

    // Insert order items
    if (input.items.length > 0) {
      await db.insert(orderItems).values(
        input.items.map(i => ({
          orderId: order.id,
          tenantId: input.tenantId,
          productId: i.productId,
          variantId: i.variantId,
          productName: "", // Populated by caller or trigger
          quantity: i.quantity,
          unitPrice: i.price.toFixed(2),
          totalPrice: (i.price * i.quantity).toFixed(2),
          total: (i.price * i.quantity).toFixed(2),
        }))
      );
    }

    // Decrement inventory
    for (const item of input.items) {
      await db.update(products)
        .set({ quantity: sql`GREATEST(0, ${products.quantity} - ${item.quantity})`, updatedAt: new Date() })
        .where(and(eq(products.id, item.productId), eq(products.tenantId, input.tenantId)));
    }

    log.info(`Order created: ${orderNumber}`);
    return { order: { id: order.id, order_number: orderNumber }, success: true };
  } catch (err) {
    log.error("createOrderWorkflow failed:", err);
    return { order: null, success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateOrderStatusWorkflow(input: UpdateOrderStatusInput): Promise<OrderResult> {
  try {
    const [updated] = await db.update(orders)
      .set({ status: input.status, internalNotes: input.internalNotes, updatedAt: new Date() })
      .where(and(eq(orders.id, input.orderId), eq(orders.tenantId, input.tenantId)))
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    if (!updated) return { order: null, success: false, error: "Order not found" };
    log.info(`Order ${updated.orderNumber} status → ${input.status}`);
    return { order: { id: updated.id, order_number: updated.orderNumber }, success: true };
  } catch (err) {
    log.error("updateOrderStatusWorkflow failed:", err);
    return { order: null, success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function cancelOrderWorkflow(input: CancelOrderInput): Promise<OrderResult> {
  try {
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(orders)
        .set({ status: "cancelled", paymentStatus: "cancelled", internalNotes: input.reason, updatedAt: new Date() })
        .where(and(eq(orders.id, input.orderId), eq(orders.tenantId, input.tenantId), sql`${orders.status} != 'cancelled'`))
        .returning({ id: orders.id, orderNumber: orders.orderNumber });

      if (!updated) return { order: null, success: false, error: "Order not found or already cancelled" };

      // Get order items to restore inventory
      const items = await tx.select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems).where(eq(orderItems.orderId, input.orderId));

      // Restore inventory
      for (const item of items) {
        if (item.productId) {
          await tx.update(products)
            .set({ quantity: sql`${products.quantity} + ${item.quantity}`, updatedAt: new Date() })
            .where(eq(products.id, item.productId));
        }
      }

      log.info(`Order ${updated.orderNumber} cancelled`);
      return { order: { id: updated.id, order_number: updated.orderNumber }, success: true };
    });
  } catch (err) {
    log.error("cancelOrderWorkflow failed:", err);
    return { order: null, success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createReturnWorkflow(input: CreateReturnInput): Promise<OrderResult> {
  try {
    const [order] = await db.update(orders)
      .set({ status: "returned", updatedAt: new Date() })
      .where(and(eq(orders.id, input.orderId), eq(orders.tenantId, input.tenantId)))
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    if (!order) return { order: null, success: false, error: "Order not found" };

    // Restore inventory for returned items
    for (const item of input.items) {
      const [oi] = await db.select({ productId: orderItems.productId })
        .from(orderItems).where(eq(orderItems.id, item.orderItemId)).limit(1);
      if (oi?.productId) {
        await db.update(products)
          .set({ quantity: sql`${products.quantity} + ${item.quantity}`, updatedAt: new Date() })
          .where(eq(products.id, oi.productId));
      }
    }

    log.info(`Return created for order ${order.orderNumber}`);
    return { order: { id: order.id, order_number: order.orderNumber }, success: true };
  } catch (err) {
    log.error("createReturnWorkflow failed:", err);
    return { order: null, success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function processRefundWorkflow(input: ProcessRefundInput): Promise<OrderResult> {
  try {
    const [order] = await db.select({
      id: orders.id, orderNumber: orders.orderNumber,
      total: orders.total, stripePaymentIntentId: orders.stripePaymentIntentId,
    }).from(orders)
      .where(and(eq(orders.id, input.orderId), eq(orders.tenantId, input.tenantId)))
      .limit(1);

    if (!order) return { order: null, success: false, error: "Order not found" };

    const isFullRefund = !input.amount || input.amount >= Number(order.total);
    const paymentStatus: PaymentStatus = isFullRefund ? "refunded" : "partially_refunded";

    // If Stripe payment, refund via Stripe FIRST — only update DB on success
    if (order.stripePaymentIntentId) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        ...(input.amount ? { amount: Math.round(input.amount * 100) } : {}),
      });
    }

    await db.update(orders)
      .set({ paymentStatus, ...(isFullRefund ? { status: "refunded" as const } : {}), updatedAt: new Date() })
      .where(eq(orders.id, input.orderId));

    log.info(`Refund processed for order ${order.orderNumber}, full=${isFullRefund}`);
    return { order: { id: order.id, order_number: order.orderNumber }, success: true };
  } catch (err) {
    log.error("processRefundWorkflow failed:", err);
    return { order: null, success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
