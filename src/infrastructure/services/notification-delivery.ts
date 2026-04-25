import { createLogger } from "@/lib/logger";
import { db } from "@/infrastructure/db";
import { notificationPreferences } from "@/db/schema/notification-preferences";
import { eq, and } from "drizzle-orm";

const log = createLogger("services:notification-delivery");

type Channel = "email" | "whatsapp" | "push";
type DeliveryResult = { success: boolean; channel: Channel; error?: string; notificationId?: string };

interface DeliverInput {
  tenantId: string;
  userId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: "order_confirmation" | "order_shipped" | "order_delivered" | "low_stock" | "team_invite" | "payment_received";
  subject: string;
  body: string;
  htmlBody?: string;
  channels?: Channel[];
  metadata?: Record<string, unknown>;
}

export async function deliverNotification(input: DeliverInput): Promise<{
  delivered: boolean;
  results: DeliveryResult[];
  skippedChannels: string[];
}> {
  const results: DeliveryResult[] = [];
  const skippedChannels: string[] = [];
  const channels = input.channels || ["email"];

  for (const channel of channels) {
    try {
      switch (channel) {
        case "email": {
          if (!input.recipientEmail) { skippedChannels.push("email"); break; }
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);
          const { error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "notifications@resend.dev",
            to: input.recipientEmail,
            subject: input.subject,
            html: input.htmlBody || `<p>${input.body}</p>`,
          });
          results.push({ success: !error, channel: "email", error: error?.message });
          break;
        }

        case "whatsapp": {
          if (!input.recipientPhone) { skippedChannels.push("whatsapp"); break; }
          try {
            const { sendWhatsAppMessage } = await import("@/infrastructure/services/whatsapp");
            await sendWhatsAppMessage({ to: input.recipientPhone, message: input.body, config: {} as any });
            results.push({ success: true, channel: "whatsapp" });
          } catch (err) {
            results.push({ success: false, channel: "whatsapp", error: err instanceof Error ? err.message : "WhatsApp send failed" });
          }
          break;
        }

        case "push":
          // Push notifications not yet implemented
          skippedChannels.push("push");
          break;

        default:
          skippedChannels.push(channel);
      }
    } catch (err) {
      log.error(`Failed to deliver via ${channel}:`, err);
      results.push({ success: false, channel, error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  const delivered = results.some(r => r.success);
  log.info(`Notification delivered=${delivered}, channels=${channels.join(",")}, type=${input.type}`);
  return { delivered, results, skippedChannels };
}
