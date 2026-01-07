"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { orderRepository } from "@/features/orders/repositories";
import { updateOrderStatusWorkflow, cancelOrderWorkflow } from "@/infrastructure/workflows/order";
import { auditLogger } from "@/infrastructure/services/audit-logger";

async function getAuthenticatedTenant() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, name")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { supabase, userId: user.id, userName: userData.name, tenantId: userData.tenant_id };
}

/**
 * Update order status using workflow with validation
 * Validates status transitions and records history
 */
export async function updateOrderStatus(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as string;
    const note = formData.get("note") as string | null;

    if (!orderId || !status) {
        throw new Error("Order ID and status are required");
    }

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
            console.error("Audit logging failed:", auditError);
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
    const orderId = formData.get("orderId") as string;
    const reason = formData.get("reason") as string | null;

    if (!orderId) {
        throw new Error("Order ID is required");
    }

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
        // Use repository to add note
        await orderRepository.addNote(tenantId, orderId, notes, userId, userName || undefined);
        
        revalidatePath(`/dashboard/orders/${orderId}`);
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to update order notes");
    }
}
