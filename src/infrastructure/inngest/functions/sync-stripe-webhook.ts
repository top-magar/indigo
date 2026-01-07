import { inngest } from "../client";
import { auditLogger } from "@/infrastructure/services/audit-logger";

/**
 * Sync Stripe Webhook Function
 * 
 * Processes Stripe webhook events reliably with automatic retries.
 * This function is used for logging and tracking webhook events,
 * ensuring we have a complete audit trail of all payment events.
 * 
 * Features:
 * - Automatic retries on failure (3 attempts)
 * - Exponential backoff between retries
 * - Detailed audit logging
 * - Idempotent processing (safe to retry)
 */
export const syncStripeWebhook = inngest.createFunction(
  {
    id: "sync-stripe-webhook",
    name: "Sync Stripe Webhook Event",
    retries: 3,
  },
  { event: "stripe/webhook-sync" },
  async ({ event, step, logger }) => {
    const { 
      tenantId, 
      eventType, 
      eventId, 
      paymentIntentId, 
      cartId, 
      amount,
      metadata 
    } = event.data;

    logger.info("Processing Stripe webhook sync", {
      tenantId,
      eventType,
      eventId,
      paymentIntentId,
    });

    // Log the webhook event for audit purposes
    await step.run("log-webhook-event", async () => {
      try {
        await auditLogger.logAction(tenantId, `stripe.${eventType}`, {
          entityType: "payment",
          entityId: paymentIntentId || eventId,
          data: {
            eventId,
            eventType,
            paymentIntentId,
            cartId,
            amount,
            metadata,
            processedAt: new Date().toISOString(),
          },
        });
      } catch (auditError) {
        logger.error("Audit logging failed", { error: auditError });
        // Re-throw to trigger retry
        throw auditError;
      }
    });

    // Handle specific event types with additional processing
    switch (eventType) {
      case "payment_intent.succeeded":
        await step.run("process-payment-success", async () => {
          logger.info("Payment succeeded", {
            paymentIntentId,
            amount,
            cartId,
          });
          // Additional processing can be added here
          // e.g., update analytics, trigger notifications, etc.
        });
        break;

      case "payment_intent.payment_failed":
        await step.run("process-payment-failure", async () => {
          logger.warn("Payment failed", {
            paymentIntentId,
            cartId,
          });
          // Additional failure handling can be added here
          // e.g., send failure notification, update cart status, etc.
        });
        break;

      case "checkout.session.completed":
        await step.run("process-checkout-complete", async () => {
          logger.info("Checkout session completed", {
            eventId,
          });
          // Additional checkout processing can be added here
        });
        break;

      default:
        logger.info("Unhandled event type logged", { eventType });
    }

    logger.info("Stripe webhook sync completed", {
      eventId,
      eventType,
    });

    return {
      success: true,
      eventId,
      eventType,
      processedAt: new Date().toISOString(),
    };
  }
);
