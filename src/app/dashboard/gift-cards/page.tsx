import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/auth";
import { getGiftCards } from "./actions";
import { GiftCardsClient } from "./gift-cards-client";

export const metadata: Metadata = {
    title: "Gift Cards | Dashboard",
    description: "Manage gift cards and balances.",
};

export default async function GiftCardsPage() {
    const { user, supabase } = await getAuthenticatedClient();
    if (!user) redirect("/login");

    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
    if (!userData?.tenant_id) redirect("/login");

    const [{ cards, stats }, { data: tenant }] = await Promise.all([
        getGiftCards(),
        supabase.from("tenants").select("currency").eq("id", userData.tenant_id).single(),
    ]);

    return <GiftCardsClient initialCards={cards} initialStats={stats} currency={tenant?.currency || "USD"} />;
}
