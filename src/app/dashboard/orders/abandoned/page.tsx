import { Metadata } from "next";
import { AbandonedCheckoutsClient } from "./abandoned-client";
import { getAbandonedCheckouts } from "./actions";
import { auth, getTenantCurrency } from "../_lib/queries";

export const metadata: Metadata = {
    title: "Abandoned Carts | Dashboard",
    description: "View and recover abandoned checkouts.",
};

export default async function AbandonedCheckoutsPage() {
    const { supabase, tenantId } = await auth();

    const [currency, { checkouts, stats }] = await Promise.all([
        getTenantCurrency(supabase, tenantId),
        getAbandonedCheckouts(),
    ]);

    return <AbandonedCheckoutsClient initialCheckouts={checkouts} initialStats={stats} currency={currency} />;
}
