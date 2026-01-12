import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { CustomerDetailClient } from "./customer-detail-client";
import { getCustomerDetail } from "../customer-actions";

export const metadata: Metadata = {
    title: "Customer Details | Dashboard",
    description: "View and manage customer information.",
};

interface CustomerDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Get tenant currency
    const { data: userData } = await supabase
        .from("users")
        .select("tenants(currency)")
        .eq("id", user.id)
        .single();

    const currency = (userData?.tenants as { currency?: string } | null)?.currency || "USD";

    const result = await getCustomerDetail(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const customer = result.data;

    return (
        <CustomerDetailClient
            customer={customer}
            currency={currency}
        />
    );
}
