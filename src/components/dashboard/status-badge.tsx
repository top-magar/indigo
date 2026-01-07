"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
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

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  showIcon?: boolean;
  className?: string;
}

const statusGetters: Record<StatusType, (status: string) => StatusConfig> = {
  order: getOrderStatus,
  product: getProductStatus,
  payment: getPaymentStatus,
  fulfillment: getFulfillmentStatus,
};

/**
 * StatusBadge - Displays status with consistent styling and optional icon
 * 
 * @example
 * <StatusBadge status="pending" type="order" />
 * <StatusBadge status="active" type="product" showIcon={false} />
 */
export function StatusBadge({
  status,
  type,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusGetters[type](status);

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
        <HugeiconsIcon
          icon={config.icon}
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
