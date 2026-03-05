import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getTaxSettings } from "./actions";
import { TaxSettingsClient } from "./tax-settings-client";

export const metadata: Metadata = {
    title: "Tax Settings | Dashboard",
    description: "Configure tax rates and tax display preferences.",
};

export default async function TaxSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { settings, error } = await getTaxSettings();
    if (error === "Unauthorized" || error === "No tenant") redirect("/login");

    return <TaxSettingsClient initialSettings={settings} />;
}
