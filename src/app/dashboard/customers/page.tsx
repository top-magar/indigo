import { Metadata } from "next";
import { auth, getTenantCurrency } from "./_lib/queries";
import { CustomersClient } from "./customers-client";
import { getCustomersWithStats } from "./actions";

export const metadata: Metadata = {
    title: "Customers | Dashboard",
    description: "Manage your store customers and relationships.",
};

interface CustomersPageProps {
    searchParams: Promise<{
        page?: string;
        pageSize?: string;
        search?: string;
        marketing?: string;
        sortBy?: string;
        sortOrder?: string;
    }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
    const params = await searchParams;
    const { supabase, tenantId } = await auth();
    const currency = await getTenantCurrency(supabase, tenantId);

    const page = parseInt(params.page || "1");
    const pageSize = parseInt(params.pageSize || "20");

    const { customers, stats, totalCount } = await getCustomersWithStats(
        page, pageSize, {
            search: params.search,
            marketing: params.marketing,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        }
    );

    return (
        <CustomersClient
            customers={customers}
            stats={stats}
            totalCount={totalCount}
            currentPage={page}
            pageSize={pageSize}
            currency={currency}
            filters={{
                search: params.search,
                marketing: params.marketing,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            }}
        />
    );
}
