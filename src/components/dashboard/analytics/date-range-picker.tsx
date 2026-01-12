"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/utils";
import type { DateRange as AnalyticsDateRange } from "@/app/dashboard/analytics/actions";

interface DateRangePickerProps {
    value: AnalyticsDateRange;
    onChange: (range: AnalyticsDateRange, customFrom?: string, customTo?: string) => void;
    disabled?: boolean;
    isFreeTier?: boolean;
}

const rangeOptions: { value: AnalyticsDateRange; label: string; description?: string }[] = [
    { value: "today", label: "Today", description: "Current day" },
    { value: "7d", label: "Last 7 days", description: "Past week" },
    { value: "30d", label: "Last 30 days", description: "Past month" },
    { value: "90d", label: "Last 90 days", description: "Past quarter" },
    { value: "year", label: "This year", description: "Year to date" },
    { value: "12m", label: "Last 12 months", description: "Rolling year" },
    { value: "custom", label: "Custom range", description: "Select dates" },
];

export function DateRangePicker({
    value,
    onChange,
    disabled = false,
    isFreeTier = false,
}: DateRangePickerProps) {
    const [customFrom, setCustomFrom] = useState<Date | undefined>();
    const [customTo, setCustomTo] = useState<Date | undefined>();
    const [isCustomOpen, setIsCustomOpen] = useState(false);

    const handleRangeChange = (newRange: string) => {
        if (newRange === "custom") {
            setIsCustomOpen(true);
        } else {
            onChange(newRange as AnalyticsDateRange);
        }
    };

    const handleCustomApply = () => {
        if (customFrom && customTo) {
            onChange(
                "custom",
                format(customFrom, "yyyy-MM-dd"),
                format(customTo, "yyyy-MM-dd")
            );
            setIsCustomOpen(false);
        }
    };

    const currentLabel = rangeOptions.find((opt) => opt.value === value)?.label || "Select range";

    // Free tier users can only see 7 days
    if (isFreeTier) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm">Last 7 days</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Select value={value} onValueChange={handleRangeChange} disabled={disabled}>
                <SelectTrigger className="w-[180px]">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select range">{currentLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {rangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center justify-between w-full">
                                <span>{option.label}</span>
                                {value === option.value && (
                                    <CheckCircle className="w-4 h-4 text-primary ml-2" />
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
                <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Select Date Range</h4>
                            <p className="text-xs text-muted-foreground">
                                Choose start and end dates for your custom range
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
        </div>
    );
}
