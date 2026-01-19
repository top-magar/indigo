"use client";

import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { 
  DateRangePicker as BaseDateRangePicker,
  type DateRangeValue,
  type DateRangePreset,
  PRESET_CONFIG,
} from "@/components/ui/date-range-picker";
import type { DateRange as AnalyticsDateRange } from "@/app/dashboard/analytics/actions";

// ============================================================================
// Types
// ============================================================================

interface AnalyticsDateRangePickerProps {
  /** Current preset value (e.g., "7d", "30d", "custom") */
  value: AnalyticsDateRange;
  /** Callback when range changes - receives preset and optional custom dates */
  onChange: (range: AnalyticsDateRange, customFrom?: string, customTo?: string) => void;
  /** Disable the picker */
  disabled?: boolean;
  /** Free tier restriction - locks to 7 days */
  isFreeTier?: boolean;
}

// ============================================================================
// Preset Mapping
// ============================================================================

// Map analytics presets to DateRangePicker presets
const ANALYTICS_TO_PICKER_PRESET: Record<AnalyticsDateRange, DateRangePreset | undefined> = {
  today: "today",
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  year: "ytd",
  "12m": "12m",
  custom: "custom",
};

const PICKER_TO_ANALYTICS_PRESET: Record<DateRangePreset, AnalyticsDateRange> = {
  today: "today",
  yesterday: "custom", // Analytics doesn't have yesterday, treat as custom
  "7d": "7d",
  "14d": "custom", // Analytics doesn't have 14d, treat as custom
  "30d": "30d",
  "90d": "90d",
  ytd: "year",
  "12m": "12m",
  custom: "custom",
};

// Analytics presets to show in the picker
const ANALYTICS_PRESETS: DateRangePreset[] = ["today", "7d", "30d", "90d", "ytd", "12m"];

// ============================================================================
// Component
// ============================================================================

/**
 * Analytics-specific DateRangePicker wrapper
 * 
 * This component wraps the base DateRangePicker and provides backward
 * compatibility with the existing analytics API that uses preset strings
 * and optional custom date strings.
 */
export function DateRangePicker({
  value,
  onChange,
  disabled = false,
  isFreeTier = false,
}: AnalyticsDateRangePickerProps) {
  
  // Free tier users can only see 7 days
  if (isFreeTier) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 h-9 rounded-md border border-[var(--ds-gray-300)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)]">
        <CalendarIcon className="w-4 h-4" />
        <span className="text-sm">Last 7 days</span>
      </div>
    );
  }

  // Convert analytics preset to DateRangePicker value
  const pickerValue = useMemo((): DateRangeValue => {
    const preset = ANALYTICS_TO_PICKER_PRESET[value];
    
    if (preset && preset !== "custom") {
      const config = PRESET_CONFIG[preset];
      const range = config.getRange();
      return {
        from: range.from,
        to: range.to,
        preset,
      };
    }
    
    // For custom or unknown, return undefined dates (user will select)
    return {
      from: undefined,
      to: undefined,
      preset: "custom",
    };
  }, [value]);

  // Handle changes from the picker
  const handleChange = useCallback((newValue: DateRangeValue) => {
    if (!newValue.from || !newValue.to) {
      return; // Don't update until we have a complete range
    }

    const analyticsPreset = newValue.preset 
      ? PICKER_TO_ANALYTICS_PRESET[newValue.preset]
      : "custom";

    if (analyticsPreset === "custom" || newValue.preset === "custom") {
      // Custom range - pass formatted dates
      onChange(
        "custom",
        format(newValue.from, "yyyy-MM-dd"),
        format(newValue.to, "yyyy-MM-dd")
      );
    } else {
      // Preset range - just pass the preset name
      onChange(analyticsPreset);
    }
  }, [onChange]);

  return (
    <BaseDateRangePicker
      value={pickerValue}
      onChange={handleChange}
      disabled={disabled}
      presets={ANALYTICS_PRESETS}
      showClear={false}
      numberOfMonths={2}
      align="end"
    />
  );
}

// Re-export the base component for direct usage
export { BaseDateRangePicker as UnifiedDateRangePicker };
