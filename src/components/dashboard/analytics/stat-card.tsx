"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, MoreHorizontal, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils";

// Trend color mapping using design system
const trendColors = {
    up: "default",
    down: "destructive",
} as const;

// Icon color mapping
const iconColorClasses = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    "chart-3": "bg-ds-blue-100 text-ds-blue-700",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
} as const;

export interface StatCardProps {
    /** Title of the stat */
    title: string;
    /** Main value to display */
    value: string | number;
    /** Optional icon to display */
    icon?: LucideIcon;
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
                href && "hover:bg-muted cursor-pointer",
                className
            )}
            role="region"
            aria-label={`${title}: ${value}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <p className="stat-label">
                            {title}
                        </p>
                        {loading ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <p className="stat-value">{value}</p>
                        )}
                        {(trend || subtitle) && !loading && (
                            <div className="flex items-center gap-1.5">
                                {trend && (
                                    <Badge
                                        variant={trendColors[trend.direction]}
                                        className="text-xs px-1.5 py-0 gap-0.5"
                                    >
                                        {trend.direction === "up" ? (
                                            <ArrowUp className="w-2.5 h-2.5" />
                                        ) : (
                                            <ArrowDown className="w-2.5 h-2.5" />
                                        )}
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
                            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", iconColorClasses[iconColor])}>
                                {(() => {
                                    const Icon = icon;
                                    return <Icon className="w-5 h-5" />;
                                })()}
                            </div>
                        )}
                        {showOptions && (
                            <Button variant="ghost" size="sm" onClick={onOptionsClick}>
                                <MoreHorizontal className="w-4 h-4" />
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


/** 
 * Grid wrapper for multiple stat cards 
 * Supports standard and golden ratio layouts
 */
export type StatCardGridLayout = 'standard' | 'golden-2col' | 'golden-3col' | 'golden-featured';

export function StatCardGrid({ 
    children, 
    className,
    layout = 'standard'
}: { 
    children: React.ReactNode; 
    className?: string;
    layout?: StatCardGridLayout;
}) {
    const layoutClasses: Record<StatCardGridLayout, string> = {
        // Standard 4-column grid
        standard: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
        // Golden ratio 2-column: 61.8% : 38.2%
        'golden-2col': 'grid gap-[26px] lg:grid-cols-[1.618fr_1fr]',
        // Golden ratio 3-column layout
        'golden-3col': 'grid gap-[26px] lg:grid-cols-3',
        // Featured layout: large card + 2 smaller cards
        'golden-featured': 'grid gap-[26px] lg:grid-cols-[1.618fr_1fr_1fr]',
    };
    
    return (
        <div className={cn(layoutClasses[layout], className)}>
            {children}
        </div>
    );
}
