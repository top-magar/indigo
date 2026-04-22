import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth, getCustomerCurrency } from "../_lib/queries";
import { CustomerDetailClient } from "./customer-detail-client";
import { getCustomerDetail } from "../customer-actions";

export const metadata: Metadata = {
    title: "Customer Details | Dashboard",
    description: "View and manage customer information.",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { supabase, userId } = await auth();
    const currency = await getCustomerCurrency(supabase, userId);

    const result = await getCustomerDetail(id);
    if (!result.success || !result.data) notFound();

    return <CustomerDetailClient customer={result.data} currency={currency} />;
}
