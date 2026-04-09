"use server";

import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const log = createLogger("actions:checkout-settings");

export async function updateCheckoutSettings(formData: FormData): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await getAuthenticatedClient();

    const { data: tenant } = await supabase
      .from("tenants")
      .select("settings")
      .eq("id", user.tenantId)
      .single();

    const settings = (tenant?.settings as Record<string, unknown>) || {};
    settings.checkout = {
      guestCheckout: formData.get("guestCheckout") === "true",
      requirePhone: formData.get("requirePhone") === "true",
      requireCompany: formData.get("requireCompany") === "true",
      orderNotes: formData.get("orderNotes") === "true",
      termsUrl: (formData.get("termsUrl") as string) || null,
      privacyUrl: (formData.get("privacyUrl") as string) || null,
      refundPolicy: (formData.get("refundPolicy") as string) || null,
    };

    const { error } = await supabase
      .from("tenants")
      .update({ settings, updated_at: new Date().toISOString() })
      .eq("id", user.tenantId);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/settings/checkout");
    return {};
  } catch (err) {
    log.error("Update checkout settings error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update settings" };
  }
}
