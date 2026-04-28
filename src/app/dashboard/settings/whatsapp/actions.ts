"use server";

import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage } from "@/infrastructure/services/whatsapp";

export interface WhatsAppSettings {
  enabled: boolean;
  apiUrl: string;
  apiToken: string;
  merchantPhone: string;
}

export async function getWhatsAppSettings(): Promise<{ settings: WhatsAppSettings; error?: string }> {
  const { user } = await getAuthenticatedClient();
  if (!user.tenantId) return { settings: defaultSettings(), error: "Unauthorized" };

  const [tenant] = await db.select({ settings: tenants.settings })
    .from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);

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
  const { user } = await getAuthenticatedClient();
  if (!user.tenantId) return { success: false, error: "Unauthorized" };
  if (user.role !== "owner" && user.role !== "admin") return { success: false, error: "Insufficient permissions" };

  const [tenant] = await db.select({ settings: tenants.settings })
    .from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);
  const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {};

  try {
    await db.update(tenants).set({
      settings: {
        ...currentSettings,
        whatsapp: {
          enabled: data.enabled,
          apiUrl: data.apiUrl,
          apiToken: data.apiToken,
          merchantPhone: data.merchantPhone,
        },
      },
    }).where(eq(tenants.id, user.tenantId));
  } catch {
    return { success: false, error: "Failed to update WhatsApp settings" };
  }

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
