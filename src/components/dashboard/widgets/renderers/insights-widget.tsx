"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowUp01Icon,
  Idea01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/utils";
import type { Widget } from "../widget-types";

const MOCK_INSIGHTS = [
  {
    id: "1",
    type: "warning",
    title: "Low Stock Alert",
    description: "5 products are running low on inventory",
    priority: "high",
    icon: Alert02Icon,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    action: { label: "View Products", href: "/dashboard/inventory" },
  },
  {
    id: "2",
    type: "opportunity",
    title: "Trending Product",
    description: "Blue T-Shirt sales up 45% this week",
    priority: "medium",
    icon: ArrowUp01Icon,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    action: { label: "View Details", href: "/dashboard/products" },
  },
  {
    id: "3",
    type: "suggestion",
    title: "Price Optimization",
    description: "Consider adjusting prices for 3 products",
    priority: "low",
    icon: Idea01Icon,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    action: { label: "Review", href: "/dashboard/products" },
  },
];

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

export interface InsightsWidgetProps {
  widget: Widget;
}

export function InsightsWidget({ widget }: InsightsWidgetProps) {
  const maxItems = widget.config?.maxItems || 3;
  const insights = MOCK_INSIGHTS.slice(0, maxItems);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className="p-3 border rounded-lg hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", insight.iconBg)}>
                <HugeiconsIcon icon={insight.icon} className={cn("h-4 w-4", insight.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{insight.title}</h4>
                  <Badge className={cn("text-[10px] px-1.5 py-0", PRIORITY_STYLES[insight.priority as keyof typeof PRIORITY_STYLES])}>
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{insight.description}</p>
                {insight.action && (
                  <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">
                    {insight.action.label}
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
