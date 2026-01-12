"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  LineChart,
  BarChart3,
  AreaChart,
  Download,
  RefreshCw,
  GitCompare,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils";
import type {
  TimeRange,
  ChartType,
  ComparisonMode,
  ExportFormat,
  TimeRangeOption,
} from "./chart-types";

// ============================================================================
// Constants
// ============================================================================

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "1y", label: "Last year", days: 365 },
  { value: "custom", label: "Custom range" },
];

const CHART_TYPE_OPTIONS: { value: ChartType; label: string; icon: LucideIcon }[] = [
  { value: "line", label: "Line", icon: LineChart },
  { value: "bar", label: "Bar", icon: BarChart3 },
  { value: "area", label: "Area", icon: AreaChart },
];

// ============================================================================
// Props
// ============================================================================

interface ChartToolbarProps {
  /** Current time range */
  timeRange: TimeRange;
  /** Time range change handler */
  onTimeRangeChange: (range: TimeRange, customFrom?: Date, customTo?: Date) => void;
  /** Current chart type */
  chartType: ChartType;
  /** Chart type change handler */
  onChartTypeChange: (type: ChartType) => void;
  /** Current comparison mode */
  comparisonMode?: ComparisonMode;
  /** Comparison mode change handler */
  onComparisonModeChange?: (mode: ComparisonMode) => void;
  /** Export handler */
  onExport?: (format: ExportFormat) => void;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Is refreshing */
  isRefreshing?: boolean;
  /** Show comparison toggle */
  showComparison?: boolean;
  /** Show chart type switcher */
  showChartTypeSwitcher?: boolean;
  /** Show export button */
  showExport?: boolean;
  /** Show refresh button */
  showRefresh?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ChartToolbar({
  timeRange,
  onTimeRangeChange,
  chartType,
  onChartTypeChange,
  comparisonMode = "none",
  onComparisonModeChange,
  onExport,
  onRefresh,
  isRefreshing = false,
  showComparison = true,
  showChartTypeSwitcher = true,
  showExport = true,
  showRefresh = true,
  className,
}: ChartToolbarProps) {
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  // Handle time range selection
  const handleTimeRangeChange = useCallback(
    (value: string) => {
      if (value === "custom") {
        setIsCustomOpen(true);
      } else {
        onTimeRangeChange(value as TimeRange);
      }
    },
    [onTimeRangeChange]
  );

  // Apply custom date range
  const handleCustomApply = useCallback(() => {
    if (customFrom && customTo) {
      onTimeRangeChange("custom", customFrom, customTo);
      setIsCustomOpen(false);
    }
  }, [customFrom, customTo, onTimeRangeChange]);

  // Toggle comparison mode
  const handleComparisonToggle = useCallback(() => {
    if (onComparisonModeChange) {
      onComparisonModeChange(
        comparisonMode === "none" ? "previous-period" : "none"
      );
    }
  }, [comparisonMode, onComparisonModeChange]);

  // Get current time range label
  const currentRangeLabel =
    TIME_RANGE_OPTIONS.find((opt) => opt.value === timeRange)?.label || "Select range";

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Time Range Selector */}
      <Select value={timeRange} onValueChange={handleTimeRangeChange}>
        <SelectTrigger className="w-[160px]">
          <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Select range">{currentRangeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIME_RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {timeRange === option.value && (
                  <Check
                    className="w-4 h-4 text-primary ml-2"
                  />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom Date Range Popover */}
      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <span className="sr-only">Custom date range</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Select Date Range</h4>
              <p className="text-xs text-muted-foreground">
                Choose start and end dates
              </p>
            </div>

            <div className="flex gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">From</label>
                <Calendar
                  mode="single"
                  selected={customFrom}
                  onSelect={setCustomFrom}
                  disabled={(date) =>
                    date > new Date() || (customTo ? date > customTo : false)
                  }
                  initialFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">To</label>
                <Calendar
                  mode="single"
                  selected={customTo}
                  onSelect={setCustomTo}
                  disabled={(date) =>
                    date > new Date() || (customFrom ? date < customFrom : false)
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                {customFrom && customTo ? (
                  <>
                    {format(customFrom, "MMM d, yyyy")} -{" "}
                    {format(customTo, "MMM d, yyyy")}
                  </>
                ) : (
                  "Select both dates"
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCustomApply}
                  disabled={!customFrom || !customTo}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Comparison Toggle */}
      {showComparison && onComparisonModeChange && (
        <Button
          variant={comparisonMode !== "none" ? "secondary" : "outline"}
          size="sm"
          onClick={handleComparisonToggle}
          className="gap-1.5"
        >
          <GitCompare className="w-4 h-4" />
          <span className="hidden sm:inline">Compare</span>
        </Button>
      )}

      <Separator orientation="vertical" className="h-6 hidden sm:block" />

      {/* Chart Type Switcher */}
      {showChartTypeSwitcher && (
        <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
          {CHART_TYPE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-sm",
                chartType === option.value && "bg-background shadow-sm"
              )}
              onClick={() => onChartTypeChange(option.value)}
              title={option.label}
            >
              <option.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Export Dropdown */}
      {showExport && onExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("png" as ExportFormat)}>
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("svg" as ExportFormat)}>
              Export as SVG
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExport("csv" as ExportFormat)}>
              Export data as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("json" as ExportFormat)}>
              Export data as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Refresh Button */}
      {showRefresh && onRefresh && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh data"
        >
          <RefreshCw
            className={cn("w-4 h-4", isRefreshing && "animate-spin")}
          />
        </Button>
      )}
    </div>
  );
}

export { TIME_RANGE_OPTIONS, CHART_TYPE_OPTIONS };
