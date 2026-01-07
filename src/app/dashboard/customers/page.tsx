import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
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
    const supabase = await createClient();
    const params = await searchParams;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    const { data: tenant } = await supabase
        .from("tenants")
        .select("currency")
        .eq("id", userData.tenant_id)
        .single();

    const page = parseInt(params.page || "1");
    const pageSize = parseInt(params.pageSize || "20");

    // Use repository methods for fetching customers and stats
    const { customers, stats, totalCount } = await getCustomersWithStats(
        page,
        pageSize,
        {
            search: params.search,
            marketing: params.marketing,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        }
    );

    const currency = tenant?.currency || "USD";

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
