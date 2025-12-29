"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateOrderStatusWorkflow, cancelOrderWorkflow } from "@/lib/workflows/order";

async function getAuthenticatedTenant() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { supabase, tenantId: userData.tenant_id };
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

    const { tenantId } = await getAuthenticatedTenant();

    try {
        await updateOrderStatusWorkflow(tenantId, {
            orderId,
            status,
            note: note || undefined,
        });

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

    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
        .from("orders")
        .update({
            notes,
            updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("tenant_id", tenantId);

    if (error) {
        throw new Error(`Failed to update order notes: ${error.message}`);
    }

    revalidatePath(`/dashboard/orders/${orderId}`);
}
