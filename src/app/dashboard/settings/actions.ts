"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const log = createLogger("actions:settings");

const storeSettingsSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  description: z.string().optional().default(""),
  logoUrl: z.string().optional().default(""),
});

// ── Store Info ──

export async function updateStoreSettings(formData: FormData): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await getAuthenticatedClient();
    const { name, description, logoUrl } = storeSettingsSchema.parse(Object.fromEntries(formData.entries()));

    const { error } = await supabase
      .from("tenants")
      .update({
        name,
        description: description || null,
        logo_url: logoUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.tenantId);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/settings");
    return {};
  } catch (err) {
    log.error("Update store settings error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update settings" };
  }
}

// ── SEO ──

export async function updateStoreSeoSettings(formData: FormData): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await getAuthenticatedClient();

    const { data: tenant } = await supabase
      .from("tenants")
      .select("settings")
      .eq("id", user.tenantId)
      .single();

    const settings = (tenant?.settings as Record<string, unknown>) || {};
    settings.seo = {
      metaTitle: (formData.get("metaTitle") as string) || null,
      metaDescription: (formData.get("metaDescription") as string) || null,
      ogImage: (formData.get("ogImage") as string) || null,
    };
    settings.analytics = {
      googleAnalyticsId: (formData.get("googleAnalyticsId") as string) || null,
      facebookPixelId: (formData.get("facebookPixelId") as string) || null,
    };

    const { error } = await supabase
      .from("tenants")
      .update({ settings, updated_at: new Date().toISOString() })
      .eq("id", user.tenantId);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/settings");
    return {};
  } catch (err) {
    log.error("Update SEO settings error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update settings" };
  }
}
