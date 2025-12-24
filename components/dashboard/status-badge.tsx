"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Cancel01Icon,
  Alert02Icon,
  PackageIcon,
  TruckDeliveryIcon,
  Home01Icon,
  PauseIcon,
} from "@hugeicons/core-free-icons";

export type StatusType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "paused"
  | "active"
  | "inactive"
  | "draft"
  | "published";

interface StatusConfig {
  label: string;
  icon: typeof CheckmarkCircle02Icon;
  className: string;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  success: {
    label: "Success",
    icon: CheckmarkCircle02Icon,
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  warning: {
    label: "Warning",
    icon: Alert02Icon,
    className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
  error: {
    label: "Error",
    icon: Cancel01Icon,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  info: {
    label: "Info",
    icon: Clock01Icon,
    className: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  },
  pending: {
    label: "Pending",
    icon: Clock01Icon,
    className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
  processing: {
    label: "Processing",
    icon: PackageIcon,
    className: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  },
  shipped: {
    label: "Shipped",
    icon: TruckDeliveryIcon,
    className: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  },
  delivered: {
    label: "Delivered",
    icon: Home01Icon,
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: Cancel01Icon,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  paused: {
    label: "Paused",
    icon: PauseIcon,
    className: "bg-muted text-muted-foreground border-muted",
  },
  active: {
    label: "Active",
    icon: CheckmarkCircle02Icon,
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  inactive: {
    label: "Inactive",
    icon: Cancel01Icon,
    className: "bg-muted text-muted-foreground border-muted",
  },
  draft: {
    label: "Draft",
    icon: Clock01Icon,
    className: "bg-muted text-muted-foreground border-muted",
  },
  published: {
    label: "Published",
    icon: CheckmarkCircle02Icon,
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = statusConfigs[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border font-medium",
        config.className,
        size === "sm" && "text-[10px] px-1.5 py-0",
        size === "md" && "text-xs px-2 py-0.5",
        className
      )}
    >
      {showIcon && (
        <HugeiconsIcon
          icon={Icon}
          className={cn(
            size === "sm" && "w-2.5 h-2.5",
            size === "md" && "w-3 h-3"
          )}
        />
      )}
      {label || config.label}
    </Badge>
  );
}

// Dot indicator version (minimal)
interface StatusDotProps {
  status: StatusType;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const colorMap: Record<StatusType, string> = {
    success: "bg-chart-2",
    warning: "bg-chart-4",
    error: "bg-destructive",
    info: "bg-chart-1",
    pending: "bg-chart-4",
    processing: "bg-chart-1",
    shipped: "bg-chart-5",
    delivered: "bg-chart-2",
    cancelled: "bg-destructive",
    paused: "bg-muted-foreground",
    active: "bg-chart-2",
    inactive: "bg-muted-foreground",
    draft: "bg-muted-foreground",
    published: "bg-chart-2",
  };

  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        colorMap[status],
        className
      )}
    />
  );
}

// Progress bar version for order status
interface StatusProgressProps {
  status: StatusType;
  className?: string;
}

const statusOrder: StatusType[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

export function StatusProgress({ status, className }: StatusProgressProps) {
  const currentIndex = statusOrder.indexOf(status);
  const progress =
    status === "cancelled"
      ? 0
      : currentIndex >= 0
      ? ((currentIndex + 1) / statusOrder.length) * 100
      : 0;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {statusOrder.map((s, index) => (
        <div
          key={s}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            index <= currentIndex && status !== "cancelled"
              ? "bg-chart-2"
              : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}
