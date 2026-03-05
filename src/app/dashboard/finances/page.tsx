import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/auth";
import { getFinanceSummary } from "./actions";
import { FinancesClient } from "./finances-client";

export const metadata: Metadata = {
    title: "Finances | Dashboard",
    description: "Revenue summary, refunds, and financial overview.",
};

export default async function FinancesPage() {
    const { user } = await getAuthenticatedClient();
    if (!user) redirect("/login");

    const { summary, monthly } = await getFinanceSummary("30d");

    return <FinancesClient initialSummary={summary} initialMonthly={monthly} />;
}
