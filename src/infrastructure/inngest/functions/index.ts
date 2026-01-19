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
 * - indexProductOnChange: Index product in OpenSearch on create/update
 * - removeProductOnDelete: Remove product from OpenSearch on delete
 * - reindexAllProducts: Full reindex of all products for a tenant
 * - scheduledReindex: Daily scheduled reindex for all tenants
 */

import { sendOrderConfirmation } from "./send-order-confirmation";
import { sendOrderNotification } from "./send-order-notification";
import { processInventoryDecrement } from "./process-inventory-decrement";
import { syncStripeWebhook } from "./sync-stripe-webhook";
import {
  indexProductOnChange,
  removeProductOnDelete,
  reindexAllProducts,
  scheduledReindex,
} from "./sync-opensearch";

/**
 * Array of all Inngest functions to register with the serve handler
 */
export const functions = [
  sendOrderConfirmation,
  sendOrderNotification,
  processInventoryDecrement,
  syncStripeWebhook,
  // OpenSearch sync functions
  indexProductOnChange,
  removeProductOnDelete,
  reindexAllProducts,
  scheduledReindex,
];

// Named exports for individual function access
export {
  sendOrderConfirmation,
  sendOrderNotification,
  processInventoryDecrement,
  syncStripeWebhook,
  // OpenSearch
  indexProductOnChange,
  removeProductOnDelete,
  reindexAllProducts,
  scheduledReindex,
};
