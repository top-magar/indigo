"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";

const log = createLogger("settings:tax");

export interface TaxSettings {
    priceIncludesTax: boolean;
    defaultRate: number;
    taxName: string;
    registrationNumber: string;
    autoApplyToNewProducts: boolean;
    displayTaxInCart: boolean;
}

export async function getTaxSettings(): Promise<{ settings: TaxSettings; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { settings: defaultTaxSettings(), error: "Unauthorized" };

    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
    if (!userData?.tenant_id) return { settings: defaultTaxSettings(), error: "No tenant" };

    const { data: tenant } = await supabase
        .from("tenants")
        .select("price_includes_tax, settings")
        .eq("id", userData.tenant_id)
        .single();

    if (!tenant) return { settings: defaultTaxSettings(), error: "Tenant not found" };

    const s = (tenant.settings as Record<string, unknown>)?.tax as Record<string, unknown> | undefined;
    return {
        settings: {
            priceIncludesTax: tenant.price_includes_tax ?? false,
            defaultRate: (s?.defaultRate as number) ?? 13,
            taxName: (s?.taxName as string) ?? "VAT",
            registrationNumber: (s?.registrationNumber as string) ?? "",
            autoApplyToNewProducts: (s?.autoApplyToNewProducts as boolean) ?? true,
            displayTaxInCart: (s?.displayTaxInCart as boolean) ?? true,
        },
    };
}

const taxSettingsSchema = z.object({
    priceIncludesTax: z.boolean(),
    defaultRate: z.number().min(0).max(100),
    taxName: z.string().min(1),
    registrationNumber: z.string(),
    autoApplyToNewProducts: z.boolean(),
    displayTaxInCart: z.boolean(),
});

export async function updateTaxSettings(input: TaxSettings): Promise<{ success: boolean; error?: string }> {
    const data = taxSettingsSchema.parse(input);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: userData } = await supabase.from("users").select("tenant_id, role").eq("id", user.id).single();
    if (!userData?.tenant_id) return { success: false, error: "No tenant" };
    if (userData.role !== "owner" && userData.role !== "admin") return { success: false, error: "Insufficient permissions" };

    // Get current settings to merge
    const { data: tenant } = await supabase.from("tenants").select("settings").eq("id", userData.tenant_id).single();
    const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {};

    const { error } = await supabase
        .from("tenants")
        .update({
            price_includes_tax: data.priceIncludesTax,
            settings: {
                ...currentSettings,
                tax: {
                    defaultRate: data.defaultRate,
                    taxName: data.taxName,
                    registrationNumber: data.registrationNumber,
                    autoApplyToNewProducts: data.autoApplyToNewProducts,
                    displayTaxInCart: data.displayTaxInCart,
                },
            },
        })
        .eq("id", userData.tenant_id);

    if (error) {
        log.error("Failed to update tax settings", { error: error.message });
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/settings/tax");
    return { success: true };
}

function defaultTaxSettings(): TaxSettings {
    return {
        priceIncludesTax: false,
        defaultRate: 13,
        taxName: "VAT",
        registrationNumber: "",
        autoApplyToNewProducts: true,
        displayTaxInCart: true,
    };
}
