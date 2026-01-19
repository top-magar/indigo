"use client";

import * as React from "react";
import { format, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth, startOfYear, isAfter, isBefore, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, X, Check } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ============================================================================
// Types
// ============================================================================

export type DateRangePreset = 
  | "today"
  | "yesterday"
  | "7d"
  | "14d"
  | "30d"
  | "90d"
  | "ytd"
  | "12m"
  | "custom";

export interface DateRangeValue {
  from: Date | undefined;
  to: Date | undefined;
  preset?: DateRangePreset;
}

export interface DateRangePickerProps {
  /** Current date range value */
  value?: DateRangeValue;
  /** Callback when date range changes */
  onChange?: (value: DateRangeValue) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Disable future dates */
  disableFutureDates?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Number of months to display */
  numberOfMonths?: number;
  /** Show preset buttons */
  showPresets?: boolean;
  /** Custom presets to show */
  presets?: DateRangePreset[];
  /** Align popover */
  align?: "start" | "center" | "end";
  /** Additional class name for trigger */
  className?: string;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Show clear button */
  showClear?: boolean;
}

// ============================================================================
// Preset Configurations
// ============================================================================

const PRESET_CONFIG: Record<DateRangePreset, { label: string; shortLabel: string; getRange: () => { from: Date; to: Date } }> = {
  today: {
    label: "Today",
    shortLabel: "Today",
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  yesterday: {
    label: "Yesterday",
    shortLabel: "Yesterday",
    getRange: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
      };
    },
  },
  "7d": {
    label: "Last 7 days",
    shortLabel: "7 days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  "14d": {
    label: "Last 14 days",
    shortLabel: "14 days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 13)),
      to: endOfDay(new Date()),
    }),
  },
  "30d": {
    label: "Last 30 days",
    shortLabel: "30 days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
  "90d": {
    label: "Last 90 days",
    shortLabel: "90 days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 89)),
      to: endOfDay(new Date()),
    }),
  },
  ytd: {
    label: "Year to date",
    shortLabel: "YTD",
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  "12m": {
    label: "Last 12 months",
    shortLabel: "12 months",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 364)),
      to: endOfDay(new Date()),
    }),
  },
  custom: {
    label: "Custom range",
    shortLabel: "Custom",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
};

const DEFAULT_PRESETS: DateRangePreset[] = ["today", "7d", "30d", "90d"];

// ============================================================================
// Helper Functions
// ============================================================================

function formatDateRange(from: Date | undefined, to: Date | undefined): string {
  if (!from) return "";
  
  if (!to || isSameDay(from, to)) {
    return format(from, "MMM d, yyyy");
  }
  
  // Same year - omit year from first date
  if (from.getFullYear() === to.getFullYear()) {
    // Same month - show "Jan 1 - 15, 2024"
    if (from.getMonth() === to.getMonth()) {
      return `${format(from, "MMM d")} – ${format(to, "d, yyyy")}`;
    }
    // Different month - show "Jan 1 - Feb 15, 2024"
    return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;
  }
  
  // Different year - show full dates
  return `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`;
}

function formatCompactDateRange(from: Date | undefined, to: Date | undefined): string {
  if (!from) return "";
  
  if (!to || isSameDay(from, to)) {
    return format(from, "MMM d");
  }
  
  return `${format(from, "MMM d")} – ${format(to, "MMM d")}`;
}

// ============================================================================
// Component
// ============================================================================

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  disabled = false,
  disableFutureDates = true,
  minDate,
  maxDate,
  numberOfMonths = 2,
  showPresets = true,
  presets = DEFAULT_PRESETS,
  align = "start",
  className,
  size = "default",
  showClear = true,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined
  );

  // Sync temp range when value changes externally
  React.useEffect(() => {
    if (value) {
      setTempRange({ from: value.from, to: value.to });
    }
  }, [value?.from, value?.to]);

  // Determine disabled dates
  const disabledDates = React.useCallback(
    (date: Date) => {
      if (disableFutureDates && isAfter(date, endOfDay(new Date()))) {
        return true;
      }
      if (minDate && isBefore(date, startOfDay(minDate))) {
        return true;
      }
      if (maxDate && isAfter(date, endOfDay(maxDate))) {
        return true;
      }
      return false;
    },
    [disableFutureDates, minDate, maxDate]
  );

  // Handle preset selection
  const handlePresetSelect = (preset: DateRangePreset) => {
    const config = PRESET_CONFIG[preset];
    const range = config.getRange();
    
    onChange?.({
      from: range.from,
      to: range.to,
      preset,
    });
    setTempRange({ from: range.from, to: range.to });
    setIsOpen(false);
  };

  // Handle calendar selection
  const handleCalendarSelect = (range: DateRange | undefined) => {
    setTempRange(range);
    
    // Auto-close when both dates are selected
    if (range?.from && range?.to) {
      onChange?.({
        from: range.from,
        to: range.to,
        preset: "custom",
      });
      // Small delay to show the selection before closing
      setTimeout(() => setIsOpen(false), 150);
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.({ from: undefined, to: undefined, preset: undefined });
    setTempRange(undefined);
  };

  // Get display text
  const displayText = React.useMemo(() => {
    if (value?.preset && value.preset !== "custom") {
      return PRESET_CONFIG[value.preset].shortLabel;
    }
    if (value?.from) {
      return formatCompactDateRange(value.from, value.to);
    }
    return placeholder;
  }, [value, placeholder]);

  const hasValue = value?.from !== undefined;

  // Size classes
  const sizeClasses = {
    sm: "h-8 text-xs px-2.5",
    default: "h-9 text-sm px-3",
    lg: "h-10 text-sm px-4",
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "gap-2 font-normal justify-start border-[var(--ds-gray-300)]",
            sizeClasses[size],
            hasValue && "border-[var(--ds-blue-300)] bg-[var(--ds-blue-50)] text-[var(--ds-blue-900)]",
            !hasValue && "text-[var(--ds-gray-600)]",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{displayText}</span>
          {showClear && hasValue && (
            <X
              className="h-3.5 w-3.5 shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-auto"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 border-[var(--ds-gray-200)]" 
        align={align}
        sideOffset={4}
      >
        <div className="flex">
          {/* Presets sidebar */}
          {showPresets && presets.length > 0 && (
            <div className="flex flex-col border-r border-[var(--ds-gray-200)] p-2 min-w-[120px]">
              <span className="px-2 py-1.5 text-xs font-medium text-[var(--ds-gray-500)] uppercase tracking-wider">
                Quick select
              </span>
              {presets.map((preset) => {
                const config = PRESET_CONFIG[preset];
                const isActive = value?.preset === preset;
                
                return (
                  <Button
                    key={preset}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-between h-8 px-2 text-sm font-normal",
                      isActive && "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
                    )}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <span>{config.label}</span>
                    {isActive && <Check className="h-3.5 w-3.5 text-[var(--ds-blue-600)]" />}
                  </Button>
                );
              })}
            </div>
          )}
          
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={numberOfMonths}
              disabled={disabledDates}
              defaultMonth={tempRange?.from || subDays(new Date(), 30)}
              showOutsideDays={false}
            />
            
            {/* Footer with selected range info */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--ds-gray-200)]">
              <div className="text-sm text-[var(--ds-gray-600)]">
                {tempRange?.from ? (
                  tempRange.to ? (
                    formatDateRange(tempRange.from, tempRange.to)
                  ) : (
                    <span>
                      {format(tempRange.from, "MMM d, yyyy")}
                      <span className="text-[var(--ds-gray-400)]"> → Select end date</span>
                    </span>
                  )
                ) : (
                  <span className="text-[var(--ds-gray-400)]">Click to select start date</span>
                )}
              </div>
              
              {tempRange?.from && !tempRange.to && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    // Allow single-day selection
                    if (tempRange.from) {
                      onChange?.({
                        from: tempRange.from,
                        to: tempRange.from,
                        preset: "custom",
                      });
                      setIsOpen(false);
                    }
                  }}
                >
                  Select single day
                </Button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// Utility Exports
// ============================================================================

export { PRESET_CONFIG, formatDateRange, formatCompactDateRange };
