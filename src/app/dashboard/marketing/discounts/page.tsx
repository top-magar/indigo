import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDiscounts } from "../actions";
import { DiscountsClient } from "./discounts-client";
import { DiscountsLoading } from "./loading";

export const metadata = {
    title: "Discounts | Marketing",
    description: "Manage discount codes and promotions",
};

export default async function DiscountsPage() {
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

    const { discounts } = await getDiscounts();
    const currency = tenant?.currency || "USD";

    return (
        <Suspense fallback={<DiscountsLoading />}>
            <DiscountsClient discounts={discounts} currency={currency} />
        </Suspense>
    );
}