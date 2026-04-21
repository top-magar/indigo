import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getStorefrontSettings } from "@/app/dashboard/settings/storefront/actions";
import { StorefrontSettingsClient } from "@/app/dashboard/settings/storefront/storefront-settings-client";

export const metadata: Metadata = {
  title: "Theme | Dashboard",
  description: "Customize your storefront colors, fonts, and branding.",
};

export default async function ThemePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { settings, error } = await getStorefrontSettings();
  if (error === "Unauthorized" || error === "No tenant") redirect("/login");

  return (
    <div className="max-w-3xl">
      <StorefrontSettingsClient initialSettings={settings} />
    </div>
  );
}
