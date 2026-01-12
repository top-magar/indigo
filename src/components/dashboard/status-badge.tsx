"use client";

import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/geist";
import { cn } from "@/shared/utils";
import {
  type StatusConfig,
  getOrderStatus,
  getProductStatus,
  getPaymentStatus,
  getFulfillmentStatus,
  type OrderStatus,
  type ProductStatus,
  type PaymentStatus,
  type FulfillmentStatus,
} from "@/config/status";

type StatusType = "order" | "product" | "payment" | "fulfillment";
type StatusDotStatus = "success" | "error" | "warning" | "info" | "neutral" | "building";

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  showIcon?: boolean;
  className?: string;
  variant?: "badge" | "dot";
}

const statusGetters: Record<StatusType, (status: string) => StatusConfig> = {
  order: getOrderStatus,
  product: getProductStatus,
  payment: getPaymentStatus,
  fulfillment: getFulfillmentStatus,
};

/**
 * Maps status values to StatusDot status types
 */
function mapToStatusDotStatus(status: string, type: StatusType): StatusDotStatus {
  const normalizedStatus = status.toLowerCase();

  // Product-specific mappings
  if (type === "product") {
    switch (normalizedStatus) {
      case "active":
        return "success";
      case "draft":
        return "neutral";
      case "archived":
        return "error";
      default:
        return "neutral";
    }
  }

  // Order, payment, and fulfillment status mappings
  switch (normalizedStatus) {
    // Warning states
    case "pending":
    case "processing":
    case "unfulfilled":
      return "warning";
    
    // Success states
    case "completed":
    case "paid":
    case "fulfilled":
    case "delivered":
      return "success";
    
    // Error states
    case "cancelled":
    case "failed":
    case "refunded":
    case "returned":
      return "error";
    
    default:
      return "neutral";
  }
}

/**
 * StatusBadge - Displays status with consistent styling and optional icon
 * 
 * @example
 * <StatusBadge status="pending" type="order" />
 * <StatusBadge status="active" type="product" showIcon={false} />
 * <StatusBadge status="completed" type="order" variant="dot" />
 */
export function StatusBadge({
  status,
  type,
  showIcon = true,
  className,
  variant = "badge",
}: StatusBadgeProps) {
  const config = statusGetters[type](status);

  // Render StatusDot variant
  if (variant === "dot") {
    const dotStatus = mapToStatusDotStatus(status, type);
    return (
      <span 
        className={cn("inline-flex items-center gap-1.5", className)}
        role="status"
        aria-label={`${type} status: ${config.label}`}
      >
        <StatusDot status={dotStatus} size="sm" />
        <span className="text-sm text-[var(--ds-gray-800)]">{config.label}</span>
      </span>
    );
  }

  // Render Badge variant (default)
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-transparent font-medium",
        config.bgColor,
        config.color,
        className
      )}
      role="status"
      aria-label={`${type} status: ${config.label}`}
    >
      {showIcon && config.icon && (
        <config.icon
          className="size-3"
          data-icon="inline-start"
          aria-hidden="true"
        />
      )}
      {config.label}
    </Badge>
  );
}

// Convenience components for specific status types
export function OrderStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, "type"> & { status: OrderStatus | string }) {
  return <StatusBadge status={status} type="order" {...props} />;
}

export function ProductStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, "type"> & { status: ProductStatus | string }) {
  return <StatusBadge status={status} type="product" {...props} />;
}

export function PaymentStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, "type"> & { status: PaymentStatus | string }) {
  return <StatusBadge status={status} type="payment" {...props} />;
}

export function FulfillmentStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, "type"> & { status: FulfillmentStatus | string }) {
  return <StatusBadge status={status} type="fulfillment" {...props} />;
}

/**
 * StatusDotIndicator - Renders just the dot with an optional label
 * 
 * @example
 * <StatusDotIndicator status="pending" type="order" />
 * <StatusDotIndicator status="active" type="product" showLabel={false} />
 */
export function StatusDotIndicator({
  status,
  type,
  showLabel = true,
  className,
}: StatusBadgeProps & { showLabel?: boolean }) {
  const config = statusGetters[type](status);
  const dotStatus = mapToStatusDotStatus(status, type);

  return (
    <span 
      className={cn("inline-flex items-center gap-1.5", className)}
      role="status"
      aria-label={`${type} status: ${config.label}`}
    >
      <StatusDot status={dotStatus} size="sm" />
      {showLabel && <span className="text-sm text-[var(--ds-gray-800)]">{config.label}</span>}
    </span>
  );
}
