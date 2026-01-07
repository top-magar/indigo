"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ShoppingCart01Icon,
  PackageIcon,
  AnalyticsUpIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";
import type { Widget } from "../widget-types";

const DEFAULT_ACTIONS = [
  {
    id: "add-product",
    label: "Add Product",
    href: "/dashboard/products/new",
    icon: Add01Icon,
    variant: "primary" as const,
  },
  {
    id: "view-orders",
    label: "View Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart01Icon,
  },
  {
    id: "inventory",
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: PackageIcon,
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: AnalyticsUpIcon,
  },
];

export interface QuickActionsWidgetProps {
  widget: Widget;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function QuickActionsWidget({ widget }: QuickActionsWidgetProps) {
  const actions = DEFAULT_ACTIONS;

  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className={cn(
            "h-auto py-3 px-3 flex-col items-center gap-2",
            action.variant === "primary" && "border-primary/30 bg-primary/5 hover:bg-primary/10"
          )}
          asChild
        >
          <Link href={action.href}>
            <HugeiconsIcon
              icon={action.icon}
              className={cn(
                "w-5 h-5",
                action.variant === "primary" ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="text-xs font-medium">{action.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}
