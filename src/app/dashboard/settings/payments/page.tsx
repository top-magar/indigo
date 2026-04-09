import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getPaymentSettings } from "./actions";
import { PaymentsSettingsClient } from "./payments-settings-client";

export const metadata: Metadata = {
  title: "Payment Settings | Dashboard",
  description: "Configure payment methods and bank details.",
};

export default async function PaymentsSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { settings, error } = await getPaymentSettings();
  if (error === "Unauthorized" || error === "No tenant") redirect("/login");

  return <PaymentsSettingsClient initialSettings={settings} />;
}
