"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// Preset date ranges
const presets = [
    {
        label: "Today",
        getValue: () => ({
            from: new Date(),
            to: new Date(),
        }),
    },
    {
        label: "Last 7 days",
        getValue: () => ({
            from: subDays(new Date(), 7),
            to: new Date(),
        }),
    },
    {
        label: "Last 30 days",
        getValue: () => ({
            from: subDays(new Date(), 30),
            to: new Date(),
        }),
    },
    {
        label: "This month",
        getValue: () => ({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        }),
    },
    {
        label: "This week",
        getValue: () => ({
            from: startOfWeek(new Date(), { weekStartsOn: 1 }),
            to: endOfWeek(new Date(), { weekStartsOn: 1 }),
        }),
    },
];

export interface DateRangePickerProps {
    /** Selected date range */
    value?: DateRange;
    /** Callback when range changes */
    onChange?: (range: DateRange | undefined) => void;
    /** Additional className */
    className?: string;
    /** Placeholder text */
    placeholder?: string;
}

export function DateRangePicker({
    value,
    onChange,
    className,
    placeholder = "Select date range",
}: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(value);

    const handleSelect = (range: DateRange | undefined) => {
        setSelectedRange(range);
        onChange?.(range);
    };

    const handlePreset = (preset: typeof presets[0]) => {
        const range = preset.getValue();
        setSelectedRange(range);
        onChange?.(range);
        setOpen(false);
    };

    const displayValue = React.useMemo(() => {
        if (!selectedRange?.from) return placeholder;
        if (!selectedRange.to) return format(selectedRange.from, "MMM d, yyyy");
        return `${format(selectedRange.from, "MMM d")} - ${format(selectedRange.to, "MMM d, yyyy")}`;
    }, [selectedRange, placeholder]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-9 justify-start text-left font-normal",
                        !selectedRange && "text-muted-foreground",
                        className
                    )}
                >
                    <HugeiconsIcon icon={Calendar03Icon} className="mr-2 h-4 w-4" />
                    {displayValue}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                    {/* Presets */}
                    <div className="border-r p-2 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                            Quick select
                        </p>
                        {presets.map((preset) => (
                            <Button
                                key={preset.label}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-sm h-8"
                                onClick={() => handlePreset(preset)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                    {/* Calendar */}
                    <div className="p-2">
                        <Calendar
                            mode="range"
                            selected={selectedRange}
                            onSelect={handleSelect}
                            numberOfMonths={2}
                            defaultMonth={selectedRange?.from}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
