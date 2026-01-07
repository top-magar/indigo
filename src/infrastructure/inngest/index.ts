/**
 * Inngest Module
 * 
 * Background job queue integration for the Indigo Commerce platform.
 * Provides reliable async processing for:
 * - Order confirmation emails
 * - Merchant notification emails
 * - Inventory decrements
 * - Stripe webhook event processing
 * 
 * @see https://www.inngest.com/docs
 * 
 * Usage:
 * ```typescript
 * import { inngest } from "@/infrastructure/inngest";
 * 
 * // Send an event
 * await inngest.send({
 *   name: "order/send-confirmation",
 *   data: {
 *     tenantId: "...",
 *     customerEmail: "...",
 *     orderDetails: {...},
 *     storeInfo: {...},
 *   },
 * });
 * ```
 */

// Export the Inngest client
export { inngest } from "./client";

// Export all functions
export { functions } from "./functions";
export {
  sendOrderConfirmation,
  sendOrderNotification,
  processInventoryDecrement,
  syncStripeWebhook,
} from "./functions";

// Export event types
export type {
  InngestEvents,
  SendOrderConfirmationEvent,
  SendOrderNotificationEvent,
  ProcessInventoryDecrementEvent,
  SyncStripeWebhookEvent,
} from "./events";
