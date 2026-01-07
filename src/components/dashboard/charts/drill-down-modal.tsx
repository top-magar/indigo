"use client";

import { useState, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  Home01Icon,
  ChartLineData02Icon,
  Table01Icon,
  ArrowRight01Icon,
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
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/utils";
import type {
  DrillDownDataPoint,
  DrillDownLevel,
  ChartType,
  ChartConfiguration,
} from "./chart-types";

// ============================================================================
// Props
// ============================================================================

interface DrillDownModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Close handler */
  onOpenChange: (open: boolean) => void;
  /** Current drill-down level stack */
  levelStack: DrillDownLevel[];
  /** Current level index */
  currentLevel: number;
  /** Selected data point */
  selectedPoint?: DrillDownDataPoint;
  /** Navigate to a specific level */
  onNavigateToLevel: (levelIndex: number) => void;
  /** Navigate up one level */
  onNavigateUp: () => void;
  /** Navigate down into a data point */
  onNavigateDown: (point: DrillDownDataPoint) => void;
  /** Chart configuration */
  config?: ChartConfiguration;
  /** Chart type */
  chartType?: ChartType;
  /** Format value for display */
  formatValue?: (value: number) => string;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Default Config
// ============================================================================

const defaultChartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
};

// ============================================================================
// Breadcrumb Component
// ============================================================================

interface BreadcrumbProps {
  levels: DrillDownLevel[];
  currentLevel: number;
  onNavigate: (index: number) => void;
}

function DrillDownBreadcrumb({ levels, currentLevel, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto pb-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 shrink-0"
        onClick={() => onNavigate(0)}
      >
        <HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
      </Button>
      {levels.slice(0, currentLevel + 1).map((level, index) => (
        <div key={level.id} className="flex items-center gap-1 shrink-0">
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="w-3 h-3 text-muted-foreground"
          />
          <Button
            variant={index === currentLevel ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => onNavigate(index)}
          >
            {level.name}
          </Button>
        </div>
      ))}
    </nav>
  );
}

// ============================================================================
// Sub-Chart Component
// ============================================================================

interface SubChartProps {
  data: DrillDownDataPoint[];
  chartType: ChartType;
  onPointClick: (point: DrillDownDataPoint) => void;
  formatValue?: (value: number) => string;
}

function SubChart({ data, chartType, onPointClick, formatValue }: SubChartProps) {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        name: point.label || String(point.x),
        value: point.y,
        ...point,
      })),
    [data]
  );

  const handleClick = (chartEvent: unknown) => {
    // Recharts passes the active payload in the event
    const activePayload = (chartEvent as { activePayload?: Array<{ payload: DrillDownDataPoint }> })?.activePayload;
    if (activePayload && activePayload.length > 0) {
      onPointClick(activePayload[0].payload);
    }
  };

  const commonProps = {
    data: chartData,
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
    onClick: handleClick,
  };

  return (
    <ChartContainer config={defaultChartConfig} className="h-[250px] w-full">
      {chartType === "area" ? (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="drillDownFill" x1="0" y1="0" x2="0" y2="1">
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
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="value"
            type="monotone"
            fill="url(#drillDownFill)"
            stroke="var(--color-value)"
            strokeWidth={2}
            className="cursor-pointer"
          />
        </AreaChart>
      ) : chartType === "bar" ? (
        <BarChart {...commonProps}>
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
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[4, 4, 0, 0]}
            className="cursor-pointer"
          />
        </BarChart>
      ) : (
        <LineChart {...commonProps}>
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
          <Line
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={{ r: 4, cursor: "pointer" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      )}
    </ChartContainer>
  );
}

// ============================================================================
// Data Table Component
// ============================================================================

interface DataTableProps {
  data: DrillDownDataPoint[];
  onRowClick: (point: DrillDownDataPoint) => void;
  formatValue?: (value: number) => string;
}

function DrillDownDataTable({ data, onRowClick, formatValue }: DataTableProps) {
  return (
    <ScrollArea className="h-[300px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">% of Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((point) => {
            const total = data.reduce((sum, p) => sum + p.y, 0);
            const percentage = total > 0 ? ((point.y / total) * 100).toFixed(1) : "0";
            const hasChildren = point.children && point.children.length > 0;

            return (
              <TableRow
                key={point.id}
                className={cn(hasChildren && "cursor-pointer hover:bg-muted/50")}
                onClick={() => hasChildren && onRowClick(point)}
              >
                <TableCell className="font-medium">
                  {point.label || String(point.x)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatValue ? formatValue(point.y) : point.y.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="font-mono">
                    {percentage}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {hasChildren && (
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="w-4 h-4 text-muted-foreground"
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function DrillDownModal({
  open,
  onOpenChange,
  levelStack,
  currentLevel,
  selectedPoint,
  onNavigateToLevel,
  onNavigateUp,
  onNavigateDown,
  chartType = "bar",
  formatValue,
  className,
}: DrillDownModalProps) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  // Get current level data
  const currentLevelData = useMemo(() => {
    if (currentLevel >= 0 && currentLevel < levelStack.length) {
      return levelStack[currentLevel];
    }
    return null;
  }, [levelStack, currentLevel]);

  // Handle point click for drill-down
  const handlePointClick = (point: DrillDownDataPoint) => {
    if (point.children && point.children.length > 0) {
      onNavigateDown(point);
    }
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!currentLevelData?.data) return null;
    const data = currentLevelData.data;
    const total = data.reduce((sum, p) => sum + p.y, 0);
    const avg = data.length > 0 ? total / data.length : 0;
    const max = Math.max(...data.map((p) => p.y));
    const min = Math.min(...data.map((p) => p.y));
    return { total, avg, max, min, count: data.length };
  }, [currentLevelData]);

  if (!currentLevelData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentLevel > 0 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onNavigateUp}
                className="shrink-0"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4" />
              </Button>
            )}
            <span>{currentLevelData.name} Breakdown</span>
          </DialogTitle>
          <DialogDescription>
            Click on data points to drill down into more detail
          </DialogDescription>
        </DialogHeader>

        {/* Breadcrumb Navigation */}
        {levelStack.length > 1 && (
          <DrillDownBreadcrumb
            levels={levelStack}
            currentLevel={currentLevel}
            onNavigate={onNavigateToLevel}
          />
        )}

        {/* Summary Stats */}
        {summaryStats && (
          <div className="grid grid-cols-4 gap-4 py-2">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">
                {formatValue ? formatValue(summaryStats.total) : summaryStats.total.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-lg font-semibold">
                {formatValue ? formatValue(summaryStats.avg) : summaryStats.avg.toFixed(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Max</p>
              <p className="text-lg font-semibold">
                {formatValue ? formatValue(summaryStats.max) : summaryStats.max.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Items</p>
              <p className="text-lg font-semibold">{summaryStats.count}</p>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "chart" | "table")}>
          <TabsList>
            <TabsTrigger value="chart" className="gap-1.5">
              <HugeiconsIcon icon={ChartLineData02Icon} className="w-4 h-4" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-1.5">
              <HugeiconsIcon icon={Table01Icon} className="w-4 h-4" />
              Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-4">
            <SubChart
              data={currentLevelData.data}
              chartType={chartType}
              onPointClick={handlePointClick}
              formatValue={formatValue}
            />
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <DrillDownDataTable
              data={currentLevelData.data}
              onRowClick={handlePointClick}
              formatValue={formatValue}
            />
          </TabsContent>
        </Tabs>

        {/* Selected Point Info */}
        {selectedPoint && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">
              Selected: {selectedPoint.label || String(selectedPoint.x)}
            </p>
            <p className="text-xs text-muted-foreground">
              Value: {formatValue ? formatValue(selectedPoint.y) : selectedPoint.y.toLocaleString()}
              {selectedPoint.children && ` • ${selectedPoint.children.length} sub-items`}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
