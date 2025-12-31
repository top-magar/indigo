"use client";

import { useState, useMemo, ReactNode } from "react";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    FilterIcon,
    Cancel01Icon,
    Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Types
export interface FilterOption {
    value: string;
    label: string;
    count?: number;
    color?: string; // e.g., "bg-chart-2" for status dots
}

export interface FilterConfig {
    key: string;
    label: string;
    type: "select" | "date-range";
    options?: FilterOption[];
    placeholder?: string;
}

export interface ActiveFilter {
    key: string;
    label: string;
    value: string;
    displayValue: string;
}

interface FilterPopoverProps {
    filters: FilterConfig[];
    values: Record<string, string | undefined>;
    dateRange?: { from?: Date; to?: Date };
    onFilterChange: (key: string, value: string | undefined) => void;
    onDateRangeChange?: (range: { from?: Date; to?: Date }) => void;
    onClearAll: () => void;
}

export function FilterPopover({
    filters,
    values,
    dateRange,
    onFilterChange,
    onDateRangeChange,
    onClearAll,
}: FilterPopoverProps) {
    const [open, setOpen] = useState(false);

    // Calculate active filters for badge count and chips
    const activeFilters = useMemo(() => {
        const active: ActiveFilter[] = [];
        
        filters.forEach((filter) => {
            if (filter.type === "select" && values[filter.key]) {
                const option = filter.options?.find(o => o.value === values[filter.key]);
                active.push({
                    key: filter.key,
                    label: filter.label,
                    value: values[filter.key]!,
                    displayValue: option?.label || values[filter.key]!,
                });
            }
        });

        // Add date range if present
        if (dateRange?.from) {
            const dateLabel = dateRange.to
                ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                : format(dateRange.from, "MMM d, yyyy");
            active.push({
                key: "dateRange",
                label: "Date",
                value: "dateRange",
                displayValue: dateLabel,
            });
        }

        return active;
    }, [filters, values, dateRange]);

    const activeCount = activeFilters.length;
    const hasDateFilter = filters.some(f => f.type === "date-range");

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-9 gap-2",
                                activeCount > 0 && "border-primary/50"
                            )}
                        >
                            <HugeiconsIcon icon={FilterIcon} className="w-4 h-4" />
                            <span>Filters</span>
                            {activeCount > 0 && (
                                <Badge 
                                    variant="secondary" 
                                    className="h-5 min-w-5 px-1.5 text-xs bg-primary text-primary-foreground"
                                >
                                    {activeCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">Filters</h4>
                                {activeCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            onClearAll();
                                            setOpen(false);
                                        }}
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </div>

                            <Separator />

                            {/* Select Filters */}
                            {filters
                                .filter(f => f.type === "select")
                                .map((filter) => (
                                    <div key={filter.key} className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">
                                            {filter.label}
                                        </Label>
                                        <Select
                                            value={values[filter.key] || "all"}
                                            onValueChange={(value) => 
                                                onFilterChange(filter.key, value === "all" ? undefined : value)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All {filter.label}</SelectItem>
                                                {filter.options?.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <span className="flex items-center gap-2">
                                                            {option.color && (
                                                                <span className={cn("h-2 w-2 rounded-full", option.color)} />
                                                            )}
                                                            {option.label}
                                                            {option.count !== undefined && (
                                                                <span className="text-muted-foreground">
                                                                    ({option.count})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}

                            {/* Date Range Filter */}
                            {hasDateFilter && onDateRangeChange && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        Date Range
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <HugeiconsIcon icon={Calendar03Icon} className="mr-2 h-4 w-4" />
                                                {dateRange?.from ? (
                                                    dateRange.to ? (
                                                        <>
                                                            {format(dateRange.from, "MMM d, yyyy")} -{" "}
                                                            {format(dateRange.to, "MMM d, yyyy")}
                                                        </>
                                                    ) : (
                                                        format(dateRange.from, "MMM d, yyyy")
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground">Pick a date range</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                selected={{ from: dateRange?.from, to: dateRange?.to }}
                                                onSelect={(range) => {
                                                    onDateRangeChange({ from: range?.from, to: range?.to });
                                                }}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {activeFilters.map((filter) => (
                        <Badge
                            key={filter.key}
                            variant="secondary"
                            className="gap-1.5 pr-1 font-normal"
                        >
                            <span className="text-muted-foreground">{filter.label}:</span>
                            <span>{filter.displayValue}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => {
                                    if (filter.key === "dateRange" && onDateRangeChange) {
                                        onDateRangeChange({});
                                    } else {
                                        onFilterChange(filter.key, undefined);
                                    }
                                }}
                            >
                                <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground"
                        onClick={onClearAll}
                    >
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}
