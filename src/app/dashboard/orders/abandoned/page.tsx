import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/auth";
import { getAbandonedCheckouts } from "./actions";
import { AbandonedCheckoutsClient } from "./abandoned-client";

export const metadata: Metadata = {
    title: "Abandoned Checkouts | Dashboard",
    description: "View and recover abandoned checkouts.",
};

export default async function AbandonedCheckoutsPage() {
    const { user, supabase } = await getAuthenticatedClient();
    if (!user) redirect("/login");

    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
    if (!userData?.tenant_id) redirect("/login");

    const [{ checkouts, stats }, { data: tenant }] = await Promise.all([
        getAbandonedCheckouts(),
        supabase.from("tenants").select("currency").eq("id", userData.tenant_id).single(),
    ]);

    return <AbandonedCheckoutsClient initialCheckouts={checkouts} initialStats={stats} currency={tenant?.currency || "USD"} />;
}
