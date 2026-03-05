"use server";

import { createLogger } from "@/lib/logger";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";

const log = createLogger("finances");

export interface FinanceSummary {
    grossRevenue: number;
    refunds: number;
    netRevenue: number;
    taxCollected: number;
    shippingCollected: number;
    discountsGiven: number;
    ordersCount: number;
    avgOrderValue: number;
    currency: string;
}

export interface MonthlyBreakdown {
    month: string;
    revenue: number;
    refunds: number;
    orders: number;
}

export async function getFinanceSummary(period: "30d" | "90d" | "12m" = "30d"): Promise<{ summary: FinanceSummary; monthly: MonthlyBreakdown[] }> {
    const { user, supabase } = await getAuthenticatedClient();
    const tenantId = user.tenantId;

    const now = new Date();
    const from = new Date(now);
    if (period === "30d") from.setDate(from.getDate() - 30);
    else if (period === "90d") from.setDate(from.getDate() - 90);
    else from.setFullYear(from.getFullYear() - 1);

    const { data: tenant } = await supabase.from("tenants").select("currency").eq("id", tenantId).single();
    const currency = tenant?.currency ?? "NPR";

    // Paid orders in period
    const { data: orders } = await supabase
        .from("orders")
        .select("total, subtotal, tax_total, shipping_total, discount_total, status, payment_status, created_at")
        .eq("tenant_id", tenantId)
        .gte("created_at", from.toISOString())
        .in("payment_status", ["paid", "refunded"]);

    const rows = orders ?? [];
    const paid = rows.filter((o) => o.payment_status === "paid");
    const refunded = rows.filter((o) => o.payment_status === "refunded" || o.status === "refunded");

    const grossRevenue = paid.reduce((s, o) => s + Number(o.total || 0), 0);
    const refundTotal = refunded.reduce((s, o) => s + Number(o.total || 0), 0);
    const taxCollected = paid.reduce((s, o) => s + Number(o.tax_total || 0), 0);
    const shippingCollected = paid.reduce((s, o) => s + Number(o.shipping_total || 0), 0);
    const discountsGiven = paid.reduce((s, o) => s + Number(o.discount_total || 0), 0);

    const summary: FinanceSummary = {
        grossRevenue,
        refunds: refundTotal,
        netRevenue: grossRevenue - refundTotal,
        taxCollected,
        shippingCollected,
        discountsGiven,
        ordersCount: paid.length,
        avgOrderValue: paid.length > 0 ? grossRevenue / paid.length : 0,
        currency,
    };

    // Monthly breakdown
    const monthMap = new Map<string, { revenue: number; refunds: number; orders: number }>();
    for (const o of rows) {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthMap.get(key) ?? { revenue: 0, refunds: 0, orders: 0 };
        if (o.payment_status === "paid") {
            entry.revenue += Number(o.total || 0);
            entry.orders++;
        }
        if (o.payment_status === "refunded" || o.status === "refunded") {
            entry.refunds += Number(o.total || 0);
        }
        monthMap.set(key, entry);
    }

    const monthly = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ month, ...data }));

    return { summary, monthly };
}
