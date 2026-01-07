"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowUp01Icon,
    ArrowDown01Icon,
    MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/shared/utils";

// Icon type from hugeicons
type HugeIcon = typeof ArrowUp01Icon;

// Trend color mapping using design system
const trendColors = {
    up: "default",
    down: "destructive",
} as const;

// Icon color mapping
const iconColorClasses = {
    muted: "bg-muted/50 text-muted-foreground",
    "chart-1": "bg-chart-1/10 text-chart-1",
    "chart-2": "bg-chart-2/10 text-chart-2",
    "chart-3": "bg-chart-3/10 text-chart-3",
    "chart-4": "bg-chart-4/10 text-chart-4",
    "chart-5": "bg-chart-5/10 text-chart-5",
    primary: "bg-primary/10 text-primary",
} as const;

export interface StatCardProps {
    /** Title of the stat */
    title: string;
    /** Main value to display */
    value: string | number;
    /** Optional icon to display */
    icon?: HugeIcon;
    /** Icon color variant */
    iconColor?: keyof typeof iconColorClasses;
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
    /** Link destination - makes card clickable */
    href?: string;
    /** Loading state */
    loading?: boolean;
    /** Additional class names */
    className?: string;
}

export function StatCard({
    title,
    value,
    icon,
    iconColor = "muted",
    trend,
    subtitle,
    showOptions = false,
    onOptionsClick,
    href,
    loading = false,
    className,
}: StatCardProps) {
    const cardContent = (
        <Card 
            className={cn(
                "relative overflow-hidden transition-colors",
                href && "hover:bg-muted/50 cursor-pointer",
                className
            )}
            role="region"
            aria-label={`${title}: ${value}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <p className="text-label text-muted-foreground">
                            {title}
                        </p>
                        {loading ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <p className="text-2xl font-bold">{value}</p>
                        )}
                        {(trend || subtitle) && !loading && (
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
                                    <span className="text-caption text-muted-foreground">{subtitle}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {icon && (
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconColorClasses[iconColor])}>
                                <HugeiconsIcon icon={icon} className="w-5 h-5" />
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

    if (href) {
        return <Link href={href} className="block">{cardContent}</Link>;
    }

    return cardContent;
}


/** Grid wrapper for multiple stat cards */
export function StatCardGrid({ 
    children, 
    className 
}: { 
    children: React.ReactNode; 
    className?: string;
}) {
    return (
        <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
            {children}
        </div>
    );
}
