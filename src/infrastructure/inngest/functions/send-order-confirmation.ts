import { inngest } from "../client";
import { sendOrderConfirmationEmail } from "@/infrastructure/services/email/actions";

/**
 * Send Order Confirmation Email Function
 * 
 * Sends a confirmation email to the customer after a successful order.
 * This runs as a background job for reliability and to avoid blocking
 * the webhook response.
 * 
 * Features:
 * - Automatic retries on failure (3 attempts)
 * - Exponential backoff between retries
 * - Detailed logging for debugging
 */
export const sendOrderConfirmation = inngest.createFunction(
  {
    id: "send-order-confirmation",
    name: "Send Order Confirmation Email",
    retries: 3,
  },
  { event: "order/send-confirmation" },
  async ({ event, step, logger }) => {
    const { tenantId, customerEmail, orderDetails, storeInfo } = event.data;

    logger.info("Processing order confirmation email", {
      tenantId,
      orderId: orderDetails.orderId,
      orderNumber: orderDetails.orderNumber,
      customerEmail,
    });

    // Send the email in a step for automatic retries
    const result = await step.run("send-email", async () => {
      const emailResult = await sendOrderConfirmationEmail(
        customerEmail,
        orderDetails,
        storeInfo
      );

      if (!emailResult.success) {
        // Throw to trigger retry
        throw new Error(`Failed to send order confirmation: ${emailResult.error}`);
      }

      return emailResult;
    });

    logger.info("Order confirmation email sent successfully", {
      tenantId,
      orderId: orderDetails.orderId,
      messageId: result.messageId,
    });

    return {
      success: true,
      messageId: result.messageId,
      orderId: orderDetails.orderId,
      customerEmail,
    };
  }
);
