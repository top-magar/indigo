import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrdersClient } from "./orders-client";

export const metadata: Metadata = {
    title: "Orders | Indigo Dashboard",
    description: "Manage and track your store orders.",
};

// Types
interface OrderRow {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
    customer_id: string | null;
    customer_name: string | null;
    customer_email: string | null;
    total: number;
    subtotal: number;
    shipping_total: number;
    tax_total: number;
    currency: string;
    items_count: number;
    created_at: string;
    updated_at: string;
}

interface SearchParams {
    status?: string;
    payment?: string;
    search?: string;
    page?: string;
    per_page?: string;
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
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

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
    const perPage = parseInt(params.per_page || "20");
    const sortBy = params.sort || "created_at";
    const sortOrder = params.order === "asc" ? true : false;

    // Build query
    let query = supabase
        .from("orders")
        .select("id, order_number, status, payment_status, fulfillment_status, customer_id, customer_name, customer_email, total, subtotal, shipping_total, tax_total, currency, created_at, updated_at", { count: "exact" })
        .eq("tenant_id", tenantId);

    // Apply filters
    if (params.status && params.status !== "all") {
        const statuses = params.status.split(",");
        query = query.in("status", statuses);
    }

    if (params.payment && params.payment !== "all") {
        const payments = params.payment.split(",");
        query = query.in("payment_status", payments);
    }

    if (params.search) {
        query = query.or(`order_number.ilike.%${params.search}%,customer_name.ilike.%${params.search}%,customer_email.ilike.%${params.search}%`);
    }

    if (params.from) {
        query = query.gte("created_at", params.from);
    }

    if (params.to) {
        query = query.lte("created_at", params.to);
    }

    // Apply sorting and pagination
    query = query
        .order(sortBy, { ascending: sortOrder })
        .range(page * perPage, (page + 1) * perPage - 1);

    const { data: orders, count } = await query;

    // Get order items count for each order
    const orderIds = (orders || []).map(o => o.id);
    const { data: itemCounts } = orderIds.length > 0 
        ? await supabase
            .from("order_items")
            .select("order_id")
            .in("order_id", orderIds)
        : { data: [] };

    // Count items per order
    const itemCountMap: Record<string, number> = {};
    (itemCounts || []).forEach(item => {
        itemCountMap[item.order_id] = (itemCountMap[item.order_id] || 0) + 1;
    });

    // Merge item counts
    const ordersWithCounts: OrderRow[] = (orders || []).map(order => ({
        ...order,
        items_count: itemCountMap[order.id] || 0,
    }));

    // Calculate stats (unfiltered for overview)
    const { data: allOrders } = await supabase
        .from("orders")
        .select("status, payment_status, total")
        .eq("tenant_id", tenantId);

    const stats = {
        total: allOrders?.length || 0,
        pending: allOrders?.filter(o => o.status === "pending").length || 0,
        processing: allOrders?.filter(o => o.status === "processing" || o.status === "confirmed").length || 0,
        shipped: allOrders?.filter(o => o.status === "shipped").length || 0,
        completed: allOrders?.filter(o => o.status === "completed" || o.status === "delivered").length || 0,
        cancelled: allOrders?.filter(o => o.status === "cancelled" || o.status === "refunded").length || 0,
        revenue: allOrders?.filter(o => o.payment_status === "paid").reduce((sum, o) => sum + Number(o.total), 0) || 0,
        unpaid: allOrders?.filter(o => o.payment_status === "pending").reduce((sum, o) => sum + Number(o.total), 0) || 0,
    };

    return (
        <OrdersClient
            orders={ordersWithCounts}
            stats={stats}
            totalCount={count || 0}
            currentPage={page}
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
