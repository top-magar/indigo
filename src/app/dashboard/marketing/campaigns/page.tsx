import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { CampaignsClient } from "./campaigns-client";
import type { Campaign, CustomerSegment } from "../types";

export const metadata: Metadata = {
    title: "Campaigns | Dashboard",
    description: "Manage your marketing campaigns",
};

export default async function CampaignsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
    if (!userData?.tenant_id) redirect("/login");

    const { data: tenant } = await supabase.from("tenants").select("currency").eq("id", userData.tenant_id).single();
    const currency = tenant?.currency || "USD";

    // Fetch campaigns — table may not exist yet
    let campaigns: Campaign[] = [];
    let segments: CustomerSegment[] = [];
    try {
        const { data } = await supabase
            .from("campaigns")
            .select("*")
            .eq("tenant_id", userData.tenant_id)
            .order("created_at", { ascending: false });
        if (data) campaigns = data as unknown as Campaign[];

        const { data: segData } = await supabase
            .from("customer_segments")
            .select("*")
            .eq("tenant_id", userData.tenant_id);
        if (segData) segments = segData as unknown as CustomerSegment[];
    } catch {
        // Tables don't exist yet — show empty state
    }

    return <CampaignsClient campaigns={campaigns} segments={segments} currency={currency} />;
}
