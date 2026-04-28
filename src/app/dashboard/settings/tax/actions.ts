"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { eq } from "drizzle-orm";
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
    const { user } = await getAuthenticatedClient();
    if (!user.tenantId) return { settings: defaultTaxSettings(), error: "Unauthorized" };

    const [tenant] = await db.select({ priceIncludesTax: tenants.priceIncludesTax, settings: tenants.settings })
        .from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);

    if (!tenant) return { settings: defaultTaxSettings(), error: "Tenant not found" };

    const s = (tenant.settings as Record<string, unknown>)?.tax as Record<string, unknown> | undefined;
    return {
        settings: {
            priceIncludesTax: tenant.priceIncludesTax ?? false,
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

export async function updateTaxSettings(input: TaxSettings): Promise<{ success?: boolean; error?: string }> {
    const data = taxSettingsSchema.parse(input);
    const { user } = await getAuthenticatedClient();
    if (!user.tenantId) return { success: false, error: "Unauthorized" };
    if (user.role !== "owner" && user.role !== "admin") return { success: false, error: "Insufficient permissions" };

    const [tenant] = await db.select({ settings: tenants.settings })
        .from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);
    const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {};

    try {
        await db.update(tenants).set({
            priceIncludesTax: data.priceIncludesTax,
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
            } as Record<string, unknown>,
        }).where(eq(tenants.id, user.tenantId));
    } catch (err) {
        log.error("Failed to update tax settings", err);
        return { success: false, error: "Failed to update tax settings" };
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
