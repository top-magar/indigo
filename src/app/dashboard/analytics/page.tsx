import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { AnalyticsClient } from "./analytics-client";
import { getAnalyticsData, type DateRange } from "./actions";

export const metadata: Metadata = {
    title: "Analytics | Dashboard",
    description: "Track your store performance and insights.",
};

interface AnalyticsPageProps {
    searchParams: Promise<{
        range?: string;
        from?: string;
        to?: string;
    }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
    const supabase = await createClient();
    const params = await searchParams;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/login");

    const { data: tenant } = await supabase
        .from("tenants")
        .select("currency, plan_type")
        .eq("id", userData.tenant_id)
        .single();

    const planType = tenant?.plan_type || "free";
    const isFreeTier = planType === "free";
    
    // Free tier users are limited to 7 days of analytics
    const requestedRange = (params.range as DateRange) || "30d";
    const validRanges: DateRange[] = ["today", "7d", "30d", "90d", "year", "12m", "custom"];
    const range = isFreeTier ? "7d" : (validRanges.includes(requestedRange) ? requestedRange : "30d");

    const data = await getAnalyticsData(range, params.from, params.to);
    const currency = tenant?.currency || "USD";

    return (
        <AnalyticsClient
            data={data}
            currency={currency}
            dateRange={range}
            isFreeTier={isFreeTier}
        />
    );
}
