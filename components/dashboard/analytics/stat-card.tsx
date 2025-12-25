"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowUp01Icon,
    ArrowDown01Icon,
    MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";

// Icon type from hugeicons
type HugeIcon = typeof ArrowUp01Icon;

// Trend color mapping using design system
const trendColors = {
    up: "default",
    down: "destructive",
} as const;

export interface StatCardProps {
    /** Title of the stat */
    title: string;
    /** Main value to display */
    value: string | number;
    /** Optional icon to display */
    icon?: HugeIcon;
    /** Trend indicator with percentage */
    trend?: {
        value: number;
        direction: "up" | "down";
    };
    /** Subtitle or description text */
    subtitle?: string;
    /** Format type for the value */
    format?: "number" | "currency" | "percent";
    /** Show more options button */
    showOptions?: boolean;
    /** Callback for options click */
    onOptionsClick?: () => void;
}

export function StatCard({
    title,
    value,
    icon,
    trend,
    subtitle,
    showOptions = false,
    onOptionsClick,
}: StatCardProps) {
    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {title}
                        </p>
                        <p className="text-2xl font-bold">{value}</p>
                        {(trend || subtitle) && (
                            <div className="flex items-center gap-1.5">
                                {trend && (
                                    <Badge
                                        variant={trendColors[trend.direction]}
                                        className="text-xs px-1.5 py-0 gap-0.5"
                                    >
                                        <HugeiconsIcon
                                            icon={trend.direction === "up" ? ArrowUp01Icon : ArrowDown01Icon}
                                            className="w-2.5 h-2.5"
                                        />
                                        {Math.abs(trend.value)}%
                                    </Badge>
                                )}
                                {subtitle && (
                                    <span className="text-xs text-muted-foreground">{subtitle}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {icon && (
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                <HugeiconsIcon icon={icon} className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                        {showOptions && (
                            <Button variant="ghost" size="sm" onClick={onOptionsClick}>
                                <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
