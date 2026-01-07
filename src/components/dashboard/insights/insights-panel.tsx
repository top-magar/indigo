"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Idea01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  RefreshIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmptyState } from "@/components/ui/empty-state";

import { InsightCard } from "./insight-card";
import { useInsights } from "@/shared/hooks/use-insights";
import type { Insight } from "./insight-types";

export interface InsightsPanelProps {
  maxInsights?: number;
  defaultCollapsed?: boolean;
  title?: string;
  showRefresh?: boolean;
  onInsightAction?: (insight: Insight) => void;
  className?: string;
}

export function InsightsPanel({
  maxInsights = 5,
  defaultCollapsed = false,
  title = "AI Insights",
  showRefresh = true,
  onInsightAction,
  className,
}: InsightsPanelProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const {
    activeInsights,
    isLoading,
    dismissInsight,
    refreshInsights,
    hasHighPriorityInsights,
    activeCount,
  } = useInsights();


  const displayedInsights = activeInsights.slice(0, maxInsights);
  const hasMoreInsights = activeCount > maxInsights;

  const handleRefresh = async () => {
    await refreshInsights();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {title}
                {activeCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{activeCount}</Badge>
                )}
                {hasHighPriorityInsights && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                )}
              </CardTitle>
            </div>
          </div>
          <CardAction className="flex items-center gap-1">
            {showRefresh && (
              <Button variant="ghost" size="icon-sm" onClick={handleRefresh} disabled={isLoading} className="text-muted-foreground">
                <HugeiconsIcon icon={RefreshIcon} className={cn("h-4 w-4", isLoading && "animate-spin")} />
                <span className="sr-only">Refresh insights</span>
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <HugeiconsIcon icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon} className="h-4 w-4" />
                <span className="sr-only">{isOpen ? "Collapse" : "Expand"} insights</span>
              </Button>
            </CollapsibleTrigger>
          </CardAction>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {isLoading ? (
              <InsightsPanelSkeleton count={3} />
            ) : displayedInsights.length === 0 ? (
              <InsightsPanelEmpty onRefresh={handleRefresh} />
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {displayedInsights.map((insight, index) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onDismiss={dismissInsight}
                      onAction={onInsightAction}
                      animationDelay={index * 0.05}
                    />
                  ))}
                </AnimatePresence>
                {hasMoreInsights && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground text-center pt-2">
                    +{activeCount - maxInsights} more insights available
                  </motion.p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}


interface InsightsPanelSkeletonProps {
  count?: number;
}

export function InsightsPanelSkeleton({ count = 3 }: InsightsPanelSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-4 rounded-lg border bg-card animate-pulse">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface InsightsPanelEmptyProps {
  onRefresh?: () => void;
}

export function InsightsPanelEmpty({ onRefresh }: InsightsPanelEmptyProps) {
  return (
    <EmptyState
      icon={Idea01Icon}
      title="No insights available"
      description="We'll analyze your store data and provide actionable insights soon."
      action={onRefresh ? { label: "Check for insights", onClick: onRefresh } : undefined}
      size="sm"
    />
  );
}


export interface InsightsWidgetProps {
  maxInsights?: number;
  className?: string;
}

export function InsightsWidget({ maxInsights = 3, className }: InsightsWidgetProps) {
  const { activeInsights, isLoading, dismissInsight, hasHighPriorityInsights } = useInsights();
  const displayedInsights = activeInsights.slice(0, maxInsights);

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (displayedInsights.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 px-1">
        <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Insights</span>
        {hasHighPriorityInsights && (
          <span className="relative flex h-1.5 w-1.5 ml-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
          </span>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        {displayedInsights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <InsightCard insight={insight} onDismiss={dismissInsight} showPriority={false} className="text-xs" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default InsightsPanel;
