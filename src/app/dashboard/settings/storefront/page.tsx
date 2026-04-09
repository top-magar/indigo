import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStorefrontSettings } from "./actions";
import { StorefrontSettingsClient } from "./storefront-settings-client";

export const metadata: Metadata = {
  title: "Storefront Settings | Dashboard",
  description: "Configure your public storefront.",
};

export default async function StorefrontSettingsPage() {
  const { settings, error } = await getStorefrontSettings();
  if (error === "Unauthorized" || error === "No tenant") redirect("/login");

  return <StorefrontSettingsClient initialSettings={settings} />;
}
