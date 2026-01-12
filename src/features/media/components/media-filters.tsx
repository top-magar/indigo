"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Image,
  Video,
  FileText,
  Calendar as CalendarIcon,
  ArrowUpDown,
  X,
  Files,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/shared/utils";
import type {
  FileTypeFilter,
  AssetSortOption,
  DateRangeFilter,
  SizeRangeFilter,
  MediaFiltersState,
} from "@/features/media/types";

// File type configuration with icons
const fileTypeOptions: {
  value: FileTypeFilter;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "all", label: "All types", icon: Files },
  { value: "images", label: "Images", icon: Image },
  { value: "videos", label: "Videos", icon: Video },
  { value: "documents", label: "Documents", icon: FileText },
];

// Sort options
const sortOptions: { value: AssetSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "size_desc", label: "Largest" },
  { value: "size_asc", label: "Smallest" },
];

// Date range presets
const dateRangeOptions: { value: DateRangeFilter; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "last90days", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

// File size range options
const sizeRangeOptions: { value: SizeRangeFilter; label: string }[] = [
  { value: "all", label: "Any size" },
  { value: "under1mb", label: "Under 1 MB" },
  { value: "1to5mb", label: "1-5 MB" },
  { value: "5to10mb", label: "5-10 MB" },
  { value: "over10mb", label: "Over 10 MB" },
];

// Default filter state
export const defaultMediaFilters: MediaFiltersState = {
  fileType: "all",
  sort: "newest",
  dateRange: "all",
  sizeRange: "all",
};

interface MediaFiltersProps {
  filters: MediaFiltersState;
  onFiltersChange: (filters: Partial<MediaFiltersState>) => void;
  onClearAll: () => void;
  className?: string;
}

// Individual filter dropdown component
function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  isActive,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; icon?: React.ElementType }[];
  onChange: (value: string) => void;
  icon?: React.ElementType;
  isActive?: boolean;
}) {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1 px-2 text-xs font-normal rounded-md",
            "text-[var(--ds-gray-700)] hover:text-[var(--ds-gray-900)]",
            "hover:bg-[var(--ds-gray-100)]",
            isActive && "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
          )}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span>{selectedOption?.label || label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {options.map((option) => {
          const OptionIcon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "text-xs gap-2",
                value === option.value && "bg-[var(--ds-gray-100)]"
              )}
            >
              {OptionIcon && (
                <OptionIcon className="h-3.5 w-3.5 text-[var(--ds-gray-600)]" />
              )}
              <span className="flex-1">{option.label}</span>
              {value === option.value && (
                <Check className="h-3.5 w-3.5 text-[var(--ds-gray-900)]" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MediaFilters({
  filters,
  onFiltersChange,
  onClearAll,
  className,
}: MediaFiltersProps) {
  const [customDateOpen, setCustomDateOpen] = React.useState(false);

  // Calculate active filters count
  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.fileType !== "all") count++;
    if (filters.sort !== "newest") count++;
    if (filters.dateRange !== "all") count++;
    if (filters.sizeRange !== "all") count++;
    return count;
  }, [filters]);

  // Handle date range change with custom date support
  const handleDateRangeChange = (value: string) => {
    if (value === "custom") {
      setCustomDateOpen(true);
      onFiltersChange({ dateRange: value as DateRangeFilter });
    } else {
      onFiltersChange({
        dateRange: value as DateRangeFilter,
        customDateFrom: undefined,
        customDateTo: undefined,
      });
    }
  };

  // Get display label for date filter
  const getDateLabel = () => {
    if (filters.dateRange === "custom") {
      if (filters.customDateFrom && filters.customDateTo) {
        return `${format(filters.customDateFrom, "MMM d")} - ${format(filters.customDateTo, "MMM d")}`;
      }
      if (filters.customDateFrom) {
        return `From ${format(filters.customDateFrom, "MMM d")}`;
      }
      return "Custom";
    }
    return dateRangeOptions.find((o) => o.value === filters.dateRange)?.label || "Date";
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Type Filter */}
      <FilterDropdown
        label="Type"
        value={filters.fileType}
        options={fileTypeOptions}
        onChange={(v) => onFiltersChange({ fileType: v as FileTypeFilter })}
        icon={Files}
        isActive={filters.fileType !== "all"}
      />

      {/* Sort Filter */}
      <FilterDropdown
        label="Sort"
        value={filters.sort}
        options={sortOptions}
        onChange={(v) => onFiltersChange({ sort: v as AssetSortOption })}
        icon={ArrowUpDown}
        isActive={filters.sort !== "newest"}
      />

      {/* Date Filter */}
      <Popover open={customDateOpen} onOpenChange={setCustomDateOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1 px-2 text-xs font-normal rounded-md",
                "text-[var(--ds-gray-700)] hover:text-[var(--ds-gray-900)]",
                "hover:bg-[var(--ds-gray-100)]",
                filters.dateRange !== "all" && "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{getDateLabel()}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            {dateRangeOptions.slice(0, -1).map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleDateRangeChange(option.value)}
                className={cn(
                  "text-xs gap-2",
                  filters.dateRange === option.value && "bg-[var(--ds-gray-100)]"
                )}
              >
                <span className="flex-1">{option.label}</span>
                {filters.dateRange === option.value && (
                  <Check className="h-3.5 w-3.5 text-[var(--ds-gray-900)]" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <PopoverTrigger asChild>
              <DropdownMenuItem
                className={cn(
                  "text-xs gap-2",
                  filters.dateRange === "custom" && "bg-[var(--ds-gray-100)]"
                )}
              >
                <span className="flex-1">Custom range</span>
                {filters.dateRange === "custom" && (
                  <Check className="h-3.5 w-3.5 text-[var(--ds-gray-900)]" />
                )}
              </DropdownMenuItem>
            </PopoverTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <div className="text-xs font-medium text-[var(--ds-gray-900)]">
              Select date range
            </div>
            <div className="flex gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-[var(--ds-gray-600)]">From</span>
                <Calendar
                  mode="single"
                  selected={filters.customDateFrom}
                  onSelect={(date) => onFiltersChange({ customDateFrom: date, dateRange: "custom" })}
                  disabled={(date) =>
                    date > new Date() ||
                    (filters.customDateTo ? date > filters.customDateTo : false)
                  }
                  className="rounded-md border border-[var(--ds-gray-200)]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[var(--ds-gray-600)]">To</span>
                <Calendar
                  mode="single"
                  selected={filters.customDateTo}
                  onSelect={(date) => onFiltersChange({ customDateTo: date, dateRange: "custom" })}
                  disabled={(date) =>
                    date > new Date() ||
                    (filters.customDateFrom ? date < filters.customDateFrom : false)
                  }
                  className="rounded-md border border-[var(--ds-gray-200)]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setCustomDateOpen(false)}
                className="h-7 px-3 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Size Filter */}
      <FilterDropdown
        label="Size"
        value={filters.sizeRange}
        options={sizeRangeOptions}
        onChange={(v) => onFiltersChange({ sizeRange: v as SizeRangeFilter })}
        isActive={filters.sizeRange !== "all"}
      />

      {/* Clear all button */}
      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-2 text-xs text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)]"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

// Simplified filter chips for showing active filters below search
interface MediaFilterChipsProps {
  filters: MediaFiltersState;
  onFiltersChange: (filters: Partial<MediaFiltersState>) => void;
  onClearAll: () => void;
  search?: string;
  onClearSearch?: () => void;
  className?: string;
}

export function MediaFilterChips({
  filters,
  onFiltersChange,
  onClearAll,
  search,
  onClearSearch,
  className,
}: MediaFilterChipsProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = React.useMemo(() => {
    const result: { key: string; label: string; onRemove: () => void }[] = [];

    // Search chip
    if (search && onClearSearch) {
      result.push({
        key: "search",
        label: `"${search.length > 15 ? search.slice(0, 15) + "…" : search}"`,
        onRemove: onClearSearch,
      });
    }

    // File type chip
    if (filters.fileType !== "all") {
      const option = fileTypeOptions.find((o) => o.value === filters.fileType);
      if (option) {
        result.push({
          key: "fileType",
          label: option.label,
          onRemove: () => onFiltersChange({ fileType: "all" }),
        });
      }
    }

    // Date range chip
    if (filters.dateRange !== "all") {
      let label = dateRangeOptions.find((o) => o.value === filters.dateRange)?.label || "";
      if (filters.dateRange === "custom" && filters.customDateFrom && filters.customDateTo) {
        label = `${format(filters.customDateFrom, "MMM d")} - ${format(filters.customDateTo, "MMM d")}`;
      }
      result.push({
        key: "dateRange",
        label,
        onRemove: () => onFiltersChange({ dateRange: "all", customDateFrom: undefined, customDateTo: undefined }),
      });
    }

    // Size range chip
    if (filters.sizeRange !== "all") {
      const option = sizeRangeOptions.find((o) => o.value === filters.sizeRange);
      if (option) {
        result.push({
          key: "sizeRange",
          label: option.label,
          onRemove: () => onFiltersChange({ sizeRange: "all" }),
        });
      }
    }

    return result;
  }, [filters, onFiltersChange, search, onClearSearch]);

  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)} role="list">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="outline"
          className="h-5 gap-1 pr-1 text-[10px] font-normal rounded-sm border-[var(--ds-gray-200)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)]"
          role="listitem"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full p-0.5 hover:bg-[var(--ds-gray-200)] transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-[10px] text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)] px-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// Export helper to get filter label for display
export function getFilterLabel(
  filterType: keyof MediaFiltersState,
  value: string
): string {
  switch (filterType) {
    case "fileType":
      return fileTypeOptions.find((o) => o.value === value)?.label || value;
    case "sort":
      return sortOptions.find((o) => o.value === value)?.label || value;
    case "dateRange":
      return dateRangeOptions.find((o) => o.value === value)?.label || value;
    case "sizeRange":
      return sizeRangeOptions.find((o) => o.value === value)?.label || value;
    default:
      return value;
  }
}

// Export options for external use
export { fileTypeOptions, sortOptions, dateRangeOptions, sizeRangeOptions };
