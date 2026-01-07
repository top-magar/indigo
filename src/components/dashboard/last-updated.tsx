"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    RefreshIcon,
    Clock01Icon,
    Alert02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";

export interface LastUpdatedProps {
    /** The timestamp when data was last updated */
    timestamp: Date | string;
    /** Callback function to refresh data */
    onRefresh?: () => void | Promise<void>;
    /** Whether a refresh is currently in progress */
    isRefreshing?: boolean;
    /** Number of minutes after which data is considered stale (default: 5) */
    staleThreshold?: number;
    /** Show the refresh button */
    showRefreshButton?: boolean;
    /** Size variant */
    size?: "sm" | "default";
    /** Additional class names */
    className?: string;
}

/**
 * LastUpdated component displays when data was last refreshed
 * and provides a refresh button with stale data indication.
 * 
 * @example
 * ```tsx
 * <LastUpdated 
 *   timestamp={lastFetchTime} 
 *   onRefresh={handleRefresh}
 *   isRefreshing={isLoading}
 * />
 * ```
 */
export function LastUpdated({
    timestamp,
    onRefresh,
    isRefreshing = false,
    staleThreshold = 5,
    showRefreshButton = true,
    size = "default",
    className,
}: LastUpdatedProps) {
    const [relativeTime, setRelativeTime] = useState<string>("");
    const [isStale, setIsStale] = useState(false);

    const updateRelativeTime = useCallback(() => {
        const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
        const minutesAgo = differenceInMinutes(new Date(), date);
        
        setIsStale(minutesAgo >= staleThreshold);
        setRelativeTime(formatDistanceToNow(date, { addSuffix: true }));
    }, [timestamp, staleThreshold]);

    // Update relative time on mount and every 30 seconds
    useEffect(() => {
        updateRelativeTime();
        const interval = setInterval(updateRelativeTime, 30000);
        return () => clearInterval(interval);
    }, [updateRelativeTime]);

    const handleRefresh = async () => {
        if (onRefresh && !isRefreshing) {
            await onRefresh();
        }
    };

    const isSmall = size === "sm";

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "flex items-center gap-1.5",
                    isSmall ? "text-[10px]" : "text-xs",
                    className
                )}
            >
                {/* Stale indicator or clock icon */}
                {isStale ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-chart-4">
                                <HugeiconsIcon
                                    icon={Alert02Icon}
                                    className={cn(
                                        "shrink-0",
                                        isSmall ? "w-3 h-3" : "w-3.5 h-3.5"
                                    )}
                                />
                                <span className="text-muted-foreground">
                                    Updated {relativeTime}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Data may be stale. Click refresh to update.</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <HugeiconsIcon
                            icon={Clock01Icon}
                            className={cn(
                                "shrink-0",
                                isSmall ? "w-3 h-3" : "w-3.5 h-3.5"
                            )}
                        />
                        <span>Updated {relativeTime}</span>
                    </div>
                )}

                {/* Refresh button */}
                {showRefreshButton && onRefresh && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "shrink-0",
                                    isSmall ? "h-5 w-5" : "h-6 w-6",
                                    isStale && "text-chart-4 hover:text-chart-4"
                                )}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <HugeiconsIcon
                                    icon={RefreshIcon}
                                    className={cn(
                                        isSmall ? "w-3 h-3" : "w-3.5 h-3.5",
                                        isRefreshing && "animate-spin"
                                    )}
                                />
                                <span className="sr-only">Refresh data</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>{isRefreshing ? "Refreshing..." : "Refresh data"}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}

/**
 * Compact inline version for use in card headers or tight spaces
 */
export function LastUpdatedInline({
    timestamp,
    isStale,
    className,
}: {
    timestamp: Date | string;
    isStale?: boolean;
    className?: string;
}) {
    const [relativeTime, setRelativeTime] = useState<string>("");

    useEffect(() => {
        const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
        setRelativeTime(formatDistanceToNow(date, { addSuffix: true }));
        
        const interval = setInterval(() => {
            setRelativeTime(formatDistanceToNow(date, { addSuffix: true }));
        }, 30000);
        
        return () => clearInterval(interval);
    }, [timestamp]);

    return (
        <span
            className={cn(
                "text-[10px] text-muted-foreground",
                isStale && "text-chart-4",
                className
            )}
        >
            {relativeTime}
        </span>
    );
}
