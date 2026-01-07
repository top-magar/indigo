"use client";

/**
 * Insight Card Component
 * Individual insight display with icon, content, actions, and dismiss functionality
 */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  Alert02Icon,
  Target01Icon,
  UserGroupIcon,
  Tag01Icon,
  ChartLineData02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type Insight,
  InsightType,
  INSIGHT_CONFIG,
  PRIORITY_CONFIG,
} from "./insight-types";

// Icon type from hugeicons
type HugeIcon = typeof ArrowUp01Icon;

/**
 * Map insight types to their icons
 */
const INSIGHT_ICONS: Record<InsightType, HugeIcon> = {
  [InsightType.LOW_STOCK_WARNING]: Alert02Icon,
  [InsightType.TRENDING_PRODUCT]: ArrowUp01Icon,
  [InsightType.SALES_OPPORTUNITY]: Target01Icon,
  [InsightType.CUSTOMER_RETENTION]: UserGroupIcon,
  [InsightType.PRICING_SUGGESTION]: Tag01Icon,
  [InsightType.INVENTORY_FORECAST]: ChartLineData02Icon,
};

export interface InsightCardProps {
  /** The insight data to display */
  insight: Insight;
  /** Callback when dismiss button is clicked */
  onDismiss?: (id: string) => void;
  /** Callback when action button is clicked */
  onAction?: (insight: Insight) => void;
  /** Whether to show the priority badge */
  showPriority?: boolean;
  /** Additional class names */
  className?: string;
  /** Animation delay for staggered animations */
  animationDelay?: number;
}

/**
 * InsightCard displays a single AI-generated insight with:
 * - Type-specific icon
 * - Title and description
 * - Optional metric highlight
 * - Action button
 * - Dismiss button
 * - Priority indicator
 */
export function InsightCard({
  insight,
  onDismiss,
  onAction,
  showPriority = true,
  className,
  animationDelay = 0,
}: InsightCardProps) {
  const config = INSIGHT_CONFIG[insight.type];
  const priorityConfig = PRIORITY_CONFIG[insight.priority];
  const Icon = INSIGHT_ICONS[insight.type];

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDismiss?.(insight.id);
  };

  const handleAction = () => {
    onAction?.(insight);
  };

  // Determine metric trend icon
  const MetricTrendIcon =
    insight.metric?.trend === "positive"
      ? ArrowUp01Icon
      : insight.metric?.trend === "negative"
        ? ArrowDown01Icon
        : null;

  const metricTrendColor =
    insight.metric?.trend === "positive"
      ? "text-emerald-600 dark:text-emerald-500"
      : insight.metric?.trend === "negative"
        ? "text-red-600 dark:text-red-500"
        : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{
        duration: 0.2,
        delay: animationDelay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all",
        "hover:shadow-sm hover:border-border/80",
        insight.priority === "high" && config.borderColor,
        className
      )}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className={cn(
          "absolute right-2 top-2 p-1 rounded-md",
          "text-muted-foreground/50 hover:text-muted-foreground",
          "hover:bg-muted/50 transition-colors",
          "opacity-0 group-hover:opacity-100 focus:opacity-100"
        )}
        aria-label="Dismiss insight"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
      </button>

      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            config.iconBgColor
          )}
        >
          <HugeiconsIcon icon={Icon} className={cn("w-5 h-5", config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header with title and priority */}
          <div className="flex items-start justify-between gap-2 pr-6">
            <h4 className="text-sm font-medium text-foreground leading-tight">
              {insight.title}
            </h4>
            {showPriority && insight.priority === "high" && (
              <Badge
                variant="secondary"
                className={cn("text-[10px] px-1.5 py-0 h-4 shrink-0", priorityConfig.color)}
              >
                {priorityConfig.label}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {insight.description}
          </p>

          {/* Metric and Action row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Metric highlight */}
            {insight.metric && (
              <div className="flex items-center gap-1.5">
                {MetricTrendIcon && (
                  <HugeiconsIcon
                    icon={MetricTrendIcon}
                    className={cn("w-3.5 h-3.5", metricTrendColor)}
                  />
                )}
                <span
                  className={cn(
                    "text-sm font-semibold",
                    metricTrendColor
                  )}
                >
                  {insight.metric.value}
                </span>
              </div>
            )}

            {/* Action button */}
            {insight.action && (
              <div className="ml-auto">
                {insight.action.href ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    asChild
                    onClick={handleAction}
                  >
                    <Link href={insight.action.href}>{insight.action.label}</Link>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      insight.action?.onClick?.();
                      handleAction();
                    }}
                  >
                    {insight.action.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Compact variant of InsightCard for smaller spaces
 */
export interface InsightCardCompactProps {
  insight: Insight;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function InsightCardCompact({
  insight,
  onDismiss,
  className,
}: InsightCardCompactProps) {
  const config = INSIGHT_CONFIG[insight.type];
  const Icon = INSIGHT_ICONS[insight.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border bg-card",
        "hover:bg-muted/30 transition-colors",
        className
      )}
    >
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-md flex items-center justify-center",
          config.iconBgColor
        )}
      >
        <HugeiconsIcon icon={Icon} className={cn("w-4 h-4", config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {insight.title}
        </p>
        {insight.metric && (
          <p className="text-xs text-muted-foreground">{insight.metric.value}</p>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={() => onDismiss(insight.id)}
          className={cn(
            "p-1 rounded-md text-muted-foreground/50",
            "hover:text-muted-foreground hover:bg-muted/50",
            "opacity-0 group-hover:opacity-100 transition-all"
          )}
          aria-label="Dismiss"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

export default InsightCard;
