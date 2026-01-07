"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AnalyticsUpIcon,
  UserMultiple02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils";
import { WidgetType, type Widget } from "./widget-types";

function WidgetLoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function PlaceholderWidget({
  widget,
  icon: Icon = AnalyticsUpIcon,
}: {
  widget: Widget;
  icon?: typeof AnalyticsUpIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-center p-4">
      <div className="rounded-full bg-muted p-3 mb-3">
        <HugeiconsIcon icon={Icon} className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{widget.title}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {widget.description || "Widget content coming soon"}
      </p>
    </div>
  );
}

const LazyStatCardWidget = dynamic(
  () => import("./renderers/stat-card-widget").then((mod) => mod.StatCardWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

const LazyChartWidget = dynamic(
  () => import("./renderers/chart-widget").then((mod) => mod.ChartWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

const LazyActivityFeedWidget = dynamic(
  () => import("./renderers/activity-feed-widget").then((mod) => mod.ActivityFeedWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

const LazyQuickActionsWidget = dynamic(
  () => import("./renderers/quick-actions-widget").then((mod) => mod.QuickActionsWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

const LazyInsightsWidget = dynamic(
  () => import("./renderers/insights-widget").then((mod) => mod.InsightsWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

const LazyRecentOrdersWidget = dynamic(
  () => import("./renderers/recent-orders-widget").then((mod) => mod.RecentOrdersWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

const LazyTopProductsWidget = dynamic(
  () => import("./renderers/top-products-widget").then((mod) => mod.TopProductsWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

// Preset widgets with built-in data fetching
const LazyRevenueWidget = dynamic(
  () => import("./presets/revenue-widget").then((mod) => mod.RevenueWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

const LazyOrdersWidget = dynamic(
  () => import("./presets/orders-widget").then((mod) => mod.OrdersWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

const LazyConversionWidget = dynamic(
  () => import("./presets/conversion-widget").then((mod) => mod.ConversionWidget),
  { loading: () => <WidgetLoadingSkeleton />, ssr: false }
);

export interface WidgetRendererProps {
  widget: Widget;
  className?: string;
}

export function WidgetRenderer({ widget, className }: WidgetRendererProps) {
  const { type } = widget;

  const renderWidget = () => {
    switch (type) {
      case WidgetType.STAT_CARD:
        return <LazyStatCardWidget widget={widget} />;
      case WidgetType.CHART:
      case WidgetType.SALES_BY_CATEGORY:
        return <LazyChartWidget widget={widget} />;
      // Preset widgets with built-in data fetching
      case WidgetType.REVENUE_CHART:
        return <LazyRevenueWidget />;
      case WidgetType.CONVERSION_FUNNEL:
        return <LazyConversionWidget />;
      case WidgetType.ACTIVITY_FEED:
        return <LazyActivityFeedWidget widget={widget} />;
      case WidgetType.QUICK_ACTIONS:
        return <LazyQuickActionsWidget widget={widget} />;
      case WidgetType.INSIGHTS:
        return <LazyInsightsWidget widget={widget} />;
      case WidgetType.RECENT_ORDERS:
        return <LazyRecentOrdersWidget widget={widget} />;
      case WidgetType.TOP_PRODUCTS:
        return <LazyTopProductsWidget widget={widget} />;
      case WidgetType.ORDERS_BY_STATUS:
        return <LazyOrdersWidget />;
      case WidgetType.CUSTOMER_METRICS:
        return <PlaceholderWidget widget={widget} icon={UserMultiple02Icon} />;
      case WidgetType.INVENTORY_ALERTS:
        return <PlaceholderWidget widget={widget} icon={Alert02Icon} />;
      case WidgetType.CUSTOM:
      default:
        return <PlaceholderWidget widget={widget} />;
    }
  };

  return (
    <div className={cn("h-full", className)}>
      <React.Suspense fallback={<WidgetLoadingSkeleton />}>
        {renderWidget()}
      </React.Suspense>
    </div>
  );
}

export { WidgetLoadingSkeleton, PlaceholderWidget };
