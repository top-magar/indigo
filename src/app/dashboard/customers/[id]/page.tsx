import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomerDetailClient } from "./customer-detail-client";
import { getCustomerDetails } from "../actions";

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
    if (!user) redirect("/auth/login");

    const customerData = await getCustomerDetails(id);

    if (!customerData) {
        notFound();
    }

    return (
        <CustomerDetailClient
            customer={customerData.customer}
            orders={customerData.orders}
            addresses={customerData.addresses}
            stats={customerData.stats}
            currency={customerData.currency}
        />
    );
}
