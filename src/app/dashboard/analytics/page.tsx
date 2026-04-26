import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTenantPlanLimits } from "@/lib/plan-limits";
import { AnalyticsClient } from "./analytics-client";
import { getAnalyticsData } from "./actions";
import { Lock } from "lucide-react";
import Link from "next/link";
import type { DateRange } from "./types";

export const metadata: Metadata = {
    title: "Analytics | Dashboard",
    description: "Track your store performance and insights.",
};

interface AnalyticsPageProps {
    searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
    const user = await requireUser();
    const limits = await getTenantPlanLimits(user.tenantId);
    const params = await searchParams;

    const planName = limits.planName;
    const isFreeTier = planName === "Free";
    const isProTier = planName === "Pro";

    // Free tier: no analytics — show upgrade prompt
    if (isFreeTier) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="size-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-semibold tracking-tight">Analytics requires a paid plan</h2>
                    <p className="text-xs text-muted-foreground mt-1">Upgrade to Growth to see revenue charts, top products, and order insights.</p>
                </div>
                <Link href="/dashboard/settings/billing" className="text-xs font-medium underline hover:no-underline">
                    View plans →
                </Link>
            </div>
        );
    }

    // Growth: 30d max, Pro: unlimited
    const requestedRange = (params.range as DateRange) || "30d";
    const validRanges: DateRange[] = ["today", "7d", "30d", "90d", "year", "12m", "custom"];
    const maxRange = isProTier ? requestedRange : (["today", "7d", "30d"].includes(requestedRange) ? requestedRange : "30d");
    const range = validRanges.includes(maxRange as DateRange) ? maxRange as DateRange : "30d";

    const data = await getAnalyticsData(range, params.from, params.to);

    return (
        <AnalyticsClient
            data={data}
            currency={limits.planName === "Free" ? "NPR" : "NPR"}
            dateRange={range}
            isFreeTier={false}
            isProTier={isProTier}
        />
    );
}
