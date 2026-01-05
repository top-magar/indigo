import {
  PencilEdit01Icon,
  CheckmarkCircle02Icon,
  Archive01Icon,
  Clock01Icon,
  PackageIcon,
  DeliveryTruck01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

// ============================================================================
// Type Definitions
// ============================================================================

export interface StatusConfig {
  color: string;
  bgColor: string;
  label: string;
  icon?: typeof Clock01Icon;
}

export type ProductStatus = "draft" | "active" | "archived";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "failed";

export type FulfillmentStatus =
  | "unfulfilled"
  | "partially_fulfilled"
  | "fulfilled"
  | "returned";

// ============================================================================
// Product Status Configuration
// ============================================================================

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

/**
 * Simple status styles for product badges (className strings)
 * Use when you only need the combined className without icons
 */
export const productStatusStyles: Record<ProductStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-chart-2/10 text-chart-2",
  archived: "bg-destructive/10 text-destructive",
};

// ============================================================================
// Order Status Configuration
// ============================================================================

export const orderStatusConfig: Record<OrderStatus, StatusConfig> = {
  pending: {
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    icon: Clock01Icon,
    label: "Pending",
  },
  confirmed: {
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    icon: PackageIcon,
    label: "Confirmed",
  },
  processing: {
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    icon: PackageIcon,
    label: "Processing",
  },
  shipped: {
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
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
  refunded: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: Cancel01Icon,
    label: "Refunded",
  },
};

/**
 * Simple status styles for order badges (className strings)
 * Use when you only need the combined className without icons
 */
export const orderStatusStyles: Record<string, string> = {
  pending: "bg-chart-4/10 text-chart-4",
  confirmed: "bg-chart-1/10 text-chart-1",
  processing: "bg-chart-5/10 text-chart-5",
  shipped: "bg-chart-3/10 text-chart-3",
  delivered: "bg-chart-2/10 text-chart-2",
  cancelled: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

// ============================================================================
// Payment Status Configuration
// ============================================================================

export const paymentStatusConfig: Record<PaymentStatus, StatusConfig> = {
  pending: {
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    label: "Unpaid",
  },
  paid: {
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    label: "Paid",
  },
  partially_refunded: {
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    label: "Partial Refund",
  },
  refunded: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Refunded",
  },
  failed: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Failed",
  },
};

/**
 * Simple status styles for payment badges (className strings)
 * Use when you only need the combined className without icons
 */
export const paymentStatusStyles: Record<string, string> = {
  pending: "bg-chart-4/10 text-chart-4",
  paid: "bg-chart-2/10 text-chart-2",
  partially_refunded: "bg-chart-5/10 text-chart-5",
  refunded: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
};

// ============================================================================
// Fulfillment Status Configuration
// ============================================================================

export const fulfillmentStatusConfig: Record<FulfillmentStatus, StatusConfig> = {
  unfulfilled: {
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    label: "Unfulfilled",
  },
  partially_fulfilled: {
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    label: "Partially Fulfilled",
  },
  fulfilled: {
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    label: "Fulfilled",
  },
  returned: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Returned",
  },
};

/**
 * Simple status styles for fulfillment badges (className strings)
 */
export const fulfillmentStatusStyles: Record<string, string> = {
  unfulfilled: "bg-chart-4/10 text-chart-4",
  partially_fulfilled: "bg-chart-5/10 text-chart-5",
  fulfilled: "bg-chart-2/10 text-chart-2",
  returned: "bg-muted text-muted-foreground",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get status config with fallback for unknown statuses
 */
export function getProductStatus(status: string): StatusConfig {
  return productStatusConfig[status as ProductStatus] || productStatusConfig.draft;
}

export function getOrderStatus(status: string): StatusConfig {
  return orderStatusConfig[status as OrderStatus] || orderStatusConfig.pending;
}

export function getPaymentStatus(status: string): StatusConfig {
  return paymentStatusConfig[status as PaymentStatus] || paymentStatusConfig.pending;
}

export function getFulfillmentStatus(status: string): StatusConfig {
  return fulfillmentStatusConfig[status as FulfillmentStatus] || fulfillmentStatusConfig.unfulfilled;
}
