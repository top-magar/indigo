/**
 * Centralized Status Types
 *
 * This file consolidates all status type definitions used across the application.
 * Import from here instead of defining duplicate types in other files.
 *
 * @module shared/types/status
 */

import {
  PencilEdit01Icon,
  CheckmarkCircle02Icon,
  Archive01Icon,
  Clock01Icon,
  PackageIcon,
  DeliveryTruck01Icon,
  Cancel01Icon,
  Loading01Icon,
  CreditCardIcon,
  RefreshIcon,
  AlertCircleIcon,
  CheckmarkSquare02Icon,
  TimeQuarter02Icon,
} from "@hugeicons/core-free-icons";

// ============================================================================
// STATUS CONFIG INTERFACE
// ============================================================================

export interface StatusConfig {
  color: string;
  bgColor: string;
  label: string;
  icon?: typeof Clock01Icon;
}

// ============================================================================
// PRODUCT STATUS
// ============================================================================

export type ProductStatus = "draft" | "active" | "archived";

export const PRODUCT_STATUS_VALUES = ["draft", "active", "archived"] as const;

export const productStatusConfig: Record<ProductStatus, StatusConfig> = {
  draft: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Draft",
    icon: PencilEdit01Icon,
  },
  active: {
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    label: "Active",
    icon: CheckmarkCircle02Icon,
  },
  archived: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Archived",
    icon: Archive01Icon,
  },
};

export const productStatusStyles: Record<ProductStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-chart-2/10 text-chart-2",
  archived: "bg-destructive/10 text-destructive",
};

// ============================================================================
// ORDER STATUS
// ============================================================================

export type OrderStatus =
  | "draft"
  | "unconfirmed"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "returned"
  | "refunded";

export const ORDER_STATUS_VALUES = [
  "draft",
  "unconfirmed",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "returned",
  "refunded",
] as const;

export const orderStatusConfig: Record<OrderStatus, StatusConfig> = {
  draft: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    icon: PencilEdit01Icon,
    label: "Draft",
  },
  unconfirmed: {
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    icon: TimeQuarter02Icon,
    label: "Unconfirmed",
  },
  pending: {
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    icon: Clock01Icon,
    label: "Pending",
  },
  confirmed: {
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    icon: CheckmarkSquare02Icon,
    label: "Confirmed",
  },
  processing: {
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    icon: PackageIcon,
    label: "Processing",
  },
  shipped: {
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    icon: DeliveryTruck01Icon,
    label: "Shipped",
  },
  delivered: {
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    icon: CheckmarkCircle02Icon,
    label: "Delivered",
  },
  completed: {
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    icon: CheckmarkCircle02Icon,
    label: "Completed",
  },
  cancelled: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: Cancel01Icon,
    label: "Cancelled",
  },
  returned: {
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    icon: RefreshIcon,
    label: "Returned",
  },
  refunded: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    icon: RefreshIcon,
    label: "Refunded",
  },
};

export const orderStatusStyles: Record<OrderStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  unconfirmed: "bg-chart-4/10 text-chart-4",
  pending: "bg-chart-4/10 text-chart-4",
  confirmed: "bg-chart-1/10 text-chart-1",
  processing: "bg-chart-5/10 text-chart-5",
  shipped: "bg-chart-3/10 text-chart-3",
  delivered: "bg-chart-2/10 text-chart-2",
  completed: "bg-chart-2/10 text-chart-2",
  cancelled: "bg-destructive/10 text-destructive",
  returned: "bg-chart-4/10 text-chart-4",
  refunded: "bg-muted text-muted-foreground",
};

// ============================================================================
// PAYMENT STATUS
// ============================================================================

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "partially_paid"
  | "partially_refunded"
  | "refunded"
  | "failed"
  | "cancelled";

export const PAYMENT_STATUS_VALUES = [
  "pending",
  "authorized",
  "paid",
  "partially_paid",
  "partially_refunded",
  "refunded",
  "failed",
  "cancelled",
] as const;

export const paymentStatusConfig: Record<PaymentStatus, StatusConfig> = {
  pending: {
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    icon: Clock01Icon,
    label: "Unpaid",
  },
  authorized: {
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    icon: CreditCardIcon,
    label: "Authorized",
  },
  paid: {
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    icon: CheckmarkCircle02Icon,
    label: "Paid",
  },
  partially_paid: {
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    icon: Loading01Icon,
    label: "Partially Paid",
  },
  partially_refunded: {
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    icon: RefreshIcon,
    label: "Partial Refund",
  },
  refunded: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    icon: RefreshIcon,
    label: "Refunded",
  },
  failed: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: AlertCircleIcon,
    label: "Failed",
  },
  cancelled: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: Cancel01Icon,
    label: "Cancelled",
  },
};

export const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: "bg-chart-4/10 text-chart-4",
  authorized: "bg-chart-1/10 text-chart-1",
  paid: "bg-chart-2/10 text-chart-2",
  partially_paid: "bg-chart-5/10 text-chart-5",
  partially_refunded: "bg-chart-5/10 text-chart-5",
  refunded: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-destructive/10 text-destructive",
};

// ============================================================================
// FULFILLMENT STATUS
// ============================================================================

export type FulfillmentStatus =
  | "unfulfilled"
  | "partially_fulfilled"
  | "fulfilled"
  | "awaiting_approval"
  | "returned"
  | "cancelled";

export const FULFILLMENT_STATUS_VALUES = [
  "unfulfilled",
  "partially_fulfilled",
  "fulfilled",
  "awaiting_approval",
  "returned",
  "cancelled",
] as const;

export const fulfillmentStatusConfig: Record<FulfillmentStatus, StatusConfig> = {
  unfulfilled: {
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    icon: Clock01Icon,
    label: "Unfulfilled",
  },
  partially_fulfilled: {
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    icon: Loading01Icon,
    label: "Partially Fulfilled",
  },
  fulfilled: {
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    icon: CheckmarkCircle02Icon,
    label: "Fulfilled",
  },
  awaiting_approval: {
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    icon: TimeQuarter02Icon,
    label: "Awaiting Approval",
  },
  returned: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    icon: RefreshIcon,
    label: "Returned",
  },
  cancelled: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: Cancel01Icon,
    label: "Cancelled",
  },
};

export const fulfillmentStatusStyles: Record<FulfillmentStatus, string> = {
  unfulfilled: "bg-chart-4/10 text-chart-4",
  partially_fulfilled: "bg-chart-5/10 text-chart-5",
  fulfilled: "bg-chart-2/10 text-chart-2",
  awaiting_approval: "bg-chart-1/10 text-chart-1",
  returned: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getProductStatusConfig(status: string): StatusConfig {
  return productStatusConfig[status as ProductStatus] || productStatusConfig.draft;
}

export function getOrderStatusConfig(status: string): StatusConfig {
  return orderStatusConfig[status as OrderStatus] || orderStatusConfig.pending;
}

export function getPaymentStatusConfig(status: string): StatusConfig {
  return paymentStatusConfig[status as PaymentStatus] || paymentStatusConfig.pending;
}

export function getFulfillmentStatusConfig(status: string): StatusConfig {
  return fulfillmentStatusConfig[status as FulfillmentStatus] || fulfillmentStatusConfig.unfulfilled;
}

export function getStatusConfig(
  type: "product" | "order" | "payment" | "fulfillment",
  status: string
): StatusConfig {
  switch (type) {
    case "product":
      return getProductStatusConfig(status);
    case "order":
      return getOrderStatusConfig(status);
    case "payment":
      return getPaymentStatusConfig(status);
    case "fulfillment":
      return getFulfillmentStatusConfig(status);
    default:
      return { color: "text-muted-foreground", bgColor: "bg-muted", label: status };
  }
}

export function isValidProductStatus(status: string): status is ProductStatus {
  return PRODUCT_STATUS_VALUES.includes(status as ProductStatus);
}

export function isValidOrderStatus(status: string): status is OrderStatus {
  return ORDER_STATUS_VALUES.includes(status as OrderStatus);
}

export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return PAYMENT_STATUS_VALUES.includes(status as PaymentStatus);
}

export function isValidFulfillmentStatus(status: string): status is FulfillmentStatus {
  return FULFILLMENT_STATUS_VALUES.includes(status as FulfillmentStatus);
}
