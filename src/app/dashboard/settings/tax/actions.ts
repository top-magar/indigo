"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const log = createLogger("settings:tax");

export interface TaxSettings {
    priceIncludesTax: boolean;
    defaultRate: number;
    taxName: string;
    registrationNumber: string;
    autoApplyToNewProducts: boolean;
    displayTaxInCart: boolean;
    taxOnShipping: boolean;
    invoicePrefix: string;
    nextInvoiceNumber: number;
}

export async function getTaxSettings(): Promise<{ settings: TaxSettings; error?: string }> {
    const { user, supabase } = await getAuthenticatedClient();
    const tenantId = user.tenantId;
    if (!tenantId) return { settings: defaultTaxSettings(), error: "Unauthorized" };

    const { data: tenant } = await supabase
        .from("tenants")
        .select("price_includes_tax, settings")
        .eq("id", tenantId)
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
            taxOnShipping: (s?.taxOnShipping as boolean) ?? false,
            invoicePrefix: (s?.invoicePrefix as string) ?? "INV-",
            nextInvoiceNumber: (s?.nextInvoiceNumber as number) ?? 1,
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
    taxOnShipping: z.boolean(),
    invoicePrefix: z.string(),
    nextInvoiceNumber: z.number().min(1),
});

export async function updateTaxSettings(input: TaxSettings): Promise<{ success: boolean; error?: string }> {
    const data = taxSettingsSchema.parse(input);
    const { user, supabase } = await getAuthenticatedClient();
    const tenantId = user.tenantId;
    if (!tenantId) return { success: false, error: "Unauthorized" };
    if (user.role !== "owner" && user.role !== "admin") return { success: false, error: "Insufficient permissions" };

    // Get current settings to merge
    const { data: tenant } = await supabase.from("tenants").select("settings").eq("id", tenantId).single();
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
                    taxOnShipping: data.taxOnShipping,
                    invoicePrefix: data.invoicePrefix,
                    nextInvoiceNumber: data.nextInvoiceNumber,
                },
            },
        })
        .eq("id", tenantId);

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
        taxOnShipping: false,
        invoicePrefix: "INV-",
        nextInvoiceNumber: 1,
    };
}
