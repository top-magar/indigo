import { inngest } from "../client";
import { sendOrderNotificationEmail } from "@/infrastructure/services/email/actions";

/**
 * Send Order Notification Email Function
 * 
 * Sends a notification email to the merchant when a new order is placed.
 * This runs as a background job for reliability and to avoid blocking
 * the webhook response.
 * 
 * Features:
 * - Automatic retries on failure (3 attempts)
 * - Exponential backoff between retries
 * - Detailed logging for debugging
 */
export const sendOrderNotification = inngest.createFunction(
  {
    id: "send-order-notification",
    name: "Send Order Notification Email",
    retries: 3,
  },
  { event: "order/send-notification" },
  async ({ event, step, logger }) => {
    const { tenantId, merchantEmail, orderDetails, storeInfo } = event.data;

    logger.info("Processing merchant notification email", {
      tenantId,
      orderId: orderDetails.orderId,
      orderNumber: orderDetails.orderNumber,
      merchantEmail,
    });

    // Send the email in a step for automatic retries
    const result = await step.run("send-email", async () => {
      const emailResult = await sendOrderNotificationEmail(
        merchantEmail,
        orderDetails,
        storeInfo
      );

      if (!emailResult.success) {
        // Throw to trigger retry
        throw new Error(`Failed to send merchant notification: ${emailResult.error}`);
      }

      return emailResult;
    });

    logger.info("Merchant notification email sent successfully", {
      tenantId,
      orderId: orderDetails.orderId,
      messageId: result.messageId,
    });

    return {
      success: true,
      messageId: result.messageId,
      orderId: orderDetails.orderId,
      merchantEmail,
    };
  }
);
