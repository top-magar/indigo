"use server";

import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface PaymentSettings {
  cashOnDelivery: boolean;
  bankTransfer: boolean;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branch: string;
  esewa: boolean;
  esewamerchantCode: string;
  esewaSecret: string;
  khalti: boolean;
  khaltiSecretKey: string;
}

export async function getPaymentSettings(): Promise<{ settings: PaymentSettings; error?: string }> {
  const { user } = await getAuthenticatedClient();
  if (!user.tenantId) return { settings: defaultPaymentSettings(), error: "Unauthorized" };

  const [tenant] = await db.select({ settings: tenants.settings })
    .from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);

  if (!tenant) return { settings: defaultPaymentSettings(), error: "Tenant not found" };

  const s = (tenant.settings as Record<string, unknown>)?.payments as Record<string, unknown> | undefined;
  return {
    settings: {
      cashOnDelivery: (s?.cashOnDelivery as boolean) ?? true,
      bankTransfer: (s?.bankTransfer as boolean) ?? true,
      bankName: (s?.bankName as string) ?? "",
      accountHolderName: (s?.accountHolderName as string) ?? "",
      accountNumber: (s?.accountNumber as string) ?? "",
      branch: (s?.branch as string) ?? "",
      esewa: (s?.esewa as boolean) ?? false,
      esewamerchantCode: (s?.esewamerchantCode as string) ?? "",
      esewaSecret: s?.esewaSecret ? '••••••' + (s.esewaSecret as string).slice(-4) : '',
      khalti: (s?.khalti as boolean) ?? false,
      khaltiSecretKey: s?.khaltiSecretKey ? '••••••' + (s.khaltiSecretKey as string).slice(-4) : '',
    },
  };
}

const paymentSettingsSchema = z.object({
  cashOnDelivery: z.boolean(),
  bankTransfer: z.boolean(),
  bankName: z.string(),
  accountHolderName: z.string(),
  accountNumber: z.string(),
  branch: z.string(),
  esewa: z.boolean(),
  esewamerchantCode: z.string(),
  esewaSecret: z.string(),
  khalti: z.boolean(),
  khaltiSecretKey: z.string(),
});

export async function updatePaymentSettings(input: PaymentSettings): Promise<{ success: boolean; error?: string }> {
  const data = paymentSettingsSchema.parse(input);
  const { user } = await getAuthenticatedClient();
  if (!user.tenantId) return { success: false, error: "Unauthorized" };
  if (user.role !== "owner" && user.role !== "admin") return { success: false, error: "Insufficient permissions" };

  const [tenant] = await db.select({ settings: tenants.settings })
    .from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);
  const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {};
  const currentPayments = currentSettings.payments as Record<string, unknown> | undefined;

  try {
    await db.update(tenants).set({
      settings: {
        ...currentSettings,
        payments: {
          cashOnDelivery: data.cashOnDelivery,
          bankTransfer: data.bankTransfer,
          bankName: data.bankName,
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          branch: data.branch,
          esewa: data.esewa,
          esewamerchantCode: data.esewamerchantCode,
          esewaSecret: data.esewaSecret.startsWith('••••••') ? (currentPayments?.esewaSecret as string) ?? '' : data.esewaSecret,
          khalti: data.khalti,
          khaltiSecretKey: data.khaltiSecretKey.startsWith('••••••') ? (currentPayments?.khaltiSecretKey as string) ?? '' : data.khaltiSecretKey,
        },
      },
    }).where(eq(tenants.id, user.tenantId));
  } catch {
    return { success: false, error: "Failed to update payment settings" };
  }

  revalidatePath("/dashboard/settings/payments");
  return { success: true };
}

function defaultPaymentSettings(): PaymentSettings {
  return {
    cashOnDelivery: true,
    bankTransfer: true,
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    branch: "",
    esewa: false,
    esewamerchantCode: "",
    esewaSecret: "",
    khalti: false,
    khaltiSecretKey: "",
  };
}
