import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getWhatsAppSettings } from "./actions";
import { WhatsAppSettingsClient } from "./whatsapp-settings-client";

export const metadata: Metadata = {
  title: "WhatsApp Settings | Dashboard",
  description: "Configure WhatsApp notification settings.",
};

export default async function WhatsAppSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { settings, error } = await getWhatsAppSettings();
  if (error === "Unauthorized" || error === "No tenant") redirect("/login");

  return <WhatsAppSettingsClient initialSettings={settings} />;
}
