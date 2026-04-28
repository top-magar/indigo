"use server";

import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const log = createLogger("actions:checkout-settings");

export async function updateCheckoutSettings(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const { user } = await getAuthenticatedClient();

    if (!['owner', 'admin'].includes(user.role)) return { success: false, error: 'Unauthorized' };

    const [tenant] = await db.select({ settings: tenants.settings })
      .from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);

    const safeUrl = (v: FormDataEntryValue | null) => {
      const s = (v as string)?.trim();
      if (!s) return null;
      try { const u = new URL(s); return ['http:', 'https:'].includes(u.protocol) ? s : null; } catch { return null; }
    };

    const settings = (tenant?.settings as Record<string, unknown>) || {};
    settings.checkout = {
      guestCheckout: formData.get("guestCheckout") === "true",
      requirePhone: formData.get("requirePhone") === "true",
      requireCompany: formData.get("requireCompany") === "true",
      orderNotes: formData.get("orderNotes") === "true",
      minimumOrderAmount: Number(formData.get("minimumOrderAmount")) || 0,
      autoCancelHours: Number(formData.get("autoCancelHours")) || 0,
      thankYouMessage: (formData.get("thankYouMessage") as string) || null,
      estimatedDeliveryDays: (formData.get("estimatedDeliveryDays") as string) || null,
      termsUrl: (formData.get("termsUrl") as string) || null,
      privacyUrl: (formData.get("privacyUrl") as string) || null,
      refundPolicy: (formData.get("refundPolicy") as string) || null,
    };

    await db.update(tenants).set({
      settings,
      updatedAt: new Date(),
    }).where(eq(tenants.id, user.tenantId));

    revalidatePath("/dashboard/settings/checkout");
    return { success: true };
  } catch (err) {
    log.error("Update checkout settings error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update settings" };
  }
}
