/**
 * Status Configuration
 *
 * This file re-exports status types and configurations from the centralized
 * status types module. It also provides backward-compatible aliases.
 *
 * @see src/shared/types/status.ts for the canonical type definitions
 */

// Re-export all types and configurations from centralized module
export {
  // Interface
  type StatusConfig,

  // Product Status
  type ProductStatus,
  PRODUCT_STATUS_VALUES,
  productStatusConfig,
  productStatusStyles,

  // Order Status
  type OrderStatus,
  ORDER_STATUS_VALUES,
  orderStatusConfig,
  orderStatusStyles,

  // Payment Status
  type PaymentStatus,
  PAYMENT_STATUS_VALUES,
  paymentStatusConfig,
  paymentStatusStyles,

  // Fulfillment Status
  type FulfillmentStatus,
  FULFILLMENT_STATUS_VALUES,
  fulfillmentStatusConfig,
  fulfillmentStatusStyles,

  // Helper functions
  getStatusConfig,
  getProductStatusConfig,
  getOrderStatusConfig,
  getPaymentStatusConfig,
  getFulfillmentStatusConfig,
  isValidProductStatus,
  isValidOrderStatus,
  isValidPaymentStatus,
  isValidFulfillmentStatus,
} from "@/shared/types/status";

// ============================================================================
// BACKWARD COMPATIBLE ALIASES
// ============================================================================

// These aliases maintain backward compatibility with existing code
// that uses the old function names

import {
  getProductStatusConfig,
  getOrderStatusConfig,
  getPaymentStatusConfig,
  getFulfillmentStatusConfig,
} from "@/shared/types/status";

/**
 * @deprecated Use getProductStatusConfig instead
 */
export const getProductStatus = getProductStatusConfig;

/**
 * @deprecated Use getOrderStatusConfig instead
 */
export const getOrderStatus = getOrderStatusConfig;

/**
 * @deprecated Use getPaymentStatusConfig instead
 */
export const getPaymentStatus = getPaymentStatusConfig;

/**
 * @deprecated Use getFulfillmentStatusConfig instead
 */
export const getFulfillmentStatus = getFulfillmentStatusConfig;
