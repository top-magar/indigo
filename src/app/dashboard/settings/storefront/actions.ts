"use server";

import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const socialLinkSchema = z.object({
  platform: z.enum(["facebook", "instagram", "tiktok", "youtube", "twitter"]),
  url: z.string().url("Invalid URL"),
});

const storefrontSchema = z.object({
  announcementBar: z.string().max(200).default(""),
  contactEmail: z.string().email().or(z.literal("")).default(""),
  contactPhone: z.string().max(30).default(""),
  footerText: z.string().max(500).default(""),
  socialLinks: z.array(socialLinkSchema).default([]),
});

export type StorefrontSettings = z.infer<typeof storefrontSchema>;

export async function getStorefrontSettings(): Promise<{
  settings: StorefrontSettings;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { settings: storefrontSchema.parse({}), error: "Unauthorized" };

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (!userData?.tenant_id) return { settings: storefrontSchema.parse({}), error: "No tenant" };

  const { data: tenant } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", userData.tenant_id)
    .single();

  if (!tenant) return { settings: storefrontSchema.parse({}), error: "Tenant not found" };

  const s = (tenant.settings as Record<string, unknown>)?.storefront as Record<string, unknown> | undefined;
  return {
    settings: {
      announcementBar: (s?.announcementBar as string) ?? "",
      contactEmail: (s?.contactEmail as string) ?? "",
      contactPhone: (s?.contactPhone as string) ?? "",
      footerText: (s?.footerText as string) ?? "",
      socialLinks: (s?.socialLinks as StorefrontSettings["socialLinks"]) ?? [],
    },
  };
}

export async function updateStorefrontSettings(formData: FormData): Promise<{ error?: string }> {
  const { user, supabase } = await getAuthenticatedClient();

  const raw = {
    announcementBar: formData.get("announcementBar") as string,
    contactEmail: formData.get("contactEmail") as string,
    contactPhone: formData.get("contactPhone") as string,
    footerText: formData.get("footerText") as string,
    socialLinks: JSON.parse((formData.get("socialLinks") as string) || "[]"),
  };

  const data = storefrontSchema.parse(raw);

  const { data: tenant } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", user.tenantId)
    .single();

  const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {};

  const { error } = await supabase
    .from("tenants")
    .update({
      settings: { ...currentSettings, storefront: data },
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.tenantId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings/storefront");
  return {};
}
