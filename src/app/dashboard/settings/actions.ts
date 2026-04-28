"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

const log = createLogger("actions:settings");

const storeSettingsSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  description: z.string().optional().default(""),
  logoUrl: z.string().optional().default(""),
});

// ── Store Info ──

export async function updateStoreSettings(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const { user } = await getAuthenticatedClient();

    if (!['owner', 'admin'].includes(user.role)) return { success: false, error: 'Unauthorized' };

    const { name, description, logoUrl } = storeSettingsSchema.parse(Object.fromEntries(formData.entries()));

    await db
      .update(tenants)
      .set({
        name,
        description: description || null,
        logoUrl: logoUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, user.tenantId));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    log.error("Update store settings error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update settings" };
  }
}

// ── SEO ──

export async function updateStoreSeoSettings(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const { user } = await getAuthenticatedClient();

    if (!['owner', 'admin'].includes(user.role)) return { success: false, error: 'Unauthorized' };

    const [existing] = await db
      .select({ settings: tenants.settings })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

    const settings = (existing?.settings as Record<string, unknown>) || {};
    settings.seo = {
      metaTitle: (formData.get("metaTitle") as string) || null,
      metaDescription: (formData.get("metaDescription") as string) || null,
    };

    await db
      .update(tenants)
      .set({ settings, updatedAt: new Date() })
      .where(eq(tenants.id, user.tenantId));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    log.error("Update SEO settings error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update settings" };
  }
}

// ── Currency ──

import { isValidCurrency } from "@/shared/currency";

const currencySettingsSchema = z.object({
  currency: z.string().min(1),
  displayCurrency: z.string().min(1),
  priceIncludesTax: z.boolean(),
});

export async function updateCurrencySettings(
  input: { currency: string; displayCurrency: string; priceIncludesTax: boolean }
): Promise<{ success?: boolean; error?: string }> {
  try {
    const data = currencySettingsSchema.parse(input);
    const { user } = await getAuthenticatedClient();

    if (!['owner', 'admin'].includes(user.role)) return { success: false, error: 'Unauthorized' };

    if (!isValidCurrency(data.currency)) return { success: false, error: `Invalid currency: ${data.currency}` };
    if (!isValidCurrency(data.displayCurrency)) return { success: false, error: `Invalid display currency: ${data.displayCurrency}` };

    await db
      .update(tenants)
      .set({
        currency: data.currency,
        displayCurrency: data.displayCurrency,
        priceIncludesTax: data.priceIncludesTax,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, user.tenantId));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    log.error("Update currency settings error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update settings" };
  }
}
