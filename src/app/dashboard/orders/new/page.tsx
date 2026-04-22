import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { DraftOrderClient } from "./draft-order-client";

export const metadata: Metadata = {
    title: "Create Order | Dashboard",
    description: "Create a draft order manually.",
};

export default async function NewOrderPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
    if (!userData?.tenant_id) redirect("/login");

    const { data: tenant } = await supabase.from("tenants").select("currency").eq("id", userData.tenant_id).single();

    return <DraftOrderClient currency={tenant?.currency ?? "USD"} />;
}
