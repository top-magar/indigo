"use server";

import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage } from "@/infrastructure/services/whatsapp";

export interface WhatsAppSettings {
  enabled: boolean;
  apiUrl: string;
  apiToken: string;
  merchantPhone: string;
}

export async function getWhatsAppSettings(): Promise<{ settings: WhatsAppSettings; error?: string }> {
  const { user, supabase } = await getAuthenticatedClient();
  const tenantId = user.tenantId;
  if (!tenantId) return { settings: defaultSettings(), error: "Unauthorized" };

  const { data: tenant } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", tenantId)
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
  const { user, supabase } = await getAuthenticatedClient();
  const tenantId = user.tenantId;
  if (!tenantId) return { success: false, error: "Unauthorized" };
  if (user.role !== "owner" && user.role !== "admin") return { success: false, error: "Insufficient permissions" };

  const { data: tenant } = await supabase.from("tenants").select("settings").eq("id", tenantId).single();
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
    .eq("id", tenantId);

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
