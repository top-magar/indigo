"use client";

import * as React from "react";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  ShoppingCart01Icon,
  Package01Icon,
  UserMultipleIcon,
  Calendar03Icon,
  Cancel01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils";
import type {
  SearchFiltersProps,
  SearchEntityType,
  SearchStatus,
  DateRangePreset,
} from "./types";

// Entity type configuration
const entityTypes: { value: SearchEntityType; label: string; icon: typeof ShoppingCart01Icon }[] = [
  { value: "orders", label: "Orders", icon: ShoppingCart01Icon },
  { value: "products", label: "Products", icon: Package01Icon },
  { value: "customers", label: "Customers", icon: UserMultipleIcon },
];

// Status options
const statusOptions: { value: SearchStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

// Date range presets
const dateRangePresets: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "last90days", label: "Last 90 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "custom", label: "Custom range" },
];

export function SearchFilters({
  filters,
  onFiltersChange,
  onReset,
  className,
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = React.useState(false);

  // Calculate active filters count
  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.entityTypes.length < 3) count++;
    if (filters.status !== "all") count++;
    if (filters.dateRangePreset !== "last30days") count++;
    return count;
  }, [filters]);

  // Handle entity type toggle
  const handleEntityTypeToggle = (entityType: SearchEntityType) => {
    const current = filters.entityTypes;
    const updated = current.includes(entityType)
      ? current.filter((t) => t !== entityType)
      : [...current, entityType];

    // Ensure at least one type is selected
    if (updated.length > 0) {
      onFiltersChange({ entityTypes: updated });
    }
  };

  // Handle status change
  const handleStatusChange = (status: SearchStatus) => {
    onFiltersChange({ status });
  };

  // Handle date range preset change
  const handleDateRangeChange = (preset: DateRangePreset) => {
    if (preset === "custom") {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
    onFiltersChange({ dateRangePreset: preset });
  };

  // Handle custom date selection
  const handleCustomDateSelect = (range: { from?: Date; to?: Date }) => {
    onFiltersChange({
      customDateRange: {
        from: range.from,
        to: range.to,
      },
    });
  };

  // Handle reset
  const handleReset = () => {
    onReset();
    setShowCustomDatePicker(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs",
            activeCount > 0 && "border-primary/50",
            className
          )}
        >
          <HugeiconsIcon icon={FilterIcon} className="size-3.5" />
          <span>Filters</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-4 px-1 text-[0.625rem]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="p-3 space-y-4">
          <PopoverHeader>
            <div className="flex items-center justify-between">
              <PopoverTitle>Search Filters</PopoverTitle>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </PopoverHeader>

          {/* Entity Types */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Search in
            </Label>
            <div className="space-y-1.5">
              {entityTypes.map((type) => (
                <label
                  key={type.value}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={filters.entityTypes.includes(type.value)}
                    onCheckedChange={() => handleEntityTypeToggle(type.value)}
                  />
                  <HugeiconsIcon
                    icon={type.icon}
                    className="size-4 text-muted-foreground"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Status
            </Label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      {filters.status === option.value && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="size-3.5 text-primary ml-auto"
                        />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Date range
            </Label>
            <Select
              value={filters.dateRangePreset}
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger className="h-8 text-xs">
                <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 mr-2" />
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRangePresets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom Date Picker */}
            {(filters.dateRangePreset === "custom" || showCustomDatePicker) && (
              <div className="pt-2 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[0.625rem] text-muted-foreground">
                      From
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs justify-start font-normal"
                        >
                          {filters.customDateRange.from ? (
                            format(filters.customDateRange.from, "MMM d, yyyy")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.customDateRange.from}
                          onSelect={(date) =>
                            handleCustomDateSelect({
                              from: date,
                              to: filters.customDateRange.to,
                            })
                          }
                          disabled={(date) =>
                            date > new Date() ||
                            (filters.customDateRange.to
                              ? date > filters.customDateRange.to
                              : false)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[0.625rem] text-muted-foreground">
                      To
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs justify-start font-normal"
                        >
                          {filters.customDateRange.to ? (
                            format(filters.customDateRange.to, "MMM d, yyyy")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.customDateRange.to}
                          onSelect={(date) =>
                            handleCustomDateSelect({
                              from: filters.customDateRange.from,
                              to: date,
                            })
                          }
                          disabled={(date) =>
                            date > new Date() ||
                            (filters.customDateRange.from
                              ? date < filters.customDateRange.from
                              : false)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-2 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-7 text-xs"
          >
            Apply filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Filter chips component for displaying active filters
export function SearchFilterChips({
  filters,
  onFiltersChange,
  onReset,
  className,
}: SearchFiltersProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  // Entity type chips (only show if not all selected)
  if (filters.entityTypes.length < 3) {
    filters.entityTypes.forEach((type) => {
      const config = entityTypes.find((t) => t.value === type);
      if (config) {
        chips.push({
          key: `entity-${type}`,
          label: config.label,
          onRemove: () => {
            const updated = filters.entityTypes.filter((t) => t !== type);
            if (updated.length > 0) {
              onFiltersChange({ entityTypes: updated });
            }
          },
        });
      }
    });
  }

  // Status chip
  if (filters.status !== "all") {
    const statusConfig = statusOptions.find((s) => s.value === filters.status);
    if (statusConfig) {
      chips.push({
        key: "status",
        label: statusConfig.label,
        onRemove: () => onFiltersChange({ status: "all" }),
      });
    }
  }

  // Date range chip
  if (filters.dateRangePreset !== "last30days") {
    const dateConfig = dateRangePresets.find(
      (d) => d.value === filters.dateRangePreset
    );
    if (dateConfig) {
      let label = dateConfig.label;
      if (
        filters.dateRangePreset === "custom" &&
        filters.customDateRange.from &&
        filters.customDateRange.to
      ) {
        label = `${format(filters.customDateRange.from, "MMM d")} - ${format(
          filters.customDateRange.to,
          "MMM d"
        )}`;
      }
      chips.push({
        key: "date",
        label,
        onRemove: () =>
          onFiltersChange({
            dateRangePreset: "last30days",
            customDateRange: { from: undefined, to: undefined },
          }),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="outline"
          className="h-6 gap-1 pr-1 text-xs font-normal"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full p-0.5 hover:bg-muted transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
            <span className="sr-only">Remove {chip.label} filter</span>
          </button>
        </Badge>
      ))}
      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
