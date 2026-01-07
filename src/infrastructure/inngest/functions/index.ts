/**
 * Inngest Functions Index
 * 
 * Exports all Inngest functions for registration with the serve handler.
 * 
 * Available functions:
 * - sendOrderConfirmation: Send customer order confirmation email
 * - sendOrderNotification: Send merchant notification email
 * - processInventoryDecrement: Decrement inventory after order
 * - syncStripeWebhook: Process Stripe webhook events reliably
 */

import { sendOrderConfirmation } from "./send-order-confirmation";
import { sendOrderNotification } from "./send-order-notification";
import { processInventoryDecrement } from "./process-inventory-decrement";
import { syncStripeWebhook } from "./sync-stripe-webhook";

/**
 * Array of all Inngest functions to register with the serve handler
 */
export const functions = [
  sendOrderConfirmation,
  sendOrderNotification,
  processInventoryDecrement,
  syncStripeWebhook,
];

// Named exports for individual function access
export {
  sendOrderConfirmation,
  sendOrderNotification,
  processInventoryDecrement,
  syncStripeWebhook,
};
