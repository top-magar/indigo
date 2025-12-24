"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon } from "@hugeicons/core-free-icons";

// Filter option types
export interface FilterOption {
    id: string;
    label: string;
    checked: boolean;
}

export interface FilterGroup {
    id: string;
    label: string;
    options: FilterOption[];
}

export interface FilterModalProps {
    /** Filter groups configuration */
    groups: FilterGroup[];
    /** Callback when filters are applied */
    onApply: (filters: Record<string, string[]>) => void;
    /** Callback when filters are reset */
    onReset?: () => void;
    /** Trigger button variant */
    triggerVariant?: "default" | "outline" | "ghost";
    /** Trigger button size */
    triggerSize?: "default" | "sm" | "lg" | "icon";
}

export function FilterModal({
    groups,
    onApply,
    onReset,
    triggerVariant = "outline",
    triggerSize = "default",
}: FilterModalProps) {
    const [open, setOpen] = React.useState(false);
    const [localGroups, setLocalGroups] = React.useState<FilterGroup[]>(groups);

    // Reset local state when dialog opens
    React.useEffect(() => {
        if (open) {
            setLocalGroups(groups);
        }
    }, [open, groups]);

    const handleCheckChange = (groupId: string, optionId: string, checked: boolean) => {
        setLocalGroups(prev =>
            prev.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        options: group.options.map(opt =>
                            opt.id === optionId ? { ...opt, checked } : opt
                        ),
                    }
                    : group
            )
        );
    };

    const handleApply = () => {
        const filters: Record<string, string[]> = {};
        localGroups.forEach(group => {
            const selected = group.options
                .filter(opt => opt.checked)
                .map(opt => opt.id);
            if (selected.length > 0) {
                filters[group.id] = selected;
            }
        });
        onApply(filters);
        setOpen(false);
    };

    const handleReset = () => {
        setLocalGroups(prev =>
            prev.map(group => ({
                ...group,
                options: group.options.map(opt => ({ ...opt, checked: false })),
            }))
        );
        onReset?.();
    };

    const activeFiltersCount = localGroups.reduce(
        (count, group) => count + group.options.filter(opt => opt.checked).length,
        0
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={triggerVariant} size={triggerSize} className="h-9">
                    <HugeiconsIcon icon={FilterIcon} className="w-4 h-4 mr-2" />
                    Filter
                    {activeFiltersCount > 0 && (
                        <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                    <DialogDescription>
                        Select filters to narrow down the results.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {localGroups.map((group, index) => (
                        <React.Fragment key={group.id}>
                            {index > 0 && <Separator />}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">{group.label}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {group.options.map(option => (
                                        <div key={option.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${group.id}-${option.id}`}
                                                checked={option.checked}
                                                onCheckedChange={(checked) =>
                                                    handleCheckChange(group.id, option.id, checked as boolean)
                                                }
                                            />
                                            <Label
                                                htmlFor={`${group.id}-${option.id}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
