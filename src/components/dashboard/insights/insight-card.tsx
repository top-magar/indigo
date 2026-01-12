"use client";

/**
 * Insight Card Component
 * Individual insight display with icon, content, actions, and dismiss functionality
 * Supports two variants: "card" (default) and "note" (using Geist Note component)
 */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Target,
  Users,
  Tag,
  LineChart,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Note, type NoteType } from "@/components/ui/geist";
import {
  type Insight,
  InsightType,
  InsightPriority,
  INSIGHT_CONFIG,
  PRIORITY_CONFIG,
} from "./insight-types";

/**
 * Map insight priority to Note type for semantic display
 * - "success" → positive insights (trending, opportunities)
 * - "warning" → caution insights (low stock, forecasts)
 * - "error" → critical insights (high priority warnings)
 * - "default" → informational insights
 * - "cyan" → tips and suggestions
 */
function getInsightNoteType(insight: Insight): NoteType {
  // First, check priority for high-priority items
  if (insight.priority === "high") {
    // High priority warnings should be error type
    if (insight.type === InsightType.LOW_STOCK_WARNING) {
      return "error";
    }
    return "warning";
  }

  // Map by insight type
  switch (insight.type) {
    case InsightType.TRENDING_PRODUCT:
    case InsightType.SALES_OPPORTUNITY:
      return "success";
    case InsightType.LOW_STOCK_WARNING:
    case InsightType.INVENTORY_FORECAST:
      return "warning";
    case InsightType.CUSTOMER_RETENTION:
      return "default";
    case InsightType.PRICING_SUGGESTION:
      return "cyan";
    default:
      return "default";
  }
}

/**
 * Get a label for the Note component based on insight type
 */
function getInsightNoteLabel(type: InsightType): string {
  switch (type) {
    case InsightType.LOW_STOCK_WARNING:
      return "Warning";
    case InsightType.TRENDING_PRODUCT:
      return "Trending";
    case InsightType.SALES_OPPORTUNITY:
      return "Opportunity";
    case InsightType.CUSTOMER_RETENTION:
      return "Retention";
    case InsightType.PRICING_SUGGESTION:
      return "Tip";
    case InsightType.INVENTORY_FORECAST:
      return "Forecast";
    default:
      return "Insight";
  }
}

/**
 * Map insight types to their icons
 */
const INSIGHT_ICONS: Record<InsightType, LucideIcon> = {
  [InsightType.LOW_STOCK_WARNING]: AlertCircle,
  [InsightType.TRENDING_PRODUCT]: TrendingUp,
  [InsightType.SALES_OPPORTUNITY]: Target,
  [InsightType.CUSTOMER_RETENTION]: Users,
  [InsightType.PRICING_SUGGESTION]: Tag,
  [InsightType.INVENTORY_FORECAST]: LineChart,
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
  /** Display variant: "card" (default) or "note" (Geist Note component) */
  variant?: "card" | "note";
}

/**
 * InsightCard displays a single AI-generated insight with:
 * - Type-specific icon
 * - Title and description
 * - Optional metric highlight
 * - Action button
 * - Dismiss button
 * - Priority indicator
 * 
 * Supports two variants:
 * - "card" (default): Full card layout with icon, metrics, and actions
 * - "note": Inline note using Geist Note component for compact display
 */
export function InsightCard({
  insight,
  onDismiss,
  onAction,
  showPriority = true,
  className,
  animationDelay = 0,
  variant = "card",
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
      ? TrendingUp
      : insight.metric?.trend === "negative"
        ? TrendingDown
        : null;

  const metricTrendColor =
    insight.metric?.trend === "positive"
      ? "text-[var(--ds-green-700)]"
      : insight.metric?.trend === "negative"
        ? "text-[var(--ds-red-700)]"
        : "text-muted-foreground";

  // Render Note variant
  if (variant === "note") {
    const noteType = getInsightNoteType(insight);
    const noteLabel = getInsightNoteLabel(insight.type);

    const actionButton = insight.action && (
      insight.action.href ? (
        <Button
          variant="ghost"
          size="xs"
          asChild
          onClick={handleAction}
          className="h-6 px-2 text-xs"
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
          className="h-6 px-2 text-xs"
        >
          {insight.action.label}
        </Button>
      )
    );

    const dismissButton = onDismiss && (
      <button
        onClick={handleDismiss}
        className={cn(
          "p-1 rounded-md",
          "text-current opacity-50 hover:opacity-100",
          "hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        )}
        aria-label="Dismiss insight"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    );

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
        className={className}
      >
        <Note
          type={noteType}
          label={noteLabel}
          size="medium"
          action={
            <div className="flex items-center gap-1">
              {insight.metric && (
                <span className="text-xs font-medium mr-2">
                  {insight.metric.value}
                </span>
              )}
              {actionButton}
              {dismissButton}
            </div>
          }
        >
          <span className="font-medium">{insight.title}</span>
          {insight.description && (
            <span className="text-current/80"> — {insight.description}</span>
          )}
        </Note>
      </motion.div>
    );
  }

  // Render Card variant (default)

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
        "group relative rounded-xl border bg-card p-[13px] transition-all",
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
        <X className="w-4 h-4" />
      </button>

      <div className="flex gap-[13px]">
        {/* Icon */}
        <div
          className={cn(
            "shrink-0 w-[42px] h-[42px] rounded-xl flex items-center justify-center",
            config.iconBgColor
          )}
        >
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-[8px]">
          {/* Header with title and priority */}
          <div className="flex items-start justify-between gap-[8px] pr-[26px]">
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
          <div className="flex items-center justify-between gap-[13px] pt-[8px]">
            {/* Metric highlight */}
            {insight.metric && (
              <div className="flex items-center gap-1.5">
                {MetricTrendIcon && (
                  <MetricTrendIcon
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
        "group flex items-center gap-[13px] p-[13px] rounded-xl border bg-card",
        "hover:bg-muted/30 transition-colors",
        className
      )}
    >
      <div
        className={cn(
          "shrink-0 w-[32px] h-[32px] rounded-md flex items-center justify-center",
          config.iconBgColor
        )}
      >
        <Icon className={cn("w-4 h-4", config.iconColor)} />
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
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

export default InsightCard;
