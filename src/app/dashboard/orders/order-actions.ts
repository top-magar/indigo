"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("orders-order-actions");

import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendOrderShipped, sendOrderDelivered } from "@/infrastructure/services/email/actions";
import { sendWhatsAppMessage, orderShippedMessage, orderDeliveredMessage } from "@/infrastructure/services/whatsapp";
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
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, tenantId: user.tenantId, userId: user.id, userName: user.fullName };
}

// ============================================================================
// ORDER QUERIES
// ============================================================================

export async function getOrder(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Fetch order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .eq("tenant_id", tenantId)
            .single();

        if (orderError || !order) {
            return { success: false, error: "Order not found" };
        }

        // Fetch related data in parallel
        const [
            { data: lines },
            { data: fulfillments },
            { data: transactions },
            { data: invoices },
            { data: events },
        ] = await Promise.all([
            supabase.from("order_items").select("*").eq("order_id", orderId).eq("tenant_id", tenantId),
            supabase.from("fulfillments").select("*, fulfillment_lines (*)").eq("order_id", orderId).eq("tenant_id", tenantId).order("created_at", { ascending: false }),
            supabase.from("order_transactions").select("*").eq("order_id", orderId).eq("tenant_id", tenantId).order("created_at", { ascending: false }),
            supabase.from("order_invoices").select("*").eq("order_id", orderId).eq("tenant_id", tenantId).order("created_at", { ascending: false }),
            supabase.from("order_events").select("*").eq("order_id", orderId).eq("tenant_id", tenantId).order("created_at", { ascending: false }),
        ]);

        // Transform to Order type
        const orderData: Order = {
            id: order.id,
            tenantId: order.tenant_id,
            orderNumber: order.order_number || order.id.slice(0, 8).toUpperCase(),
            status: order.status,
            paymentStatus: order.payment_status || "pending",
            fulfillmentStatus: order.fulfillment_status || "unfulfilled",
            customer: {
                id: order.customer_id,
                email: order.customer_email || "",
                firstName: order.customer_name?.split(" ")[0] || null,
                lastName: order.customer_name?.split(" ").slice(1).join(" ") || null,
                phone: order.customer_phone,
                isGuest: !order.customer_id,
            },
            shippingAddress: order.shipping_address,
            billingAddress: order.billing_address,
            subtotal: parseFloat(order.subtotal || order.total_amount || "0"),
            shippingTotal: parseFloat(order.shipping_total || "0"),
            taxTotal: parseFloat(order.tax_total || "0"),
            discountTotal: parseFloat(order.discount_total || "0"),
            total: parseFloat(order.total || order.total_amount || "0"),
            currency: order.currency || "USD",
            discountId: order.discount_id,
            discountCode: order.discount_code,
            discountName: order.discount_name,
            shippingMethod: order.shipping_method,
            shippingCarrier: order.shipping_carrier,
            lines: (lines || []).map((line): OrderLine => ({
                id: line.id,
                orderId: line.order_id,
                variantId: line.variant_id,
                productId: line.product_id,
                productName: line.product_name || "Unknown Product",
                productSku: line.product_sku,
                productImage: line.product_image,
                quantity: line.quantity,
                quantityFulfilled: line.quantity_fulfilled || 0,
                quantityToFulfill: line.quantity - (line.quantity_fulfilled || 0),
                unitPrice: parseFloat(line.unit_price || line.price || "0"),
                totalPrice: parseFloat(line.total_price || "0") || (line.quantity * parseFloat(line.unit_price || line.price || "0")),
                taxRate: line.tax_rate ? parseFloat(line.tax_rate) : null,
                taxAmount: line.tax_amount ? parseFloat(line.tax_amount) : null,
                discountAmount: line.discount_amount ? parseFloat(line.discount_amount) : null,
                metadata: line.metadata,
            })),
            itemsCount: order.items_count || (lines?.length || 0),
            fulfillments: (fulfillments || []).map((f): Fulfillment => ({
                id: f.id,
                orderId: f.order_id,
                status: f.status,
                trackingNumber: f.tracking_number,
                trackingUrl: f.tracking_url,
                shippingCarrier: f.shipping_carrier,
                warehouse: f.warehouse,
                lines: (f.fulfillment_lines || []).map((fl: { id: string; order_line_id: string; quantity: number }) => ({
                    id: fl.id,
                    orderLineId: fl.order_line_id,
                    quantity: fl.quantity,
                })),
                createdAt: f.created_at,
                updatedAt: f.updated_at,
            })),
            transactions: (transactions || []).map((t): Transaction => ({
                id: t.id,
                orderId: t.order_id,
                type: t.type,
                status: t.status,
                amount: parseFloat(t.amount),
                currency: t.currency,
                paymentMethod: t.payment_method,
                paymentGateway: t.payment_gateway,
                gatewayTransactionId: t.gateway_transaction_id,
                metadata: t.metadata,
                createdAt: t.created_at,
            })),
            invoices: (invoices || []).map((i): Invoice => ({
                id: i.id,
                orderId: i.order_id,
                invoiceNumber: i.invoice_number,
                status: i.status,
                url: i.url,
                sentAt: i.sent_at,
                createdAt: i.created_at,
            })),
            events: (events || []).map((e): OrderEvent => ({
                id: e.id,
                orderId: e.order_id,
                type: e.type,
                message: e.message,
                userId: e.user_id,
                userName: e.user_name,
                metadata: e.metadata,
                createdAt: e.created_at,
            })),
            customerNote: order.customer_note,
            internalNotes: order.internal_notes || order.notes,
            metadata: order.metadata,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
        };

        return { success: true, data: orderData };
    } catch (error) {
        log.error("Failed to fetch order:", error);
        return { success: false, error: "Failed to fetch order" };
    }
}

export async function getOrderStats(): Promise<OrderStats> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    // Use parallel count queries instead of loading all orders
    const [
        { count: total },
        { count: draft },
        { count: pending },
        { count: processing },
        { count: shipped },
        { count: completed },
        { count: cancelled },
        { count: unpaid },
        { data: revenueData },
    ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "draft"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "pending"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "processing"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "shipped"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "completed"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "cancelled"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("payment_status", "pending"),
        supabase.from("orders").select("total").eq("tenant_id", tenantId).eq("payment_status", "paid"),
    ]);

    const revenue = (revenueData || []).reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);

    return {
        total: total ?? 0, draft: draft ?? 0, pending: pending ?? 0,
        processing: processing ?? 0, shipped: shipped ?? 0,
        completed: completed ?? 0, cancelled: cancelled ?? 0,
        revenue, unpaid: unpaid ?? 0,
    };
}

// ============================================================================
// FULFILLMENT ACTIONS
// ============================================================================

export async function createFulfillment(input: CreateFulfillmentInput) {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        // Create fulfillment
        const { data: fulfillment, error: fulfillmentError } = await supabase
            .from("fulfillments")
            .insert({
                tenant_id: tenantId,
                order_id: input.orderId,
                status: "pending",
                tracking_number: input.trackingNumber || null,
                tracking_url: input.trackingUrl || null,
                shipping_carrier: input.shippingCarrier || null,
            })
            .select()
            .single();

        if (fulfillmentError || !fulfillment) {
            return { success: false, error: "Failed to create fulfillment" };
        }

        // Create fulfillment lines
        const fulfillmentLines = input.lines.map((line) => ({
            tenant_id: tenantId,
            fulfillment_id: fulfillment.id,
            order_line_id: line.orderLineId,
            quantity: line.quantity,
        }));

        const { error: linesError } = await supabase
            .from("fulfillment_lines")
            .insert(fulfillmentLines);

        if (linesError) {
            // Rollback fulfillment
            await supabase.from("fulfillments").delete().eq("id", fulfillment.id);
            return { success: false, error: "Failed to create fulfillment lines" };
        }

        // Update order item quantities
        for (const line of input.lines) {
            await supabase.rpc("increment_fulfilled_quantity", {
                p_order_line_id: line.orderLineId,
                p_quantity: line.quantity,
            });
        }

        // Add event
        await addOrderEvent(input.orderId, "fulfillment_created", "Fulfillment created", userId, userName);

        revalidatePath(`/dashboard/orders/${input.orderId}`);
        return { success: true, data: fulfillment };
    } catch (error) {
        log.error("Failed to create fulfillment:", error);
        return { success: false, error: "Failed to create fulfillment" };
    }
}

export async function updateFulfillmentTracking(input: UpdateFulfillmentInput) {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const { data: fulfillment, error } = await supabase
            .from("fulfillments")
            .update({
                tracking_number: input.trackingNumber,
                tracking_url: input.trackingUrl,
                shipping_carrier: input.shippingCarrier,
                updated_at: new Date().toISOString(),
            })
            .eq("id", input.fulfillmentId)
            .eq("tenant_id", tenantId)
            .select("order_id")
            .single();

        if (error || !fulfillment) {
            return { success: false, error: "Failed to update tracking" };
        }

        await addOrderEvent(fulfillment.order_id, "tracking_updated", `Tracking updated: ${input.trackingNumber}`, userId, userName);

        revalidatePath(`/dashboard/orders/${fulfillment.order_id}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to update tracking:", error);
        return { success: false, error: "Failed to update tracking" };
    }
}

export async function approveFulfillment(fulfillmentId: string) {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const { data: fulfillment, error } = await supabase
            .from("fulfillments")
            .update({ status: "approved", updated_at: new Date().toISOString() })
            .eq("id", fulfillmentId)
            .eq("tenant_id", tenantId)
            .select("order_id")
            .single();

        if (error || !fulfillment) {
            return { success: false, error: "Failed to approve fulfillment" };
        }

        await addOrderEvent(fulfillment.order_id, "fulfillment_approved", "Fulfillment approved", userId, userName);

        revalidatePath(`/dashboard/orders/${fulfillment.order_id}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to approve fulfillment:", error);
        return { success: false, error: "Failed to approve fulfillment" };
    }
}

export async function cancelFulfillment(fulfillmentId: string) {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        // Get fulfillment with lines
        const { data: fulfillment } = await supabase
            .from("fulfillments")
            .select(`
                order_id,
                fulfillment_lines (order_line_id, quantity)
            `)
            .eq("id", fulfillmentId)
            .eq("tenant_id", tenantId)
            .single();

        if (!fulfillment) {
            return { success: false, error: "Fulfillment not found" };
        }

        // Update status
        const { error } = await supabase
            .from("fulfillments")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("id", fulfillmentId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to cancel fulfillment" };
        }

        // Restore quantities
        for (const line of fulfillment.fulfillment_lines || []) {
            await supabase.rpc("decrement_fulfilled_quantity", {
                p_order_line_id: line.order_line_id,
                p_quantity: line.quantity,
            });
        }

        await addOrderEvent(fulfillment.order_id, "fulfillment_cancelled", "Fulfillment cancelled", userId, userName);

        revalidatePath(`/dashboard/orders/${fulfillment.order_id}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to cancel fulfillment:", error);
        return { success: false, error: "Failed to cancel fulfillment" };
    }
}

export async function markFulfillmentShipped(fulfillmentId: string) {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const { data: fulfillment, error } = await supabase
            .from("fulfillments")
            .update({ status: "shipped", updated_at: new Date().toISOString() })
            .eq("id", fulfillmentId)
            .eq("tenant_id", tenantId)
            .select("order_id, tracking_number")
            .single();

        if (error || !fulfillment) {
            return { success: false, error: "Failed to mark as shipped" };
        }

        await addOrderEvent(fulfillment.order_id, "fulfillment_shipped", "Fulfillment shipped", userId, userName);

        // Send shipped email (fire-and-forget)
        supabase
            .from("orders")
            .select("customer_email, customer_phone")
            .eq("id", fulfillment.order_id)
            .eq("tenant_id", tenantId)
            .single()
            .then(({ data: order }) => {
                if (order?.customer_email) {
                    sendOrderShipped(order.customer_email, fulfillment.order_id, fulfillment.tracking_number ?? undefined)
                        .catch((err: unknown) => log.error("Failed to send order shipped email:", err));
                }
                // WhatsApp to customer (fire-and-forget)
                if (order?.customer_phone) {
                    supabase.from("tenants").select("settings").eq("id", tenantId).single()
                        .then(({ data: t }) => {
                            const wa = (t?.settings as Record<string, unknown> | null)?.whatsapp as { enabled?: boolean; apiUrl?: string; apiToken?: string } | undefined;
                            if (wa?.enabled && wa.apiUrl && wa.apiToken) {
                                sendWhatsAppMessage({ to: order.customer_phone, message: orderShippedMessage(fulfillment.order_id, fulfillment.tracking_number ?? undefined), config: { apiUrl: wa.apiUrl, apiToken: wa.apiToken } })
                                    .catch((err: unknown) => log.error("WhatsApp shipped notification failed:", err));
                            }
                        }, (err: unknown) => log.error("Failed to fetch tenant for WhatsApp:", err));
                }
            }, (err: unknown) => log.error("Failed to fetch order for shipped email:", err));

        revalidatePath(`/dashboard/orders/${fulfillment.order_id}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to mark as shipped:", error);
        return { success: false, error: "Failed to mark as shipped" };
    }
}

export async function markAsDelivered(fulfillmentId: string) {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const { data: fulfillment, error } = await supabase
            .from("fulfillments")
            .update({ status: "delivered", updated_at: new Date().toISOString() })
            .eq("id", fulfillmentId)
            .eq("tenant_id", tenantId)
            .select("order_id")
            .single();

        if (error || !fulfillment) {
            return { success: false, error: "Failed to mark as delivered" };
        }

        // Update order status
        await supabase
            .from("orders")
            .update({ fulfillment_status: "delivered", status: "delivered", updated_at: new Date().toISOString() })
            .eq("id", fulfillment.order_id)
            .eq("tenant_id", tenantId);

        await addOrderEvent(fulfillment.order_id, "fulfillment_delivered", "Fulfillment delivered", userId, userName);

        // Send delivered email (fire-and-forget)
        supabase
            .from("orders")
            .select("customer_email, order_number, customer_phone")
            .eq("id", fulfillment.order_id)
            .eq("tenant_id", tenantId)
            .single()
            .then(async ({ data: order }) => {
                if (!order) return;
                const { data: tenant } = await supabase
                    .from("tenants")
                    .select("name, slug, settings")
                    .eq("id", tenantId)
                    .single();
                if (tenant && order.customer_email) {
                    sendOrderDelivered(order.customer_email, order.order_number, tenant.name, tenant.slug)
                        .catch((err: unknown) => log.error("Failed to send order delivered email:", err));
                }
                // WhatsApp to customer (fire-and-forget)
                const wa = (tenant?.settings as Record<string, unknown> | null)?.whatsapp as { enabled?: boolean; apiUrl?: string; apiToken?: string } | undefined;
                if (order.customer_phone && wa?.enabled && wa.apiUrl && wa.apiToken) {
                    sendWhatsAppMessage({ to: order.customer_phone, message: orderDeliveredMessage(order.order_number), config: { apiUrl: wa.apiUrl, apiToken: wa.apiToken } })
                        .catch((err: unknown) => log.error("WhatsApp delivered notification failed:", err));
                }
            }, (err: unknown) => log.error("Failed to fetch order for delivered email:", err));

        revalidatePath(`/dashboard/orders/${fulfillment.order_id}`);
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
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const { data: order } = await supabase
            .from("orders")
            .select("total, currency")
            .eq("id", orderId)
            .eq("tenant_id", tenantId)
            .single();

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        const captureAmount = amount || parseFloat(order.total);

        // Create transaction
        const { error: txError } = await supabase
            .from("order_transactions")
            .insert({
                tenant_id: tenantId,
                order_id: orderId,
                type: "capture",
                status: "success",
                amount: captureAmount,
                currency: order.currency || "USD",
            });

        if (txError) {
            return { success: false, error: "Failed to create transaction" };
        }

        // Update order payment status
        await supabase
            .from("orders")
            .update({ payment_status: "paid", updated_at: new Date().toISOString() })
            .eq("id", orderId)
            .eq("tenant_id", tenantId);

        await addOrderEvent(orderId, "payment_captured", `Payment captured: ${order.currency} ${captureAmount}`, userId, userName);

        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to capture payment:", error);
        return { success: false, error: "Failed to capture payment" };
    }
}

export async function createRefund(input: CreateRefundInput) {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const { data: order } = await supabase
            .from("orders")
            .select("currency")
            .eq("id", input.orderId)
            .eq("tenant_id", tenantId)
            .single();

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        // Create refund transaction
        const { error: txError } = await supabase
            .from("order_transactions")
            .insert({
                tenant_id: tenantId,
                order_id: input.orderId,
                type: "refund",
                status: "success",
                amount: input.amount,
                currency: order.currency || "USD",
                metadata: { reason: input.reason },
            });

        if (txError) {
            return { success: false, error: "Failed to create refund" };
        }

        // Update order payment status
        await supabase
            .from("orders")
            .update({ payment_status: "refunded", updated_at: new Date().toISOString() })
            .eq("id", input.orderId)
            .eq("tenant_id", tenantId);

        await addOrderEvent(input.orderId, "payment_refunded", `Refund issued: ${order.currency} ${input.amount}${input.reason ? ` - ${input.reason}` : ""}`, userId, userName);

        revalidatePath(`/dashboard/orders/${input.orderId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to create refund:", error);
        return { success: false, error: "Failed to create refund" };
    }
}

export async function markAsPaid(orderId: string) {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const { data: order } = await supabase
            .from("orders")
            .select("total, currency")
            .eq("id", orderId)
            .eq("tenant_id", tenantId)
            .single();

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        // Create manual payment transaction
        await supabase
            .from("order_transactions")
            .insert({
                tenant_id: tenantId,
                order_id: orderId,
                type: "charge",
                status: "success",
                amount: parseFloat(order.total),
                currency: order.currency || "USD",
                payment_method: "manual",
            });

        // Update order
        await supabase
            .from("orders")
            .update({ payment_status: "paid", updated_at: new Date().toISOString() })
            .eq("id", orderId)
            .eq("tenant_id", tenantId);

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
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        // Generate invoice number
        const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number", {
            p_tenant_id: tenantId,
        });

        const { data: invoice, error } = await supabase
            .from("order_invoices")
            .insert({
                tenant_id: tenantId,
                order_id: orderId,
                invoice_number: invoiceNumber || `INV-${Date.now()}`,
                status: "pending",
            })
            .select()
            .single();

        if (error || !invoice) {
            return { success: false, error: "Failed to generate invoice" };
        }

        await addOrderEvent(orderId, "invoice_generated", `Invoice ${invoice.invoice_number} generated`, userId, userName);

        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true, data: invoice };
    } catch (error) {
        log.error("Failed to generate invoice:", error);
        return { success: false, error: "Failed to generate invoice" };
    }
}

export async function sendInvoice(invoiceId: string) {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        const { data: invoice, error } = await supabase
            .from("order_invoices")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", invoiceId)
            .eq("tenant_id", tenantId)
            .select("order_id, invoice_number")
            .single();

        if (error || !invoice) {
            return { success: false, error: "Failed to send invoice" };
        }

        await addOrderEvent(invoice.order_id, "invoice_sent", `Invoice ${invoice.invoice_number} sent`, userId, userName);

        revalidatePath(`/dashboard/orders/${invoice.order_id}`);
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
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        await supabase
            .from("order_events")
            .insert({
                tenant_id: tenantId,
                order_id: input.orderId,
                type: "note_added",
                message: input.message,
                user_id: userId,
                user_name: userName,
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
    orderId: string,
    type: string,
    message: string,
    userId?: string,
    userName?: string | null
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    await supabase.from("order_events").insert({
        tenant_id: tenantId,
        order_id: orderId,
        type,
        message,
        user_id: userId || null,
        user_name: userName || null,
    });
}

// ============================================================================
// DRAFT ORDER
// ============================================================================

export interface DraftOrderLineInput {
    productId: string;
    variantId?: string;
    productName: string;
    productSku?: string;
    productImage?: string;
    variantTitle?: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateDraftOrderInput {
    customerName?: string;
    customerEmail?: string;
    internalNotes?: string;
    lines: DraftOrderLineInput[];
}

export async function searchProductsForOrder(query: string) {
    const { supabase, tenantId } = await getAuthenticatedTenant();
    const { data } = await supabase
        .from("products")
        .select("id, name, sku, price, compare_at_price, images, status")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .ilike("name", `%${query}%`)
        .limit(10);
    return data ?? [];
}

export async function createDraftOrder(input: CreateDraftOrderInput): Promise<{ success: boolean; error?: string; orderId?: string }> {
    const { supabase, tenantId, userId, userName } = await getAuthenticatedTenant();

    if (!input.lines.length) return { success: false, error: "At least one item is required" };

    const subtotal = input.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const orderNumber = `DRAFT-${Date.now().toString(36).toUpperCase()}`;

    const { data: order, error } = await supabase
        .from("orders")
        .insert({
            tenant_id: tenantId,
            order_number: orderNumber,
            status: "draft",
            payment_status: "pending",
            fulfillment_status: "unfulfilled",
            subtotal,
            total: subtotal,
            items_count: input.lines.reduce((sum, l) => sum + l.quantity, 0),
            customer_name: input.customerName || null,
            customer_email: input.customerEmail || null,
            internal_notes: input.internalNotes || null,
            metadata: { created_by: userId, created_by_name: userName, source: "draft" },
        })
        .select("id")
        .single();

    if (error || !order) {
        log.error("Failed to create draft order", { error: error?.message });
        return { success: false, error: error?.message ?? "Failed to create order" };
    }

    const items = input.lines.map((l) => ({
        tenant_id: tenantId,
        order_id: order.id,
        product_id: l.productId,
        variant_id: l.variantId || null,
        product_name: l.productName,
        product_sku: l.productSku || null,
        product_image: l.productImage || null,
        variant_title: l.variantTitle || null,
        quantity: l.quantity,
        unit_price: l.unitPrice,
        total_price: l.unitPrice * l.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(items);
    if (itemsError) {
        log.error("Failed to insert draft order items", { error: itemsError.message });
        await supabase.from("orders").delete().eq("id", order.id);
        return { success: false, error: "Failed to add order items" };
    }

    revalidatePath("/dashboard/orders");
    return { success: true, orderId: order.id };
}
