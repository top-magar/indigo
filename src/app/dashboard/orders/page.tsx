import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { orderRepository } from "@/features/orders/repositories";
import { OrdersClient } from "./orders-client";
import { getOrdersPageInsights } from "./ai-actions";
import type { OrderStatus, PaymentStatus } from "@/db/schema";

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
    const perPage = parseInt(params.per_page || "20");

    // Fetch orders using repository based on filters
    let repositoryOrders;
    
    if (params.search) {
        // Use search method for text search
        repositoryOrders = await orderRepository.search(tenantId, params.search, {
            limit: perPage,
            offset: page * perPage,
        });
    } else if (params.status && params.status !== "all" && !params.status.includes(",")) {
        // Use findByStatus for single status filter
        repositoryOrders = await orderRepository.findByStatus(
            tenantId, 
            params.status as OrderStatus, 
            { limit: perPage, offset: page * perPage }
        );
    } else if (params.payment && params.payment !== "all" && !params.payment.includes(",")) {
        // Use findByPaymentStatus for single payment status filter
        repositoryOrders = await orderRepository.findByPaymentStatus(
            tenantId, 
            params.payment as PaymentStatus, 
            { limit: perPage, offset: page * perPage }
        );
    } else if (params.from && params.to) {
        // Use findByDateRange for date filtering
        repositoryOrders = await orderRepository.findByDateRange(
            tenantId,
            new Date(params.from),
            new Date(params.to),
            { limit: perPage, offset: page * perPage }
        );
    } else {
        // Use findAll for default listing
        repositoryOrders = await orderRepository.findAll(tenantId, {
            limit: perPage,
            offset: page * perPage,
        });
    }

    // Transform repository data to match client expected format (snake_case)
    const ordersWithCounts: OrderRow[] = (repositoryOrders || []).map(order => ({
        id: order.id,
        order_number: order.orderNumber,
        status: order.status,
        payment_status: order.paymentStatus || "pending",
        fulfillment_status: order.fulfillmentStatus || "unfulfilled",
        customer_id: order.customerId,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        total: parseFloat(order.total || "0"),
        subtotal: parseFloat(order.subtotal || "0"),
        shipping_total: parseFloat(order.shippingTotal || "0"),
        tax_total: parseFloat(order.taxTotal || "0"),
        currency: order.currency || "USD",
        items_count: order.itemsCount || 0,
        created_at: order.createdAt.toISOString(),
        updated_at: order.updatedAt.toISOString(),
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

    // Fetch AI insights for the orders page
    const { insights: aiInsights } = await getOrdersPageInsights({
        pending: stats.pending,
        processing: stats.processing,
        revenue: stats.revenue,
        avgOrderValue: stats.avgOrderValue,
    });

    // Note: Repository doesn't return count for pagination, so we use the stats total
    // For filtered results, we use the length of returned orders as an approximation
    const totalCount = params.search || params.status || params.payment || params.from 
        ? ordersWithCounts.length + (page * perPage) // Approximation for filtered results
        : repoStats.total;

    return (
        <OrdersClient
            orders={ordersWithCounts}
            stats={stats}
            totalCount={totalCount}
            currentPage={page}
            pageSize={perPage}
            currency={currency}
            aiInsights={aiInsights}
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
