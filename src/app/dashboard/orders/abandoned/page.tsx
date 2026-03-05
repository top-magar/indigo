import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/auth";
import { getAbandonedCheckouts } from "./actions";
import { AbandonedCheckoutsClient } from "./abandoned-client";

export const metadata: Metadata = {
    title: "Abandoned Checkouts | Dashboard",
    description: "View and recover abandoned checkouts.",
};

export default async function AbandonedCheckoutsPage() {
    const { user } = await getAuthenticatedClient();
    if (!user) redirect("/login");

    const { checkouts, stats } = await getAbandonedCheckouts();

    return <AbandonedCheckoutsClient initialCheckouts={checkouts} initialStats={stats} currency="NPR" />;
}
