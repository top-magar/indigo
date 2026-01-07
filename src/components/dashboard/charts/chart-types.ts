/**
 * Chart Types and Interfaces
 * Type definitions for enhanced data visualization components
 */

import type { ChartConfig } from "@/components/ui/chart";

// ============================================================================
// Enums
// ============================================================================

/** Supported export formats */
export enum ExportFormat {
  PNG = "png",
  SVG = "svg",
  CSV = "csv",
  JSON = "json",
}

/** Chart visualization types */
export type ChartType = "line" | "bar" | "area";

/** Time range presets */
export type TimeRange = "7d" | "30d" | "90d" | "1y" | "custom";

/** Comparison mode options */
export type ComparisonMode = "none" | "previous-period" | "previous-year";

// ============================================================================
// Data Point Types
// ============================================================================

/** Base data point for charts */
export interface ChartDataPoint {
  /** X-axis value (typically date or category) */
  x: string | number;
  /** Y-axis value */
  y: number;
  /** Optional label for display */
  label?: string;
  /** Optional metadata for drill-down */
  metadata?: Record<string, unknown>;
  /** Optional comparison value */
  comparisonValue?: number;
}

/** Multi-series data point */
export interface MultiSeriesDataPoint {
  /** X-axis value */
  x: string | number;
  /** Values for each series */
  [seriesKey: string]: string | number | undefined;
}

/** Drill-down data point with hierarchy info */
export interface DrillDownDataPoint extends ChartDataPoint {
  /** Unique identifier for this data point */
  id: string;
  /** Children data for drill-down */
  children?: DrillDownDataPoint[];
  /** Parent ID for breadcrumb navigation */
  parentId?: string | null;
  /** Level in the hierarchy (0 = root) */
  level: number;
}

// ============================================================================
// Chart Configuration
// ============================================================================

/** Series configuration for multi-series charts */
export interface ChartSeries {
  /** Unique key for the series */
  key: string;
  /** Display name */
  name: string;
  /** Color (CSS variable or hex) */
  color: string;
  /** Chart type for this series (allows mixed charts) */
  type?: ChartType;
  /** Whether series is visible */
  visible?: boolean;
  /** Y-axis ID for dual-axis charts */
  yAxisId?: string;
}

/** Main chart configuration */
export interface ChartConfiguration {
  /** Chart title */
  title: string;
  /** Chart description */
  description?: string;
  /** Default chart type */
  type: ChartType;
  /** Series definitions */
  series: ChartSeries[];
  /** Recharts config */
  config: ChartConfig;
  /** X-axis configuration */
  xAxis?: {
    label?: string;
    type?: "category" | "number" | "time";
    format?: (value: unknown) => string;
  };
  /** Y-axis configuration */
  yAxis?: {
    label?: string;
    format?: (value: number) => string;
    domain?: [number | "auto", number | "auto"];
  };
  /** Enable zoom/pan */
  zoomable?: boolean;
  /** Enable drill-down */
  drillable?: boolean;
  /** Enable comparison mode */
  comparable?: boolean;
  /** Height in pixels */
  height?: number;
}

// ============================================================================
// Drill-Down Types
// ============================================================================

/** Drill-down level definition */
export interface DrillDownLevel {
  /** Level identifier */
  id: string;
  /** Display name for breadcrumb */
  name: string;
  /** Data for this level */
  data: DrillDownDataPoint[];
  /** Parent level ID */
  parentId?: string | null;
  /** Filter applied to reach this level */
  filter?: {
    field: string;
    value: string | number;
  };
}

/** Drill-down navigation state */
export interface DrillDownState {
  /** Current level index */
  currentLevel: number;
  /** Stack of visited levels */
  levelStack: DrillDownLevel[];
  /** Currently selected data point */
  selectedPoint?: DrillDownDataPoint;
}

// ============================================================================
// Interaction Types
// ============================================================================

/** Zoom state */
export interface ZoomState {
  /** Left boundary (0-1) */
  left: number;
  /** Right boundary (0-1) */
  right: number;
  /** Top boundary (0-1) */
  top: number;
  /** Bottom boundary (0-1) */
  bottom: number;
  /** Zoom level multiplier */
  scale: number;
}

/** Pan state */
export interface PanState {
  /** X offset */
  x: number;
  /** Y offset */
  y: number;
}

/** Chart interaction state */
export interface ChartInteractionState {
  /** Zoom state */
  zoom: ZoomState;
  /** Pan state */
  pan: PanState;
  /** Selected data point */
  selectedPoint?: ChartDataPoint;
  /** Hovered data point */
  hoveredPoint?: ChartDataPoint;
  /** Visible series keys */
  visibleSeries: Set<string>;
  /** Is fullscreen mode active */
  isFullscreen: boolean;
  /** Current chart type */
  chartType: ChartType;
}

// ============================================================================
// Export Types
// ============================================================================

/** Export options */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat;
  /** Custom filename (without extension) */
  filename?: string;
  /** Include title in export */
  includeTitle?: boolean;
  /** Image quality (0-1) for PNG */
  quality?: number;
  /** Background color for image exports */
  backgroundColor?: string;
}

/** Export result */
export interface ExportResult {
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Blob for download */
  blob?: Blob;
  /** Data URL for preview */
  dataUrl?: string;
}

// ============================================================================
// Comparison Types
// ============================================================================

/** Comparison data */
export interface ComparisonData {
  /** Current period data */
  current: ChartDataPoint[];
  /** Previous period data */
  previous: ChartDataPoint[];
  /** Percentage change */
  percentageChange: number;
  /** Trend direction */
  trend: "up" | "down" | "neutral";
}

/** Comparison chart props */
export interface ComparisonChartProps {
  /** Current period data */
  currentData: ChartDataPoint[];
  /** Previous period data */
  previousData: ChartDataPoint[];
  /** Current period label */
  currentLabel?: string;
  /** Previous period label */
  previousLabel?: string;
  /** Display mode */
  mode: "overlay" | "side-by-side";
  /** Show percentage change */
  showPercentageChange?: boolean;
}

// ============================================================================
// Toolbar Types
// ============================================================================

/** Time range option */
export interface TimeRangeOption {
  value: TimeRange;
  label: string;
  days?: number;
}

/** Toolbar state */
export interface ToolbarState {
  /** Selected time range */
  timeRange: TimeRange;
  /** Custom date range */
  customRange?: {
    from: Date;
    to: Date;
  };
  /** Comparison mode */
  comparisonMode: ComparisonMode;
  /** Current chart type */
  chartType: ChartType;
  /** Is refreshing */
  isRefreshing: boolean;
}

// ============================================================================
// Event Handlers
// ============================================================================

/** Chart click event */
export interface ChartClickEvent {
  /** Clicked data point */
  point: ChartDataPoint;
  /** Series key */
  seriesKey: string;
  /** Native event */
  nativeEvent: React.MouseEvent;
}

/** Chart hover event */
export interface ChartHoverEvent {
  /** Hovered data point */
  point: ChartDataPoint | null;
  /** Series key */
  seriesKey?: string;
}

/** Drill-down event */
export interface DrillDownEvent {
  /** Target data point */
  point: DrillDownDataPoint;
  /** New level */
  level: DrillDownLevel;
  /** Navigation direction */
  direction: "down" | "up";
}

// ============================================================================
// Component Props Types
// ============================================================================

/** Base chart props */
export interface BaseChartProps {
  /** Chart data */
  data: ChartDataPoint[] | MultiSeriesDataPoint[];
  /** Chart configuration */
  config: ChartConfiguration;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string;
  /** Additional class names */
  className?: string;
}

/** Interactive chart props */
export interface InteractiveChartProps extends BaseChartProps {
  /** Click handler */
  onClick?: (event: ChartClickEvent) => void;
  /** Hover handler */
  onHover?: (event: ChartHoverEvent) => void;
  /** Drill-down handler */
  onDrillDown?: (event: DrillDownEvent) => void;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Enable fullscreen */
  enableFullscreen?: boolean;
  /** Enable zoom */
  enableZoom?: boolean;
  /** Enable legend toggle */
  enableLegendToggle?: boolean;
}
