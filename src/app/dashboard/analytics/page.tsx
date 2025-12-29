import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

    const dateRange = (params.range as DateRange) || "30d";
    const validRanges: DateRange[] = ["7d", "30d", "90d", "12m", "custom"];
    const range = validRanges.includes(dateRange) ? dateRange : "30d";

    const data = await getAnalyticsData(range, params.from, params.to);
    const currency = tenant?.currency || "USD";

    return (
        <AnalyticsClient
            data={data}
            currency={currency}
            dateRange={range}
        />
    );
}
