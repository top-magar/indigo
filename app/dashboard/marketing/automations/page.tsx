import { Suspense } from "react";
import { getMarketingData } from "../actions";
import { AutomationsClient } from "./automations-client";
import { AutomationsLoading } from "./loading";

export const metadata = {
    title: "Automations | Marketing",
    description: "Manage email automation workflows",
};

export default async function AutomationsPage() {
    const data = await getMarketingData();
    const currency = "USD"; // TODO: Get from tenant settings

    return (
        <Suspense fallback={<AutomationsLoading />}>
            <AutomationsClient automations={data.automations} currency={currency} />
        </Suspense>
    );
}
