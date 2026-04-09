"use server";

import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";

export interface PaymentSettings {
  cashOnDelivery: boolean;
  bankTransfer: boolean;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branch: string;
}

export async function getPaymentSettings(): Promise<{ settings: PaymentSettings; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { settings: defaultPaymentSettings(), error: "Unauthorized" };

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
  if (!userData?.tenant_id) return { settings: defaultPaymentSettings(), error: "No tenant" };

  const { data: tenant } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", userData.tenant_id)
    .single();

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
});

export async function updatePaymentSettings(input: PaymentSettings): Promise<{ success: boolean; error?: string }> {
  const data = paymentSettingsSchema.parse(input);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: userData } = await supabase.from("users").select("tenant_id, role").eq("id", user.id).single();
  if (!userData?.tenant_id) return { success: false, error: "No tenant" };
  if (userData.role !== "owner" && userData.role !== "admin") return { success: false, error: "Insufficient permissions" };

  const { data: tenant } = await supabase.from("tenants").select("settings").eq("id", userData.tenant_id).single();
  const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {};

  const { error } = await supabase
    .from("tenants")
    .update({
      settings: {
        ...currentSettings,
        payments: {
          cashOnDelivery: data.cashOnDelivery,
          bankTransfer: data.bankTransfer,
          bankName: data.bankName,
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          branch: data.branch,
        },
      },
    })
    .eq("id", userData.tenant_id);

  if (error) return { success: false, error: error.message };

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
  };
}
