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
  // Theme
  theme: z.enum(["minimal", "bold", "classic", "modern", "nepal"]).default("minimal"),
  // Branding
  primaryColor: z.string().default("#3b82f6"),
  secondaryColor: z.string().default("#8b5cf6"),
  backgroundColor: z.string().default("#ffffff"),
  headingFont: z.enum(["Inter", "Poppins", "Playfair Display", "Montserrat", "Roboto"]).default("Inter"),
  bodyFont: z.enum(["Inter", "Roboto", "Open Sans", "Lato", "Nunito"]).default("Inter"),
  logoUrl: z.string().default(""),
  faviconUrl: z.string().default(""),
  // Hero
  heroTitle: z.string().max(100).default(""),
  heroSubtitle: z.string().max(200).default(""),
  heroImageUrl: z.string().default(""),
  heroCta: z.string().max(30).default("Shop Now"),
  // Content
  announcementBar: z.string().max(200).default(""),
  contactEmail: z.string().email().or(z.literal("")).default(""),
  contactPhone: z.string().max(30).default(""),
  footerText: z.string().max(500).default(""),
  socialLinks: z.array(socialLinkSchema).default([]),
  // SEO
  seoTitle: z.string().max(60).default(""),
  seoDescription: z.string().max(160).default(""),
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
    settings: storefrontSchema.parse(s ?? {}),
  };
}

export async function updateStorefrontSettings(formData: FormData): Promise<{ error?: string }> {
  const { user, supabase } = await getAuthenticatedClient();

  const raw = {
    theme: formData.get("theme") as string,
    primaryColor: formData.get("primaryColor") as string,
    secondaryColor: formData.get("secondaryColor") as string,
    backgroundColor: formData.get("backgroundColor") as string,
    headingFont: formData.get("headingFont") as string,
    bodyFont: formData.get("bodyFont") as string,
    logoUrl: formData.get("logoUrl") as string,
    faviconUrl: formData.get("faviconUrl") as string,
    heroTitle: formData.get("heroTitle") as string,
    heroSubtitle: formData.get("heroSubtitle") as string,
    heroImageUrl: formData.get("heroImageUrl") as string,
    heroCta: formData.get("heroCta") as string,
    announcementBar: formData.get("announcementBar") as string,
    contactEmail: formData.get("contactEmail") as string,
    contactPhone: formData.get("contactPhone") as string,
    footerText: formData.get("footerText") as string,
    socialLinks: JSON.parse((formData.get("socialLinks") as string) || "[]"),
    seoTitle: formData.get("seoTitle") as string,
    seoDescription: formData.get("seoDescription") as string,
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

// ── Section Builder ──

import type { SectionConfig } from "@/features/store/section-registry"

export async function saveSections(sections: SectionConfig[]): Promise<{ error?: string }> {
  const { user, supabase } = await getAuthenticatedClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", user.tenantId)
    .single()

  const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {}
  const currentStorefront = (currentSettings.storefront as Record<string, unknown>) ?? {}

  const { error } = await supabase
    .from("tenants")
    .update({
      settings: {
        ...currentSettings,
        storefront: { ...currentStorefront, sections },
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.tenantId)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/settings/storefront")
  revalidatePath(`/store/`)
  return {}
}
