import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaigns, getSegments } from "../actions";
import { CampaignsClient } from "./campaigns-client";
import { CampaignsLoading } from "./loading";

export const metadata = {
    title: "Campaigns | Marketing",
    description: "Manage email marketing campaigns",
};

export default async function CampaignsPage() {
    const supabase = await createClient();

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

    const { campaigns } = await getCampaigns();
    const { segments } = await getSegments();
    const currency = tenant?.currency || "USD";

    return (
        <Suspense fallback={<CampaignsLoading />}>
            <CampaignsClient 
                campaigns={campaigns} 
                segments={segments}
                currency={currency} 
            />
        </Suspense>
    );
}
