"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";

import { sendEmail } from "@/infrastructure/services/email/actions";
import { abandonedCartTemplate } from "@/infrastructure/services/email/templates";

const log = createLogger("orders:abandoned");

export interface AbandonedCheckout {
    id: string;
    email: string | null;
    customer_name: string | null;
    status: string;
    subtotal: string;
    total: string;
    currency: string;
    items_count: number;
    created_at: string;
    updated_at: string;
    recovery_email_sent?: boolean;
}

export interface AbandonedStats {
    total: number;
    recoverable: number;
    totalValue: number;
}

async function getTenantId() {
    const { user } = await getAuthenticatedClient();
    return user.tenantId;
}

export async function getAbandonedCheckouts(): Promise<{ checkouts: AbandonedCheckout[]; stats: AbandonedStats }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();

    // Abandoned = explicitly abandoned OR active carts older than 1 hour with email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: abandoned } = await supabase
        .from("carts")
        .select("id, email, customer_name, status, subtotal, total, currency, created_at, updated_at, metadata")
        .eq("tenant_id", tenantId)
        .or(`status.eq.abandoned,and(status.eq.active,updated_at.lt.${oneHourAgo})`)
        .order("updated_at", { ascending: false })
        .limit(100);

    const checkouts: AbandonedCheckout[] = (abandoned ?? []).map((c) => {
        const meta = c.metadata as Record<string, unknown> | null;
        // Count items via a separate query would be expensive; use 0 as placeholder
        return {
            ...c,
            items_count: 0,
            recovery_email_sent: meta?.recovery_email_sent === true,
        };
    });

    const recoverable = checkouts.filter((c) => c.email && !c.recovery_email_sent);
    const totalValue = checkouts.reduce((sum, c) => sum + parseFloat(c.total || "0"), 0);

    return {
        checkouts,
        stats: {
            total: checkouts.length,
            recoverable: recoverable.length,
            totalValue,
        },
    };
}

export async function sendRecoveryEmail(cartId: string): Promise<{ success: boolean; error?: string }> {
    const validCartId = z.string().uuid().parse(cartId);
    const supabase = await createClient();
    const tenantId = await getTenantId();

    const { data: cart } = await supabase
        .from("carts")
        .select("id, email, customer_name, total, tenant_id")
        .eq("id", validCartId)
        .eq("tenant_id", tenantId)
        .single();

    if (!cart) return { success: false, error: "Cart not found" };
    if (!cart.email) return { success: false, error: "No email address on this checkout" };

    // Fetch tenant info for branding
    const { data: tenant } = await supabase
        .from("tenants")
        .select("name, slug")
        .eq("id", tenantId)
        .single();

    if (!tenant) return { success: false, error: "Tenant not found" };

    // Fetch cart items
    const { data: items } = await supabase
        .from("cart_items")
        .select("product_name, unit_price")
        .eq("cart_id", validCartId);

    const cartUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${tenant.slug}/checkout`;
    const html = abandonedCartTemplate(
        tenant.name,
        cartUrl,
        (items ?? []).map((i: { product_name: string; unit_price: string }) => ({
            name: i.product_name,
            price: String(i.unit_price),
        }))
    );

    const emailResult = await sendEmail({
        to: cart.email,
        subject: `You left items in your cart at ${tenant.name}`,
        template: 'abandoned_cart',
        data: { html },
    });

    if (!emailResult.success) {
        log.error("Failed to send recovery email", { error: emailResult.error });
        return { success: false, error: emailResult.error };
    }

    // Mark as sent
    const { error } = await supabase
        .from("carts")
        .update({ metadata: { recovery_email_sent: true, recovery_sent_at: new Date().toISOString() } })
        .eq("id", validCartId)
        .eq("tenant_id", tenantId);

    if (error) {
        log.error("Failed to mark recovery email", { error: error.message });
    }

    log.info("Recovery email sent", { cartId: validCartId, email: cart.email });
    return { success: true };
}

export async function bulkSendRecoveryEmails(cartIds: string[]): Promise<{ success: boolean; sent: number; error?: string }> {
    const validCartIds = z.array(z.string().uuid()).min(1).parse(cartIds);
    let sent = 0;
    for (const id of validCartIds) {
        const result = await sendRecoveryEmail(id);
        if (result.success) sent++;
    }
    return { success: true, sent };
}
