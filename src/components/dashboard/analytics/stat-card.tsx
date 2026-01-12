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
    muted: "bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)]",
    "chart-1": "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
    "chart-2": "bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
    "chart-3": "bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
    "chart-4": "bg-[var(--ds-purple-100)] text-[var(--ds-purple-700)]",
    "chart-5": "bg-[var(--ds-pink-100)] text-[var(--ds-pink-700)]",
    primary: "bg-primary/10 text-primary",
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
                href && "hover:bg-[var(--ds-gray-100)] cursor-pointer",
                className
            )}
            role="region"
            aria-label={`${title}: ${value}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <p className="text-label text-[var(--ds-gray-600)]">
                            {title}
                        </p>
                        {loading ? (
                            <div className="h-8 w-24 bg-[var(--ds-gray-100)] animate-pulse rounded" />
                        ) : (
                            <p className="text-2xl font-semibold">{value}</p>
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
                                    <span className="text-caption text-[var(--ds-gray-600)]">{subtitle}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {icon && (
                            <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", iconColorClasses[iconColor])}>
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
