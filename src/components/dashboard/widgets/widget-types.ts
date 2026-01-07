/**
 * Custom Dashboard Widgets Type Definitions
 * Types for the drag-and-drop widget system with personalized layouts
 */

/**
 * Available widget types for the dashboard
 */
export enum WidgetType {
  /** Statistics card showing key metrics */
  STAT_CARD = "stat_card",
  /** Chart visualization (line, bar, pie, etc.) */
  CHART = "chart",
  /** Real-time activity feed */
  ACTIVITY_FEED = "activity_feed",
  /** Quick action buttons */
  QUICK_ACTIONS = "quick_actions",
  /** AI-powered insights panel */
  INSIGHTS = "insights",
  /** Recent orders list */
  RECENT_ORDERS = "recent_orders",
  /** Top performing products */
  TOP_PRODUCTS = "top_products",
  /** Revenue overview chart */
  REVENUE_CHART = "revenue_chart",
  /** Customer metrics */
  CUSTOMER_METRICS = "customer_metrics",
  /** Inventory alerts */
  INVENTORY_ALERTS = "inventory_alerts",
  /** Sales by category */
  SALES_BY_CATEGORY = "sales_by_category",
  /** Conversion funnel */
  CONVERSION_FUNNEL = "conversion_funnel",
  /** Orders by status donut chart */
  ORDERS_BY_STATUS = "orders_by_status",
  /** Custom/placeholder widget */
  CUSTOM = "custom",
}

/**
 * Widget size variants
 */
export type WidgetSize = "small" | "medium" | "large" | "full";

/**
 * Responsive breakpoint type for widget sizing
 */
export type ResponsiveBreakpoint = "mobile" | "tablet" | "desktop";

/**
 * Responsive widget size configuration
 * Allows different sizes per breakpoint
 */
export type ResponsiveWidgetSize = {
  mobile: WidgetSize;
  tablet: WidgetSize;
  desktop: WidgetSize;
};

/**
 * Widget size that can be either a single size or responsive sizes
 */
export type WidgetSizeConfig = WidgetSize | ResponsiveWidgetSize;

/**
 * Check if a size config is responsive
 */
export function isResponsiveSize(size: WidgetSizeConfig): size is ResponsiveWidgetSize {
  return typeof size === "object" && "mobile" in size && "tablet" in size && "desktop" in size;
}

/**
 * Get the size for a specific breakpoint
 */
export function getSizeForBreakpoint(
  size: WidgetSizeConfig,
  breakpoint: ResponsiveBreakpoint
): WidgetSize {
  if (isResponsiveSize(size)) {
    return size[breakpoint];
  }
  return size;
}

/**
 * Widget position in the grid
 */
export interface WidgetPosition {
  /** X position (column) in the grid (0-11 for 12-column grid) */
  x: number;
  /** Y position (row) in the grid */
  y: number;
  /** Width in grid columns (1-12) */
  width: number;
  /** Height in grid rows */
  height: number;
}

/**
 * Widget configuration options
 */
export interface WidgetConfig {
  /** Widget-specific settings */
  settings?: Record<string, unknown>;
  /** Data refresh interval in milliseconds */
  refreshInterval?: number;
  /** Whether to show the widget header */
  showHeader?: boolean;
  /** Whether the widget is collapsible */
  collapsible?: boolean;
  /** Whether the widget is currently collapsed */
  collapsed?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Chart type for chart widgets */
  chartType?: "line" | "bar" | "pie" | "area" | "donut";
  /** Date range for data widgets */
  dateRange?: "today" | "week" | "month" | "quarter" | "year" | "custom";
  /** Maximum items to display (for list widgets) */
  maxItems?: number;
}

/**
 * Core widget interface
 */
export interface Widget {
  /** Unique identifier */
  id: string;
  /** Widget type */
  type: WidgetType;
  /** Display title */
  title: string;
  /** Optional description */
  description?: string;
  /** Widget size (can be responsive) */
  size: WidgetSizeConfig;
  /** Position in the grid */
  position: WidgetPosition;
  /** Responsive positions per breakpoint (optional) */
  responsivePositions?: {
    mobile?: WidgetPosition;
    tablet?: WidgetPosition;
    desktop?: WidgetPosition;
  };
  /** Widget configuration */
  config?: WidgetConfig;
  /** Whether the widget is visible */
  visible: boolean;
  /** Whether the widget is locked (cannot be moved/removed) */
  locked?: boolean;
  /** Custom icon name */
  icon?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Last updated timestamp */
  lastUpdated?: Date;
}

/**
 * Widget layout for a single widget in the grid
 */
export interface WidgetLayout {
  /** Widget ID */
  widgetId: string;
  /** Position in the grid */
  position: WidgetPosition;
  /** Whether the widget is visible */
  visible: boolean;
}

/**
 * Complete dashboard layout configuration
 */
export interface DashboardLayout {
  /** Unique layout identifier */
  id: string;
  /** Layout name */
  name: string;
  /** Layout description */
  description?: string;
  /** Array of widget layouts */
  widgets: WidgetLayout[];
  /** Number of grid columns */
  columns: number;
  /** Row height in pixels */
  rowHeight: number;
  /** Gap between widgets in pixels */
  gap: number;
  /** Whether this is the default layout */
  isDefault?: boolean;
  /** When the layout was created */
  createdAt: Date;
  /** When the layout was last modified */
  updatedAt: Date;
  /** Responsive column configuration */
  responsiveColumns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

/**
 * Layout preset for quick layout switching
 */
export interface LayoutPreset {
  /** Preset identifier */
  id: string;
  /** Preset name */
  name: string;
  /** Preset description */
  description?: string;
  /** Preview image URL */
  previewUrl?: string;
  /** Widget configurations for this preset */
  widgets: Omit<Widget, "id">[];
  /** Whether this is a system preset (cannot be deleted) */
  isSystem?: boolean;
}

/**
 * Widget catalog item for the widget picker
 */
export interface WidgetCatalogItem {
  /** Widget type */
  type: WidgetType;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Icon name */
  icon: string;
  /** Category for grouping */
  category: WidgetCategory;
  /** Default size */
  defaultSize: WidgetSize;
  /** Default configuration */
  defaultConfig?: WidgetConfig;
  /** Preview component or image */
  preview?: React.ReactNode;
  /** Whether the widget is premium/pro only */
  isPremium?: boolean;
  /** Minimum required size */
  minSize?: { width: number; height: number };
  /** Maximum allowed size */
  maxSize?: { width: number; height: number };
}

/**
 * Widget categories for organization
 */
export type WidgetCategory =
  | "analytics"
  | "orders"
  | "products"
  | "customers"
  | "activity"
  | "insights"
  | "custom";

/**
 * Size to grid dimensions mapping
 */
export const WIDGET_SIZE_MAP: Record<WidgetSize, { width: number; height: number }> = {
  small: { width: 3, height: 2 },
  medium: { width: 6, height: 3 },
  large: { width: 6, height: 4 },
  full: { width: 12, height: 4 },
};

/**
 * Responsive size mappings per breakpoint
 * Mobile uses smaller widths, tablet uses medium, desktop uses full
 */
export const RESPONSIVE_WIDGET_SIZE_MAP: Record<
  ResponsiveBreakpoint,
  Record<WidgetSize, { width: number; height: number }>
> = {
  mobile: {
    small: { width: 1, height: 2 },
    medium: { width: 1, height: 3 },
    large: { width: 1, height: 4 },
    full: { width: 1, height: 4 },
  },
  tablet: {
    small: { width: 1, height: 2 },
    medium: { width: 1, height: 3 },
    large: { width: 2, height: 4 },
    full: { width: 2, height: 4 },
  },
  desktop: {
    small: { width: 3, height: 2 },
    medium: { width: 6, height: 3 },
    large: { width: 6, height: 4 },
    full: { width: 12, height: 4 },
  },
};

/**
 * Responsive breakpoints for the grid
 */
export const GRID_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Columns per breakpoint
 */
export const COLUMNS_PER_BREAKPOINT: Record<keyof typeof GRID_BREAKPOINTS, number> = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 12,
  "2xl": 12,
};

/**
 * Default widget catalog
 */
export const DEFAULT_WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    type: WidgetType.STAT_CARD,
    name: "Stat Card",
    description: "Display key metrics with trends",
    icon: "AnalyticsUpIcon",
    category: "analytics",
    defaultSize: "small",
    minSize: { width: 2, height: 2 },
    maxSize: { width: 6, height: 3 },
  },
  {
    type: WidgetType.CHART,
    name: "Chart",
    description: "Visualize data with various chart types",
    icon: "ChartLineData01Icon",
    category: "analytics",
    defaultSize: "medium",
    defaultConfig: { chartType: "line" },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 12, height: 6 },
  },
  {
    type: WidgetType.ACTIVITY_FEED,
    name: "Activity Feed",
    description: "Real-time activity stream",
    icon: "Activity01Icon",
    category: "activity",
    defaultSize: "medium",
    defaultConfig: { maxItems: 10 },
    minSize: { width: 3, height: 3 },
    maxSize: { width: 6, height: 8 },
  },
  {
    type: WidgetType.QUICK_ACTIONS,
    name: "Quick Actions",
    description: "Shortcuts to common tasks",
    icon: "Rocket01Icon",
    category: "activity",
    defaultSize: "small",
    minSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 },
  },
  {
    type: WidgetType.INSIGHTS,
    name: "AI Insights",
    description: "AI-powered recommendations",
    icon: "AiInnovation01Icon",
    category: "insights",
    defaultSize: "medium",
    defaultConfig: { maxItems: 5 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 8, height: 6 },
  },
  {
    type: WidgetType.RECENT_ORDERS,
    name: "Recent Orders",
    description: "Latest customer orders",
    icon: "ShoppingCart01Icon",
    category: "orders",
    defaultSize: "medium",
    defaultConfig: { maxItems: 5 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 12, height: 6 },
  },
  {
    type: WidgetType.TOP_PRODUCTS,
    name: "Top Products",
    description: "Best performing products",
    icon: "PackageIcon",
    category: "products",
    defaultSize: "medium",
    defaultConfig: { maxItems: 5 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 8, height: 6 },
  },
  {
    type: WidgetType.REVENUE_CHART,
    name: "Revenue Chart",
    description: "Revenue over time",
    icon: "MoneyBag01Icon",
    category: "analytics",
    defaultSize: "large",
    defaultConfig: { chartType: "area", dateRange: "month" },
    minSize: { width: 6, height: 3 },
    maxSize: { width: 12, height: 6 },
  },
  {
    type: WidgetType.CUSTOMER_METRICS,
    name: "Customer Metrics",
    description: "Customer statistics and trends",
    icon: "UserMultiple02Icon",
    category: "customers",
    defaultSize: "medium",
    minSize: { width: 4, height: 3 },
    maxSize: { width: 8, height: 5 },
  },
  {
    type: WidgetType.INVENTORY_ALERTS,
    name: "Inventory Alerts",
    description: "Low stock and inventory warnings",
    icon: "Alert02Icon",
    category: "products",
    defaultSize: "small",
    defaultConfig: { maxItems: 5 },
    minSize: { width: 3, height: 2 },
    maxSize: { width: 6, height: 4 },
  },
  {
    type: WidgetType.SALES_BY_CATEGORY,
    name: "Sales by Category",
    description: "Sales breakdown by category",
    icon: "PieChart01Icon",
    category: "analytics",
    defaultSize: "medium",
    defaultConfig: { chartType: "pie" },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 6, height: 5 },
  },
  {
    type: WidgetType.CONVERSION_FUNNEL,
    name: "Conversion Funnel",
    description: "Track conversion stages",
    icon: "FilterIcon",
    category: "analytics",
    defaultSize: "medium",
    minSize: { width: 4, height: 3 },
    maxSize: { width: 8, height: 5 },
  },
  {
    type: WidgetType.ORDERS_BY_STATUS,
    name: "Orders by Status",
    description: "Order distribution by status",
    icon: "ShoppingCart01Icon",
    category: "orders",
    defaultSize: "medium",
    defaultConfig: { chartType: "donut" },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 6, height: 5 },
  },
];

/**
 * Get widget catalog item by type
 */
export function getWidgetCatalogItem(type: WidgetType): WidgetCatalogItem | undefined {
  return DEFAULT_WIDGET_CATALOG.find((item) => item.type === type);
}

/**
 * Get widgets by category
 */
export function getWidgetsByCategory(category: WidgetCategory): WidgetCatalogItem[] {
  return DEFAULT_WIDGET_CATALOG.filter((item) => item.category === category);
}

/**
 * Create a new widget with default values
 */
export function createWidget(
  type: WidgetType,
  position: WidgetPosition,
  overrides?: Partial<Widget>
): Widget {
  const catalogItem = getWidgetCatalogItem(type);
  const size = catalogItem?.defaultSize ?? "medium";
  const dimensions = WIDGET_SIZE_MAP[size];

  return {
    id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: catalogItem?.name ?? "Widget",
    description: catalogItem?.description,
    size,
    position: {
      ...position,
      width: position.width ?? dimensions.width,
      height: position.height ?? dimensions.height,
    },
    config: catalogItem?.defaultConfig,
    visible: true,
    locked: false,
    isLoading: false,
    error: null,
    lastUpdated: new Date(),
    ...overrides,
  };
}
