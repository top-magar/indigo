// Legacy widgets
export { ActivityFeed } from "./activity-feed";
export type { ActivityItem } from "./activity-feed";

export { QuickActions } from "./quick-actions";
export type { QuickAction } from "./quick-actions";

export { StripeConnectCard } from "./stripe-connect-card";

export { SetupChecklist } from "./setup-checklist";
export { SetupWizard } from "./setup-wizard";
export { createSetupSteps } from "./setup-steps";
export type { SetupStep } from "./setup-steps";

// Widget System Types
export {
  WidgetType,
  WIDGET_SIZE_MAP,
  RESPONSIVE_WIDGET_SIZE_MAP,
  GRID_BREAKPOINTS,
  COLUMNS_PER_BREAKPOINT,
  DEFAULT_WIDGET_CATALOG,
  getWidgetCatalogItem,
  getWidgetsByCategory,
  createWidget,
  isResponsiveSize,
  getSizeForBreakpoint,
} from "./widget-types";
export type {
  Widget,
  WidgetConfig,
  WidgetSize,
  WidgetSizeConfig,
  ResponsiveWidgetSize,
  ResponsiveBreakpoint,
  WidgetPosition,
  WidgetLayout,
  DashboardLayout,
  LayoutPreset,
  WidgetCatalogItem,
  WidgetCategory,
} from "./widget-types";

// Widget Container
export {
  WidgetContainer,
  WidgetPlaceholder,
  WidgetSkeleton,
  WidgetError,
  TouchResizeHandle,
  SwipeToDismiss,
} from "./widget-container";
export type { WidgetContainerProps } from "./widget-container";

// Widget Grid
export {
  WidgetGrid,
  ResponsiveWidgetGrid,
  WidgetDropZone,
  SortableWidget,
} from "./widget-grid";
export type { WidgetGridProps } from "./widget-grid";

// Widget Catalog
export {
  WidgetCatalog,
  WidgetCatalogSheet,
  WidgetCatalogDialog,
  WidgetCatalogCard,
  WidgetCatalogContent,
  WIDGET_ICONS,
  CATEGORY_CONFIG,
} from "./widget-catalog";
export type { WidgetCatalogProps } from "./widget-catalog";

// Widget Renderer
export {
  WidgetRenderer,
  WidgetLoadingSkeleton,
  PlaceholderWidget,
} from "./widget-renderer";
export type { WidgetRendererProps } from "./widget-renderer";

// Widget Renderers
export {
  StatCardWidget,
  ChartWidget,
  ActivityFeedWidget,
  QuickActionsWidget,
  InsightsWidget,
  RecentOrdersWidget,
  TopProductsWidget,
} from "./renderers";

// Preset Widgets (with built-in data fetching)
export {
  RevenueWidget,
  RevenueWidgetSkeleton,
  OrdersWidget,
  OrdersWidgetSkeleton,
  ConversionWidget,
  ConversionWidgetSkeleton,
} from "./presets";
