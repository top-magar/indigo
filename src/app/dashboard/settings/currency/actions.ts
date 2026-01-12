"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidCurrency } from "@/shared/currency";

interface UpdateCurrencySettingsInput {
  currency: string;
  displayCurrency: string;
  priceIncludesTax: boolean;
}

export async function updateCurrencySettings(
  input: UpdateCurrencySettingsInput
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }

    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id, role")
      .eq("id", user.id)
      .single();

    if (!userData?.tenant_id) {
      redirect("/login");
    }

    // Only owners and admins can update currency settings
    if (userData.role !== "owner" && userData.role !== "admin") {
      return { error: "You don't have permission to update currency settings" };
    }

    // Validate currencies
    if (!isValidCurrency(input.currency)) {
      return { error: `Invalid currency: ${input.currency}` };
    }

    if (!isValidCurrency(input.displayCurrency)) {
      return { error: `Invalid display currency: ${input.displayCurrency}` };
    }

    // Update tenant settings
    const { error } = await supabase
      .from("tenants")
      .update({
        currency: input.currency,
        display_currency: input.displayCurrency,
        price_includes_tax: input.priceIncludesTax,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.tenant_id);

    if (error) {
      return { error: `Failed to update currency settings: ${error.message}` };
    }

    revalidatePath("/dashboard/settings/currency");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");

    return {};
  } catch (err) {
    console.error("Update currency settings error:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to update settings",
    };
  }
}
