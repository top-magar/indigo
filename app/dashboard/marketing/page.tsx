import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketingClient } from "./marketing-client";
import { getMarketingData } from "./actions";

export const metadata: Metadata = {
    title: "Marketing | Dashboard",
    description: "Manage campaigns, discounts, and promotions for your store.",
};

export default async function MarketingPage() {
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

    const data = await getMarketingData();
    const currency = tenant?.currency || "USD";

    return <MarketingClient data={data} currency={currency} />;
}
