"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function updateOrderStatus(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as string;
    const note = formData.get("note") as string | null;

    if (!orderId || !status) {
        throw new Error("Order ID and status are required");
    }

    const { supabase, tenantId } = await getAuthenticatedTenant();

    // Update the order status
    const { error: updateError } = await supabase
        .from("orders")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("tenant_id", tenantId);

    if (updateError) {
        throw new Error(`Failed to update order status: ${updateError.message}`);
    }

    // Optionally record status history if you have that table
    // await supabase.from("order_status_history").insert({
    //     tenant_id: tenantId,
    //     order_id: orderId,
    //     status,
    //     note: note || null,
    // });

    revalidatePath(`/dashboard/orders`);
    revalidatePath(`/dashboard/orders/${orderId}`);
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
