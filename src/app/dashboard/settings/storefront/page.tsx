import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getStorefrontSettings } from "./actions";
import { StorefrontSettingsClient } from "./storefront-settings-client";
import { SectionBuilder } from "./section-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SectionConfig } from "@/features/store/section-registry";

export const metadata: Metadata = {
  title: "Store Appearance | Dashboard",
  description: "Customize your storefront design and layout.",
};

export default async function StorefrontSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { settings, error } = await getStorefrontSettings();
  if (error === "Unauthorized" || error === "No tenant") redirect("/login");

  // Get store slug for preview link
  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
  const { data: tenant } = await supabase.from("tenants").select("slug, settings").eq("id", userData?.tenant_id).single();
  const storeSlug = tenant?.slug ?? "";
  const sections = ((tenant?.settings as Record<string, unknown>)?.storefront as Record<string, unknown>)?.sections as SectionConfig[] ?? [];

  return (
    <Tabs defaultValue="sections" className="max-w-3xl">
      <TabsList className="mb-4">
        <TabsTrigger value="sections">Sections</TabsTrigger>
        <TabsTrigger value="branding">Branding & SEO</TabsTrigger>
      </TabsList>
      <TabsContent value="sections">
        <SectionBuilder initialSections={sections} storeSlug={storeSlug} />
      </TabsContent>
      <TabsContent value="branding">
        <StorefrontSettingsClient initialSettings={settings} />
      </TabsContent>
    </Tabs>
  );
}
