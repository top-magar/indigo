"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Maximize01Icon,
  Minimize01Icon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
  ArrowReloadHorizontalIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/shared/utils";
import { useChartInteraction } from "@/shared/hooks/use-chart-interaction";
import { ChartToolbar } from "./chart-toolbar";
import { ChartExport } from "./chart-export";
import { DrillDownModal } from "./drill-down-modal";
import type {
  ChartDataPoint,
  DrillDownDataPoint,
  ChartType,
  TimeRange,
  ComparisonMode,
  ExportFormat,
  ChartSeries,
} from "./chart-types";

// ============================================================================
// Props
// ============================================================================

interface InteractiveChartProps {
  /** Chart data */
  data: ChartDataPoint[];
  /** Chart title */
  title: string;
  /** Chart description */
  description?: string;
  /** Series configuration */
  series?: ChartSeries[];
  /** Initial chart type */
  chartType?: ChartType;
  /** Chart height */
  height?: number;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Enable fullscreen mode */
  enableFullscreen?: boolean;
  /** Enable zoom controls */
  enableZoom?: boolean;
  /** Enable legend toggle */
  enableLegendToggle?: boolean;
  /** Enable drill-down */
  enableDrillDown?: boolean;
  /** Drill-down data provider */
  getDrillDownData?: (point: DrillDownDataPoint) => DrillDownDataPoint[] | Promise<DrillDownDataPoint[]>;
  /** Time range */
  timeRange?: TimeRange;
  /** Time range change handler */
  onTimeRangeChange?: (range: TimeRange, customFrom?: Date, customTo?: Date) => void;
  /** Comparison mode */
  comparisonMode?: ComparisonMode;
  /** Comparison mode change handler */
  onComparisonModeChange?: (mode: ComparisonMode) => void;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Is refreshing */
  isRefreshing?: boolean;
  /** Click handler */
  onClick?: (point: ChartDataPoint) => void;
  /** Format value for display */
  formatValue?: (value: number) => string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Default Config
// ============================================================================

const defaultChartConfig: ChartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
};

// ============================================================================
// Component
// ============================================================================

export function InteractiveChart({
  data,
  title,
  description,
  series,
  chartType: initialChartType = "area",
  height = 300,
  showToolbar = true,
  enableFullscreen = true,
  enableZoom = true,
  enableLegendToggle = true,
  enableDrillDown = false,
  getDrillDownData,
  timeRange = "30d",
  onTimeRangeChange,
  comparisonMode = "none",
  onComparisonModeChange,
  onRefresh,
  isRefreshing = false,
  onClick,
  formatValue,
  isLoading = false,
  className,
}: InteractiveChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const [zoomLeft, setZoomLeft] = useState<string | null>(null);
  const [zoomRight, setZoomRight] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  // Use chart interaction hook
  const {
    state,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleSeries,
    setChartType,
    drillDown,
    navigateDown,
    navigateUp,
    navigateToLevel,
  } = useChartInteraction({
    initialChartType,
    initialVisibleSeries: series?.map((s) => s.key) || ["value"],
  });

  // Build chart config from series
  const chartConfig = useMemo<ChartConfig>(() => {
    if (!series || series.length === 0) {
      return defaultChartConfig;
    }
    return series.reduce((config, s) => {
      config[s.key] = {
        label: s.name,
        color: s.color,
      };
      return config;
    }, {} as ChartConfig);
  }, [series]);

  // Transform data for chart
  const chartData = useMemo(() => {
    return data.map((point) => ({
      name: point.label || String(point.x),
      value: point.y,
      ...point,
    }));
  }, [data]);

  // Filter data based on zoom
  const filteredData = useMemo(() => {
    if (state.zoom.scale <= 1) return chartData;
    const startIndex = Math.floor(chartData.length * state.zoom.left);
    const endIndex = Math.ceil(chartData.length * state.zoom.right);
    return chartData.slice(startIndex, endIndex);
  }, [chartData, state.zoom]);

  // Handle chart click - receives data from Recharts event
  const handleChartClick = useCallback(
    (data: unknown) => {
      // Recharts passes the active payload in the event
      const activePayload = (data as { activePayload?: Array<{ payload: ChartDataPoint }> })?.activePayload;
      if (!activePayload || activePayload.length === 0) return;
      
      const point = activePayload[0].payload;

      if (enableDrillDown && getDrillDownData) {
        const drillDownPoint: DrillDownDataPoint = {
          ...point,
          id: String(point.x),
          level: drillDown.currentLevel,
        };

        Promise.resolve(getDrillDownData(drillDownPoint)).then((childData) => {
          if (childData.length > 0) {
            navigateDown(drillDownPoint, childData);
            setIsDrillDownOpen(true);
          }
        });
      } else if (onClick) {
        onClick(point);
      }
    },
    [enableDrillDown, getDrillDownData, drillDown.currentLevel, navigateDown, onClick]
  );

  // Handle zoom selection
  const handleMouseDown = useCallback(
    (e: { activeLabel?: string }) => {
      if (!enableZoom || !e.activeLabel) return;
      setIsZooming(true);
      setZoomLeft(e.activeLabel);
    },
    [enableZoom]
  );

  const handleMouseMove = useCallback(
    (e: { activeLabel?: string }) => {
      if (!isZooming || !e.activeLabel) return;
      setZoomRight(e.activeLabel);
    },
    [isZooming]
  );

  const handleMouseUp = useCallback(() => {
    if (!isZooming || !zoomLeft || !zoomRight) {
      setIsZooming(false);
      setZoomLeft(null);
      setZoomRight(null);
      return;
    }

    const leftIndex = chartData.findIndex((d) => d.name === zoomLeft);
    const rightIndex = chartData.findIndex((d) => d.name === zoomRight);

    if (leftIndex !== -1 && rightIndex !== -1 && leftIndex !== rightIndex) {
      zoomIn();
    }

    setIsZooming(false);
    setZoomLeft(null);
    setZoomRight(null);
  }, [isZooming, zoomLeft, zoomRight, chartData, zoomIn]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-col items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const commonChartProps = {
    data: filteredData,
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onClick: handleChartClick,
  };

  const renderChart = (chartHeight: number) => (
    <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
      {state.chartType === "area" ? (
        <AreaChart {...commonChartProps}>
          <defs>
            <linearGradient id="interactiveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} className="stroke-muted" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-muted-foreground text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatValue}
            className="text-muted-foreground text-xs"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) =>
                  formatValue ? formatValue(value as number) : (value as number).toLocaleString()
                }
              />
            }
          />
          {state.visibleSeries.has("value") && (
            <Area
              dataKey="value"
              type="monotone"
              fill="url(#interactiveFill)"
              stroke="var(--color-value)"
              strokeWidth={2}
              className={cn(enableDrillDown && "cursor-pointer")}
            />
          )}
          {zoomLeft && zoomRight && (
            <ReferenceArea
              x1={zoomLeft}
              x2={zoomRight}
              strokeOpacity={0.3}
              fill="var(--chart-1)"
              fillOpacity={0.1}
            />
          )}
          {enableLegendToggle && <ChartLegend content={<ChartLegendContent />} />}
        </AreaChart>
      ) : state.chartType === "bar" ? (
        <BarChart {...commonChartProps}>
          <CartesianGrid vertical={false} className="stroke-muted" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-muted-foreground text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatValue}
            className="text-muted-foreground text-xs"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {state.visibleSeries.has("value") && (
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[4, 4, 0, 0]}
              className={cn(enableDrillDown && "cursor-pointer")}
            />
          )}
          {enableLegendToggle && <ChartLegend content={<ChartLegendContent />} />}
        </BarChart>
      ) : (
        <LineChart {...commonChartProps}>
          <CartesianGrid vertical={false} className="stroke-muted" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-muted-foreground text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatValue}
            className="text-muted-foreground text-xs"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {state.visibleSeries.has("value") && (
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 3, cursor: enableDrillDown ? "pointer" : "default" }}
              activeDot={{ r: 5 }}
            />
          )}
          {enableLegendToggle && <ChartLegend content={<ChartLegendContent />} />}
        </LineChart>
      )}
    </ChartContainer>
  );

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-1">
            {enableZoom && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" onClick={zoomIn}>
                      <HugeiconsIcon icon={ZoomInAreaIcon} className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" onClick={zoomOut}>
                      <HugeiconsIcon icon={ZoomOutAreaIcon} className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
                {state.zoom.scale > 1 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon-sm" onClick={resetZoom}>
                        <HugeiconsIcon icon={ArrowReloadHorizontalIcon} className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset Zoom</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            )}

            {enableLegendToggle && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleSeries("value")}
                    >
                      <HugeiconsIcon
                        icon={state.visibleSeries.has("value") ? ViewIcon : ViewOffIcon}
                        className="w-4 h-4"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {state.visibleSeries.has("value") ? "Hide" : "Show"} Series
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {enableFullscreen && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setIsFullscreenOpen(true)}
                    >
                      <HugeiconsIcon icon={Maximize01Icon} className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fullscreen</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <ChartExport
              chartRef={chartRef}
              data={data}
              defaultFilename={title.toLowerCase().replace(/\s+/g, "-")}
              title={title}
            />
          </div>
        </CardHeader>

        {showToolbar && onTimeRangeChange && (
          <div className="px-6 pb-2">
            <ChartToolbar
              timeRange={timeRange}
              onTimeRangeChange={onTimeRangeChange}
              chartType={state.chartType}
              onChartTypeChange={setChartType}
              comparisonMode={comparisonMode}
              onComparisonModeChange={onComparisonModeChange}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              showComparison={!!onComparisonModeChange}
              showExport={false}
            />
          </div>
        )}

        <CardContent>
          <div ref={chartRef}>{renderChart(height)}</div>
        </CardContent>
      </Card>

      {enableFullscreen && (
        <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">{renderChart(500)}</div>
          </DialogContent>
        </Dialog>
      )}

      {enableDrillDown && (
        <DrillDownModal
          open={isDrillDownOpen}
          onOpenChange={setIsDrillDownOpen}
          levelStack={drillDown.levelStack}
          currentLevel={drillDown.currentLevel}
          selectedPoint={drillDown.selectedPoint}
          onNavigateToLevel={navigateToLevel}
          onNavigateUp={navigateUp}
          onNavigateDown={(point) => {
            if (getDrillDownData) {
              Promise.resolve(getDrillDownData(point)).then((childData) => {
                if (childData.length > 0) {
                  navigateDown(point, childData);
                }
              });
            }
          }}
          chartType={state.chartType}
          formatValue={formatValue}
        />
      )}
    </>
  );
}

export function InteractiveChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full" style={{ height }} />
      </CardContent>
    </Card>
  );
}
