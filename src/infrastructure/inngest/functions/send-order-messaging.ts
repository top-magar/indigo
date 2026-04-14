import { inngest } from "../client"
import { getMessagingProvider } from "@/infrastructure/services/messaging"
import { db } from "@/infrastructure/db"
import { tenants, users } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Send WhatsApp + SMS notifications when a new order is placed.
 *
 * - WhatsApp to merchant (order alert)
 * - SMS to customer (order confirmation)
 *
 * Gracefully skips if providers aren't configured.
 */
export const sendOrderMessaging = inngest.createFunction(
  { id: "send-order-messaging", name: "Send Order WhatsApp/SMS", retries: 2 },
  { event: "order/send-notification" },
  async ({ event, step, logger }) => {
    const { tenantId, orderDetails } = event.data
    const results: Record<string, unknown> = {}

    // Get merchant phone from tenant owner
    const merchantPhone = await step.run("get-merchant-phone", async () => {
      const [owner] = await db.select({ phone: users.email }) // email as fallback — phone not in users schema yet
        .from(users).where(eq(users.tenantId, tenantId)).limit(1)
      // Check tenant settings for WhatsApp number
      const [tenant] = await db.select({ settings: tenants.settings })
        .from(tenants).where(eq(tenants.id, tenantId)).limit(1)
      const s = (tenant?.settings as Record<string, unknown>) ?? {}
      return (s.whatsappPhone as string) || (s.phone as string) || null
    })

    // WhatsApp to merchant
    if (merchantPhone) {
      results.whatsapp = await step.run("send-whatsapp", async () => {
        const wa = getMessagingProvider("whatsapp")
        return wa.send({
          to: merchantPhone,
          body: `🛒 New order #${orderDetails.orderNumber}\nAmount: Rs ${orderDetails.total}\nCustomer: ${orderDetails.customerName || "Guest"}\n\nView in dashboard →`,
        })
      })
    }

    // SMS to customer
    const customerPhone = (orderDetails as Record<string, unknown>).customerPhone as string | undefined
    if (customerPhone) {
      results.sms = await step.run("send-sms", async () => {
        const sms = getMessagingProvider("sms")
        return sms.send({
          to: customerPhone,
          body: `Your order #${orderDetails.orderNumber} has been placed! Amount: Rs ${orderDetails.total}. We'll notify you when it ships.`,
        })
      })
    }

    logger.info("Order messaging complete", { tenantId, orderId: orderDetails.orderId, results })
    return results
  }
)
