import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { orderRepository } from "@/features/orders/repositories";
import { OrdersClient } from "./orders-client";

export const metadata: Metadata = {
    title: "Orders | Dashboard",
    description: "Manage and track your store orders.",
};

import type { OrderRow } from "./types";

interface SearchParams {
    status?: string;
    payment?: string;
    search?: string;
    page?: string;
    per_page?: string;
    pageSize?: string;
    sort?: string;
    order?: string;
    from?: string;
    to?: string;
}

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const supabase = await createClient();
    
    // Authentication check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/login");

    const tenantId = userData.tenant_id;

    // Get tenant currency
    const { data: tenant } = await supabase
        .from("tenants")
        .select("currency")
        .eq("id", tenantId)
        .single();

    const currency = tenant?.currency || "USD";

    // Parse pagination params
    const page = parseInt(params.page || "1") - 1;
    const perPage = parseInt(params.pageSize || params.per_page || "20");

    // Build combined filter query using Supabase (supports all filters simultaneously)
    let query = supabase
        .from("orders")
        .select("*, order_items(id)", { count: "exact" })
        .eq("tenant_id", tenantId)
        .order(params.sort || "created_at", { ascending: params.order === "asc" })
        .range(page * perPage, (page + 1) * perPage - 1);

    if (params.search) {
        query = query.or(`order_number.ilike.%${params.search}%,customer_name.ilike.%${params.search}%,customer_email.ilike.%${params.search}%`);
    }
    if (params.status && params.status !== "all") {
        const statuses = params.status.split(",");
        query = statuses.length === 1 ? query.eq("status", statuses[0]) : query.in("status", statuses);
    }
    if (params.payment && params.payment !== "all") {
        const payments = params.payment.split(",");
        query = payments.length === 1 ? query.eq("payment_status", payments[0]) : query.in("payment_status", payments);
    }
    if (params.from) query = query.gte("created_at", params.from);
    if (params.to) query = query.lte("created_at", params.to);

    const { data: rawOrders, count } = await query;

    // Transform to client format
    const ordersWithCounts: OrderRow[] = (rawOrders || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status || "pending",
        fulfillment_status: order.fulfillment_status || "unfulfilled",
        customer_id: order.customer_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        total: parseFloat(order.total || "0"),
        subtotal: parseFloat(order.subtotal || "0"),
        shipping_total: parseFloat(order.shipping_total || "0"),
        tax_total: parseFloat(order.tax_total || "0"),
        currency: order.currency || "USD",
        items_count: Array.isArray(order.order_items) ? order.order_items.length : 0,
        created_at: order.created_at,
        updated_at: order.updated_at,
    }));

    // Get stats using repository
    const repoStats = await orderRepository.getStats(tenantId);

    // Transform stats to match client expected format
    const stats = {
        total: repoStats.total,
        pending: repoStats.pending,
        processing: repoStats.processing + repoStats.confirmed,
        shipped: repoStats.shipped,
        completed: repoStats.delivered,
        cancelled: repoStats.cancelled,
        revenue: repoStats.totalRevenue,
        unpaid: repoStats.unpaidCount,
        // AI-enhanced stats
        avgOrderValue: repoStats.total > 0 ? repoStats.totalRevenue / repoStats.total : 0,
        conversionRate: 0, // Would need additional data to calculate
        repeatCustomerRate: 0, // Would need additional data to calculate
    };

    const totalCount = count ?? repoStats.total;

    return (
        <OrdersClient
            orders={ordersWithCounts}
            stats={stats}
            totalCount={totalCount}
            currentPage={page + 1}
            pageSize={perPage}
            currency={currency}
            filters={{
                status: params.status,
                payment: params.payment,
                search: params.search,
                from: params.from,
                to: params.to,
            }}
        />
    );
}
