"use server";

import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage } from "@/infrastructure/services/whatsapp";

export interface WhatsAppSettings {
  enabled: boolean;
  apiUrl: string;
  apiToken: string;
  merchantPhone: string;
}

export async function getWhatsAppSettings(): Promise<{ settings: WhatsAppSettings; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { settings: defaultSettings(), error: "Unauthorized" };

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
  if (!userData?.tenant_id) return { settings: defaultSettings(), error: "No tenant" };

  const { data: tenant } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", userData.tenant_id)
    .single();

  if (!tenant) return { settings: defaultSettings(), error: "Tenant not found" };

  const s = (tenant.settings as Record<string, unknown>)?.whatsapp as Record<string, unknown> | undefined;
  return {
    settings: {
      enabled: (s?.enabled as boolean) ?? false,
      apiUrl: (s?.apiUrl as string) ?? "",
      apiToken: (s?.apiToken as string) ?? "",
      merchantPhone: (s?.merchantPhone as string) ?? "",
    },
  };
}

const whatsappSettingsSchema = z.object({
  enabled: z.boolean(),
  apiUrl: z.string(),
  apiToken: z.string(),
  merchantPhone: z.string(),
});

export async function updateWhatsAppSettings(input: WhatsAppSettings): Promise<{ success: boolean; error?: string }> {
  const data = whatsappSettingsSchema.parse(input);
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
        whatsapp: {
          enabled: data.enabled,
          apiUrl: data.apiUrl,
          apiToken: data.apiToken,
          merchantPhone: data.merchantPhone,
        },
      },
    })
    .eq("id", userData.tenant_id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings/whatsapp");
  return { success: true };
}

export async function sendTestWhatsAppMessage(settings: WhatsAppSettings): Promise<{ success: boolean; error?: string }> {
  if (!settings.apiUrl || !settings.apiToken || !settings.merchantPhone) {
    return { success: false, error: "Please fill in all fields before testing" };
  }

  return sendWhatsAppMessage({
    to: settings.merchantPhone,
    message: "✅ Indigo WhatsApp integration is working! You will receive order alerts here.",
    config: { apiUrl: settings.apiUrl, apiToken: settings.apiToken },
  });
}

function defaultSettings(): WhatsAppSettings {
  return { enabled: false, apiUrl: "", apiToken: "", merchantPhone: "" };
}
