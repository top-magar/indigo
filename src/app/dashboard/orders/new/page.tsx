import { Metadata } from "next";
import { DraftOrderClient } from "./draft-order-client";
import { auth, getTenantCurrency } from "../_lib/queries";

export const metadata: Metadata = {
    title: "Create Order | Dashboard",
    description: "Create a draft order manually.",
};

export default async function NewOrderPage() {
    const { supabase, tenantId } = await auth();
    const currency = await getTenantCurrency(supabase, tenantId);

    return <DraftOrderClient currency={currency} />;
}
