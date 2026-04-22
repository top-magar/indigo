import { Metadata } from "next";
import { OrdersClient } from "./orders-client";
import { auth, getTenantCurrency, getOrders, getOrderStats } from "./_lib/queries";

export const metadata: Metadata = {
    title: "Orders | Dashboard",
    description: "Manage and track your store orders.",
};

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | undefined>>;
}) {
    const params = await searchParams;
    const { supabase, tenantId } = await auth();

    const [currency, { orders, totalCount }, stats] = await Promise.all([
        getTenantCurrency(supabase, tenantId),
        getOrders(tenantId, supabase, params),
        getOrderStats(tenantId, supabase),
    ]);

    const page = parseInt(params.page || "1");
    const pageSize = parseInt(params.pageSize || "20");

    return (
        <OrdersClient
            orders={orders}
            stats={stats}
            totalCount={totalCount}
            currentPage={page}
            pageSize={pageSize}
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
