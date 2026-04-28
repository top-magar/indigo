"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("orders-order-actions");

import { validateId } from "@/shared/utils/validate-id";
import { getAuthenticatedClient } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { orders, orderItems, fulfillments, fulfillmentLines, orderTransactions, orderInvoices, orderEvents } from "@/db/schema/orders";
import { products } from "@/db/schema/products";
import { eq, and, asc, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendOrderShipped, sendOrderDelivered } from "@/infrastructure/services/email/actions";
import { sendWhatsAppMessage, orderShippedMessage, orderDeliveredMessage } from "@/infrastructure/services/whatsapp";
import { tenants } from "@/db/schema/tenants";
import type {
    Order,
    OrderLine,
    Fulfillment,
    Transaction,
    Invoice,
    OrderEvent,
    CreateFulfillmentInput,
    UpdateFulfillmentInput,
    CreateRefundInput,
    AddOrderNoteInput,
    OrderStats,
} from "@/features/orders/types";

// ============================================================================
// AUTH HELPER
// ============================================================================

async function getAuthenticatedTenant() {
    const { user } = await getAuthenticatedClient();
    return { tenantId: user.tenantId, userId: user.id, userName: user.fullName };
}

// ============================================================================
// ORDER QUERIES
// ============================================================================

export async function getOrder(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(orderId, "Order ID");
        const [order] = await db.select().from(orders)
            .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId))).limit(1);

        if (!order) return { success: false, error: "Order not found" };

        const [lines, fulfillmentsData, transactionsData, invoicesData, eventsData] = await Promise.all([
            db.select().from(orderItems).where(and(eq(orderItems.orderId, orderId), eq(orderItems.tenantId, tenantId))),
            db.select().from(fulfillments).where(and(eq(fulfillments.orderId, orderId), eq(fulfillments.tenantId, tenantId))).orderBy(desc(fulfillments.createdAt)),
            db.select().from(orderTransactions).where(and(eq(orderTransactions.orderId, orderId), eq(orderTransactions.tenantId, tenantId))).orderBy(desc(orderTransactions.createdAt)),
            db.select().from(orderInvoices).where(and(eq(orderInvoices.orderId, orderId), eq(orderInvoices.tenantId, tenantId))).orderBy(desc(orderInvoices.createdAt)),
            db.select().from(orderEvents).where(and(eq(orderEvents.orderId, orderId), eq(orderEvents.tenantId, tenantId))).orderBy(desc(orderEvents.createdAt)),
        ]);

        // Fetch fulfillment lines for each fulfillment
        const fLines = fulfillmentsData.length > 0
            ? await db.select().from(fulfillmentLines).where(eq(fulfillmentLines.tenantId, tenantId))
            : [];
        const fLineMap: Record<string, typeof fLines> = {};
        for (const fl of fLines) {
            if (!fLineMap[fl.fulfillmentId]) fLineMap[fl.fulfillmentId] = [];
            fLineMap[fl.fulfillmentId].push(fl);
        }

        const orderData: Order = {
            id: order.id, tenantId: order.tenantId,
            orderNumber: order.orderNumber || order.id.slice(0, 8).toUpperCase(),
            status: order.status, paymentStatus: order.paymentStatus || "pending",
            fulfillmentStatus: order.fulfillmentStatus || "unfulfilled",
            customer: {
                id: order.customerId, email: order.customerEmail || "",
                firstName: order.customerName?.split(" ")[0] || null,
                lastName: order.customerName?.split(" ").slice(1).join(" ") || null,
                phone: (order as Record<string, unknown>).customerPhone as string | undefined,
                isGuest: !order.customerId,
            },
            shippingAddress: order.shippingAddress as Order["shippingAddress"],
            billingAddress: order.billingAddress as Order["billingAddress"],
            subtotal: parseFloat(order.subtotal || "0"),
            shippingTotal: parseFloat(order.shippingTotal || "0"),
            taxTotal: parseFloat(order.taxTotal || "0"),
            discountTotal: parseFloat(order.discountTotal || "0"),
            total: parseFloat(order.total || "0"),
            currency: order.currency || "USD",
            discountId: order.discountId, discountCode: order.discountCode, discountName: order.discountName,
            shippingMethod: order.shippingMethod, shippingCarrier: order.shippingCarrier,
            lines: lines.map((line): OrderLine => ({
                id: line.id, orderId: line.orderId, variantId: line.variantId,
                productId: line.productId, productName: line.productName || "Unknown Product",
                productSku: line.productSku, productImage: line.productImage,
                quantity: line.quantity, quantityFulfilled: line.quantityFulfilled || 0,
                quantityToFulfill: line.quantity - (line.quantityFulfilled || 0),
                unitPrice: parseFloat(line.unitPrice || "0"),
                totalPrice: parseFloat(line.totalPrice || "0") || (line.quantity * parseFloat(line.unitPrice || "0")),
                taxRate: line.taxRate ? parseFloat(line.taxRate) : null,
                taxAmount: line.taxAmount ? parseFloat(line.taxAmount) : null,
                discountAmount: line.discountAmount ? parseFloat(line.discountAmount) : null,
                metadata: line.metadata as Record<string, unknown> | null,
            })),
            itemsCount: order.itemsCount || lines.length,
            fulfillments: fulfillmentsData.map((f): Fulfillment => ({
                id: f.id, orderId: f.orderId, status: f.status,
                trackingNumber: f.trackingNumber, trackingUrl: f.trackingUrl,
                shippingCarrier: f.shippingCarrier, warehouse: f.warehouse,
                lines: (fLineMap[f.id] || []).map(fl => ({
                    id: fl.id, orderLineId: fl.orderLineId, quantity: fl.quantity,
                })),
                createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt,
                updatedAt: f.updatedAt instanceof Date ? f.updatedAt.toISOString() : f.updatedAt,
            })),
            transactions: transactionsData.map((t): Transaction => ({
                id: t.id, orderId: t.orderId, type: t.type, status: t.status,
                amount: parseFloat(t.amount), currency: t.currency,
                paymentMethod: t.paymentMethod, paymentGateway: t.paymentGateway,
                gatewayTransactionId: t.gatewayTransactionId, metadata: t.metadata as Record<string, unknown> | null,
                createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
            })),
            invoices: invoicesData.map((i): Invoice => ({
                id: i.id, orderId: i.orderId, invoiceNumber: i.invoiceNumber,
                status: i.status, url: i.url,
                sentAt: i.sentAt instanceof Date ? i.sentAt.toISOString() : i.sentAt,
                createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
            })),
            events: eventsData.map((e): OrderEvent => ({
                id: e.id, orderId: e.orderId, type: e.type as OrderEvent["type"], message: e.message,
                userId: e.userId, userName: e.userName, metadata: e.metadata as Record<string, unknown> | null,
                createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
            })),
            customerNote: order.customerNote, internalNotes: order.internalNotes,
            metadata: order.metadata as Record<string, unknown> | null,
            createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
            updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
        };

        return { success: true, data: orderData };
    } catch (error) {
        log.error("Failed to fetch order:", error);
        return { success: false, error: "Failed to fetch order" };
    }
}

export async function getOrderStats(): Promise<OrderStats> {
    const { tenantId } = await getAuthenticatedTenant();

    const stats = await db.select({
        status: orders.status, cnt: count(),
        paidRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orders.total} ELSE 0 END), 0)`,
        unpaidCnt: sql<string>`SUM(CASE WHEN ${orders.paymentStatus} = 'pending' THEN 1 ELSE 0 END)`,
    }).from(orders).where(eq(orders.tenantId, tenantId)).groupBy(orders.status);

    let total = 0, draft = 0, pending = 0, processing = 0, shipped = 0, completed = 0, cancelled = 0, revenue = 0, unpaid = 0;
    for (const row of stats) {
        const cnt = Number(row.cnt); total += cnt;
        revenue += parseFloat(row.paidRevenue); unpaid += Number(row.unpaidCnt);
        switch (row.status) {
            case "draft": draft = cnt; break; case "pending": pending = cnt; break;
            case "processing": processing = cnt; break; case "shipped": shipped = cnt; break;
            case "completed": completed = cnt; break; case "cancelled": cancelled = cnt; break;
        }
    }

    return { total, draft, pending, processing, shipped, completed, cancelled, revenue, unpaid };
}

// ============================================================================
// FULFILLMENT ACTIONS
// ============================================================================

export async function createFulfillment(input: CreateFulfillmentInput) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const [fulfillment] = await db.insert(fulfillments).values({
            tenantId, orderId: input.orderId, status: "pending",
            trackingNumber: input.trackingNumber || null,
            trackingUrl: input.trackingUrl || null,
            shippingCarrier: input.shippingCarrier || null,
        }).returning();

        if (!fulfillment) return { success: false, error: "Failed to create fulfillment" };

        const flValues = input.lines.map(line => ({
            tenantId, fulfillmentId: fulfillment.id,
            orderLineId: line.orderLineId, quantity: line.quantity,
        }));

        await db.insert(fulfillmentLines).values(flValues);

        // Update order item quantities
        for (const line of input.lines) {
            await db.update(orderItems)
                .set({ quantityFulfilled: sql`${orderItems.quantityFulfilled} + ${line.quantity}` })
                .where(eq(orderItems.id, line.orderLineId));
        }

        await addOrderEvent(input.orderId, "fulfillment_created", "Fulfillment created", userId, userName);
        revalidatePath(`/dashboard/orders/${input.orderId}`);
        return { success: true, data: fulfillment };
    } catch (error) {
        log.error("Failed to create fulfillment:", error);
        return { success: false, error: "Failed to create fulfillment" };
    }
}

export async function updateFulfillmentTracking(input: UpdateFulfillmentInput) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const [fulfillment] = await db.update(fulfillments).set({
            trackingNumber: input.trackingNumber, trackingUrl: input.trackingUrl,
            shippingCarrier: input.shippingCarrier, updatedAt: new Date(),
        }).where(and(eq(fulfillments.id, input.fulfillmentId), eq(fulfillments.tenantId, tenantId)))
            .returning({ orderId: fulfillments.orderId });

        if (!fulfillment) return { success: false, error: "Failed to update tracking" };

        await addOrderEvent(fulfillment.orderId, "tracking_updated", `Tracking updated: ${input.trackingNumber}`, userId, userName);
        revalidatePath(`/dashboard/orders/${fulfillment.orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to update tracking:", error);
        return { success: false, error: "Failed to update tracking" };
    }
}

export async function approveFulfillment(fulfillmentId: string) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        validateId(fulfillmentId, "Fulfillment ID");
        const [f] = await db.update(fulfillments).set({ status: "approved", updatedAt: new Date() })
            .where(and(eq(fulfillments.id, fulfillmentId), eq(fulfillments.tenantId, tenantId)))
            .returning({ orderId: fulfillments.orderId });
        if (!f) return { success: false, error: "Failed to approve fulfillment" };
        await addOrderEvent(f.orderId, "fulfillment_approved", "Fulfillment approved", userId, userName);
        revalidatePath(`/dashboard/orders/${f.orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to approve fulfillment:", error);
        return { success: false, error: "Failed to approve fulfillment" };
    }
}

export async function cancelFulfillment(fulfillmentId: string) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        validateId(fulfillmentId, "Fulfillment ID");
        const [f] = await db.select({ orderId: fulfillments.orderId })
            .from(fulfillments).where(and(eq(fulfillments.id, fulfillmentId), eq(fulfillments.tenantId, tenantId))).limit(1);
        if (!f) return { success: false, error: "Fulfillment not found" };

        const fLines = await db.select({ orderLineId: fulfillmentLines.orderLineId, quantity: fulfillmentLines.quantity })
            .from(fulfillmentLines).where(eq(fulfillmentLines.fulfillmentId, fulfillmentId));

        await db.update(fulfillments).set({ status: "cancelled", updatedAt: new Date() })
            .where(and(eq(fulfillments.id, fulfillmentId), eq(fulfillments.tenantId, tenantId)));

        for (const line of fLines) {
            await db.update(orderItems)
                .set({ quantityFulfilled: sql`GREATEST(0, ${orderItems.quantityFulfilled} - ${line.quantity})` })
                .where(eq(orderItems.id, line.orderLineId));
        }

        await addOrderEvent(f.orderId, "fulfillment_cancelled", "Fulfillment cancelled", userId, userName);
        revalidatePath(`/dashboard/orders/${f.orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to cancel fulfillment:", error);
        return { success: false, error: "Failed to cancel fulfillment" };
    }
}

export async function markFulfillmentShipped(fulfillmentId: string) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        validateId(fulfillmentId, "Fulfillment ID");
        const [f] = await db.update(fulfillments).set({ status: "shipped", updatedAt: new Date() })
            .where(and(eq(fulfillments.id, fulfillmentId), eq(fulfillments.tenantId, tenantId)))
            .returning({ orderId: fulfillments.orderId, trackingNumber: fulfillments.trackingNumber });
        if (!f) return { success: false, error: "Failed to mark as shipped" };

        await addOrderEvent(f.orderId, "fulfillment_shipped", "Fulfillment shipped", userId, userName);

        // Send shipped email (fire-and-forget)
        const [order] = await db.select({ customerEmail: orders.customerEmail, customerPhone: sql<string>`${orders.metadata}->>'customer_phone'` })
            .from(orders).where(and(eq(orders.id, f.orderId), eq(orders.tenantId, tenantId))).limit(1);
        if (order?.customerEmail) {
            sendOrderShipped(order.customerEmail, f.orderId, f.trackingNumber ?? undefined)
                .catch((err: unknown) => log.error("Failed to send order shipped email:", err));
        }
        // WhatsApp (fire-and-forget)
        if (order?.customerPhone) {
            const [t] = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
            const wa = (t?.settings as Record<string, unknown> | null)?.whatsapp as { enabled?: boolean; apiUrl?: string; apiToken?: string } | undefined;
            if (wa?.enabled && wa.apiUrl && wa.apiToken) {
                sendWhatsAppMessage({ to: order.customerPhone, message: orderShippedMessage(f.orderId, f.trackingNumber ?? undefined), config: { apiUrl: wa.apiUrl, apiToken: wa.apiToken } })
                    .catch((err: unknown) => log.error("WhatsApp shipped notification failed:", err));
            }
        }

        revalidatePath(`/dashboard/orders/${f.orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to mark as shipped:", error);
        return { success: false, error: "Failed to mark as shipped" };
    }
}

export async function markAsDelivered(fulfillmentId: string) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        validateId(fulfillmentId, "Fulfillment ID");
        const [f] = await db.update(fulfillments).set({ status: "delivered", updatedAt: new Date() })
            .where(and(eq(fulfillments.id, fulfillmentId), eq(fulfillments.tenantId, tenantId)))
            .returning({ orderId: fulfillments.orderId });
        if (!f) return { success: false, error: "Failed to mark as delivered" };

        await db.update(orders).set({ fulfillmentStatus: "fulfilled", status: "delivered", updatedAt: new Date() })
            .where(and(eq(orders.id, f.orderId), eq(orders.tenantId, tenantId)));

        await addOrderEvent(f.orderId, "fulfillment_delivered", "Fulfillment delivered", userId, userName);

        // Send delivered email (fire-and-forget)
        const [order] = await db.select({ customerEmail: orders.customerEmail, orderNumber: orders.orderNumber, customerPhone: sql<string>`${orders.metadata}->>'customer_phone'` })
            .from(orders).where(and(eq(orders.id, f.orderId), eq(orders.tenantId, tenantId))).limit(1);
        const [tenant] = await db.select({ name: tenants.name, slug: tenants.slug, settings: tenants.settings })
            .from(tenants).where(eq(tenants.id, tenantId)).limit(1);
        if (tenant && order?.customerEmail) {
            sendOrderDelivered(order.customerEmail, order.orderNumber, tenant.name, tenant.slug)
                .catch((err: unknown) => log.error("Failed to send order delivered email:", err));
        }
        const wa = (tenant?.settings as Record<string, unknown> | null)?.whatsapp as { enabled?: boolean; apiUrl?: string; apiToken?: string } | undefined;
        if (order?.customerPhone && wa?.enabled && wa.apiUrl && wa.apiToken) {
            sendWhatsAppMessage({ to: order.customerPhone, message: orderDeliveredMessage(order.orderNumber), config: { apiUrl: wa.apiUrl, apiToken: wa.apiToken } })
                .catch((err: unknown) => log.error("WhatsApp delivered notification failed:", err));
        }

        revalidatePath(`/dashboard/orders/${f.orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to mark as delivered:", error);
        return { success: false, error: "Failed to mark as delivered" };
    }
}

// ============================================================================
// TRANSACTION ACTIONS
// ============================================================================

export async function capturePayment(orderId: string, amount?: number) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        validateId(orderId, "Order ID");
        const [order] = await db.select({ total: orders.total, currency: orders.currency })
            .from(orders).where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId))).limit(1);
        if (!order) return { success: false, error: "Order not found" };

        const captureAmount = amount || parseFloat(order.total);
        await db.insert(orderTransactions).values({
            tenantId, orderId, type: "capture", status: "success",
            amount: captureAmount.toString(), currency: order.currency || "USD",
        });
        await db.update(orders).set({ paymentStatus: "paid", updatedAt: new Date() })
            .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)));
        await addOrderEvent(orderId, "payment_captured", `Payment captured: ${order.currency} ${captureAmount}`, userId, userName);
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to capture payment:", error);
        return { success: false, error: "Failed to capture payment" };
    }
}

export async function createRefund(input: CreateRefundInput) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        const [order] = await db.select({ currency: orders.currency })
            .from(orders).where(and(eq(orders.id, input.orderId), eq(orders.tenantId, tenantId))).limit(1);
        if (!order) return { success: false, error: "Order not found" };

        await db.insert(orderTransactions).values({
            tenantId, orderId: input.orderId, type: "refund", status: "success",
            amount: input.amount.toString(), currency: order.currency || "USD",
            metadata: { reason: input.reason },
        });
        await db.update(orders).set({ paymentStatus: "refunded", updatedAt: new Date() })
            .where(and(eq(orders.id, input.orderId), eq(orders.tenantId, tenantId)));
        await addOrderEvent(input.orderId, "payment_refunded", `Refund issued: ${order.currency} ${input.amount}${input.reason ? ` - ${input.reason}` : ""}`, userId, userName);
        revalidatePath(`/dashboard/orders/${input.orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to create refund:", error);
        return { success: false, error: "Failed to create refund" };
    }
}

export async function markAsPaid(orderId: string) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        validateId(orderId, "Order ID");
        const [order] = await db.select({ total: orders.total, currency: orders.currency, paymentStatus: orders.paymentStatus })
            .from(orders).where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId))).limit(1);
        if (!order) return { success: false, error: "Order not found" };
        if (order.paymentStatus === "paid") return { success: false, error: "Order is already marked as paid" };

        await db.insert(orderTransactions).values({
            tenantId, orderId, type: "charge", status: "success",
            amount: order.total, currency: order.currency || "USD", paymentMethod: "manual",
        });
        await db.update(orders).set({ paymentStatus: "paid", updatedAt: new Date() })
            .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)));
        await addOrderEvent(orderId, "payment_captured", "Marked as paid manually", userId, userName);
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to mark as paid:", error);
        return { success: false, error: "Failed to mark as paid" };
    }
}

// ============================================================================
// INVOICE ACTIONS
// ============================================================================

export async function generateInvoice(orderId: string) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        validateId(orderId, "Order ID");
        // Generate invoice number via RPC (keep supabase for RPC)
        const { getAuthenticatedClient: getAC } = await import("@/lib/auth");
        const { supabase } = await getAC();
        const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number", { p_tenant_id: tenantId });

        const [invoice] = await db.insert(orderInvoices).values({
            tenantId, orderId, invoiceNumber: invoiceNumber || `INV-${Date.now()}`, status: "pending",
        }).returning();
        if (!invoice) return { success: false, error: "Failed to generate invoice" };

        await addOrderEvent(orderId, "invoice_generated", `Invoice ${invoice.invoiceNumber} generated`, userId, userName);
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true, data: invoice };
    } catch (error) {
        log.error("Failed to generate invoice:", error);
        return { success: false, error: "Failed to generate invoice" };
    }
}

export async function sendInvoice(invoiceId: string) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        validateId(invoiceId, "Invoice ID");
        const [invoice] = await db.update(orderInvoices).set({ status: "sent", sentAt: new Date() })
            .where(and(eq(orderInvoices.id, invoiceId), eq(orderInvoices.tenantId, tenantId)))
            .returning({ orderId: orderInvoices.orderId, invoiceNumber: orderInvoices.invoiceNumber });
        if (!invoice) return { success: false, error: "Failed to send invoice" };

        await addOrderEvent(invoice.orderId, "invoice_sent", `Invoice ${invoice.invoiceNumber} sent`, userId, userName);
        revalidatePath(`/dashboard/orders/${invoice.orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to send invoice:", error);
        return { success: false, error: "Failed to send invoice" };
    }
}

// ============================================================================
// ORDER NOTE ACTIONS
// ============================================================================

export async function addOrderNote(input: AddOrderNoteInput) {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    try {
        await db.insert(orderEvents).values({
            tenantId, orderId: input.orderId, type: "note_added",
            message: input.message, userId, userName,
            metadata: { isPublic: input.isPublic || false },
        });
        revalidatePath(`/dashboard/orders/${input.orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to add note:", error);
        return { success: false, error: "Failed to add note" };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function addOrderEvent(
    orderId: string, type: string, message: string,
    userId?: string, userName?: string | null
) {
    const { tenantId } = await getAuthenticatedTenant();
    await db.insert(orderEvents).values({
        tenantId, orderId, type, message,
        userId: userId || null, userName: userName || null,
    });
}

// ============================================================================
// DRAFT ORDER
// ============================================================================

export interface DraftOrderLineInput {
    productId: string; variantId?: string; productName: string;
    productSku?: string; productImage?: string; variantTitle?: string;
    quantity: number; unitPrice: number;
}

export interface CreateDraftOrderInput {
    customerName?: string; customerEmail?: string;
    internalNotes?: string; lines: DraftOrderLineInput[];
}

export async function searchProductsForOrder(query: string) {
    const { tenantId } = await getAuthenticatedTenant();
    const sanitized = query.replace(/[%_'"\\]/g, '');
    const data = await db.select({
        id: products.id, name: products.name, sku: products.sku,
        price: products.price, compareAtPrice: products.compareAtPrice,
        images: products.images, status: products.status,
    }).from(products)
        .where(and(eq(products.tenantId, tenantId), eq(products.status, "active"), sql`${products.name} ILIKE ${'%' + sanitized + '%'}`))
        .limit(10);

    // Return snake_case shape for compatibility
    return data.map(p => ({
        id: p.id, name: p.name, sku: p.sku, price: parseFloat(p.price || "0"),
        compare_at_price: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        images: p.images, status: p.status,
    }));
}

export async function createDraftOrder(input: CreateDraftOrderInput): Promise<{ success: boolean; error?: string; orderId?: string }> {
    const { tenantId, userId, userName } = await getAuthenticatedTenant();

    if (!input.lines.length) return { success: false, error: "At least one item is required" };

    const subtotal = input.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const orderNumber = `DRAFT-${Date.now().toString(36).toUpperCase()}`;

    try {
        const [order] = await db.insert(orders).values({
            tenantId, orderNumber, status: "draft",
            paymentStatus: "pending", fulfillmentStatus: "unfulfilled",
            subtotal: subtotal.toString(), total: subtotal.toString(),
            itemsCount: input.lines.reduce((sum, l) => sum + l.quantity, 0),
            customerName: input.customerName || null,
            customerEmail: input.customerEmail || null,
            internalNotes: input.internalNotes || null,
            metadata: { created_by: userId, created_by_name: userName, source: "draft" },
        }).returning({ id: orders.id });

        if (!order) return { success: false, error: "Failed to create order" };

        await db.insert(orderItems).values(input.lines.map(l => ({
            tenantId, orderId: order.id,
            productId: l.productId, variantId: l.variantId || null,
            productName: l.productName, productSku: l.productSku || null,
            productImage: l.productImage || null, variantTitle: l.variantTitle || null,
            quantity: l.quantity, unitPrice: l.unitPrice.toString(),
            totalPrice: (l.unitPrice * l.quantity).toString(),
        })));

        revalidatePath("/dashboard/orders");
        return { success: true, orderId: order.id };
    } catch (error) {
        log.error("Failed to create draft order", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create order" };
    }
}
