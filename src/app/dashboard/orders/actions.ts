"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
const log = createLogger("actions:orders");

import { createClient } from "@/infrastructure/supabase/server";

const updateStatusSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    status: z.string().min(1, "Status is required"),
    note: z.string().optional().default(""),
});

const cancelOrderSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    reason: z.string().optional().default(""),
});
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { orderRepository } from "@/features/orders/repositories";
import { updateOrderStatusWorkflow, cancelOrderWorkflow } from "@/infrastructure/workflows/order";
import * as OrderService from "@/infrastructure/services/order";
import { auditLogger } from "@/infrastructure/services/audit-logger";

async function getAuthenticatedTenant() {
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, tenantId: user.tenantId, userId: user.id, userName: user.fullName };
}

/**
 * Update order status using workflow with validation
 * Validates status transitions and records history
 */
export async function updateOrderStatus(formData: FormData) {
    const raw = Object.fromEntries(formData.entries());
    const { orderId, status, note } = updateStatusSchema.parse(raw);

    const { supabase, tenantId, userId } = await getAuthenticatedTenant();

    // Fetch old status for audit log
    const { data: oldOrder } = await supabase
        .from("orders")
        .select("status, order_number")
        .eq("id", orderId)
        .eq("tenant_id", tenantId)
        .single();

    try {
        await updateOrderStatusWorkflow(tenantId, {
            orderId,
            status,
            note: note || undefined,
        });

        // Audit log - non-blocking
        try {
            await auditLogger.logOrderStatusChange(tenantId, orderId, oldOrder?.status || "unknown", status, { userId });
        } catch (auditError) {
            log.error("Audit logging failed:", auditError);
        }

        revalidatePath(`/dashboard/orders`);
        revalidatePath(`/dashboard/orders/${orderId}`);
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to update order status");
    }
}

/**
 * Cancel order using workflow
 * Restores inventory and updates status
 */
export async function cancelOrder(formData: FormData) {
    const raw = Object.fromEntries(formData.entries());
    const { orderId, reason } = cancelOrderSchema.parse(raw);

    const { tenantId } = await getAuthenticatedTenant();

    try {
        await cancelOrderWorkflow(tenantId, {
            orderId,
            reason: reason || undefined,
        });

        revalidatePath(`/dashboard/orders`);
        revalidatePath(`/dashboard/orders/${orderId}`);
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to cancel order");
    }
}

export async function updateOrderNotes(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const notes = formData.get("notes") as string;

    if (!orderId) {
        throw new Error("Order ID is required");
    }

    const { tenantId, userId, userName } = await getAuthenticatedTenant();

    try {
        // Use service to add note
        await OrderService.updateNotes(tenantId, orderId, notes);
        
        revalidatePath(`/dashboard/orders/${orderId}`);
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to update order notes");
    }
}

export async function exportOrders(filters: {
    status?: string;
    search?: string;
} = {}): Promise<{ csv?: string; error?: string }> {
    try {
        const { user, supabase } = await getAuthenticatedClient();

        let query = supabase
            .from("orders")
            .select("id, order_number, customer_name, customer_email, total, status, payment_status, created_at")
            .eq("tenant_id", user.tenantId)
            .order("created_at", { ascending: false })
            .limit(5000);

        if (filters.status) query = query.eq("status", filters.status);
        if (filters.search) {
            query = query.or(
                `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
            );
        }

        const { data: orders, error } = await query;
        if (error) return { error: error.message };

        const headers = ["Order #", "Customer", "Email", "Total", "Status", "Payment", "Date"];
        const rows = (orders || []).map(o => [
            o.order_number || o.id,
            o.customer_name || "",
            o.customer_email || "",
            Number(o.total).toFixed(2),
            o.status,
            o.payment_status,
            new Date(o.created_at).toISOString().split("T")[0],
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
        return { csv };
    } catch (err) {
        log.error("Export orders error", err);
        return { error: err instanceof Error ? err.message : "Failed to export orders" };
    }
}

export async function updateOrderTags(orderId: string, tags: string[]) {
    const { tenantId } = await getAuthenticatedTenant();

    const supabase = await createClient();
    const { error } = await supabase
        .from("orders")
        .update({ metadata: { tags } })
        .eq("id", orderId)
        .eq("tenant_id", tenantId);

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/orders/${orderId}`);
}

// Re-export from order-actions for single import path
export { generateInvoice, addOrderNote, getOrderStats, createFulfillment, createRefund, capturePayment, markAsPaid } from "./order-actions";
