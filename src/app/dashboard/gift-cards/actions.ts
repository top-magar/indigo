"use server";

import { createLogger } from "@/lib/logger";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const log = createLogger("gift-cards");

export interface GiftCard {
    id: string;
    code: string;
    initial_balance: number;
    current_balance: number;
    currency: string;
    is_active: boolean;
    customer_name: string | null;
    customer_email: string | null;
    note: string | null;
    expires_at: string | null;
    created_at: string;
}

export interface GiftCardStats {
    total: number;
    active: number;
    totalIssued: number;
    totalRemaining: number;
}

async function getAuth() {
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, tenantId: user.tenantId };
}

function generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const segments = Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    );
    return segments.join("-");
}

export async function getGiftCards(): Promise<{ cards: GiftCard[]; stats: GiftCardStats }> {
    const { supabase, tenantId } = await getAuth();

    const { data, error } = await supabase
        .from("gift_cards")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(200);

    if (error) {
        // Table may not exist yet — return empty
        log.warn("Gift cards query failed (table may not exist)", { error: error.message });
        return { cards: [], stats: { total: 0, active: 0, totalIssued: 0, totalRemaining: 0 } };
    }

    const cards: GiftCard[] = data ?? [];
    const active = cards.filter((c) => c.is_active && c.current_balance > 0);

    return {
        cards,
        stats: {
            total: cards.length,
            active: active.length,
            totalIssued: cards.reduce((s, c) => s + (c.initial_balance ?? 0), 0),
            totalRemaining: cards.reduce((s, c) => s + (c.current_balance ?? 0), 0),
        },
    };
}

export async function createGiftCard(input: {
    initialBalance: number;
    customerName?: string;
    customerEmail?: string;
    note?: string;
    expiresAt?: string;
}): Promise<{ success: boolean; error?: string; card?: GiftCard }> {
    const { supabase, tenantId } = await getAuth();

    if (input.initialBalance <= 0) return { success: false, error: "Balance must be greater than 0" };

    const code = generateCode();

    const { data, error } = await supabase
        .from("gift_cards")
        .insert({
            tenant_id: tenantId,
            code,
            initial_balance: input.initialBalance,
            current_balance: input.initialBalance,
            currency: "NPR",
            is_active: true,
            customer_name: input.customerName || null,
            customer_email: input.customerEmail || null,
            note: input.note || null,
            expires_at: input.expiresAt || null,
        })
        .select()
        .single();

    if (error) {
        log.error("Failed to create gift card", { error: error.message });
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/gift-cards");
    return { success: true, card: data };
}

export async function toggleGiftCardStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuth();

    const { error } = await supabase
        .from("gift_cards")
        .update({ is_active: isActive })
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/gift-cards");
    return { success: true };
}
