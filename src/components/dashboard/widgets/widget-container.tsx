"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DragDropVerticalIcon,
  MoreHorizontalIcon,
  Delete02Icon,
  Settings02Icon,
  RefreshIcon,
  MaximizeIcon,
  MinimizeIcon,
  ArrowShrink02Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils";
import type { Widget } from "./widget-types";

export interface WidgetContainerProps {
  /** Widget data */
  widget: Widget;
  /** Children to render inside the widget */
  children: React.ReactNode;
  /** Whether the widget is being dragged */
  isDragging?: boolean;
  /** Whether the widget is in edit mode */
  isEditMode?: boolean;
  /** Drag handle attributes from dnd-kit */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  /** Callback when remove is clicked */
  onRemove?: (widgetId: string) => void;
  /** Callback when settings is clicked */
  onSettings?: (widgetId: string) => void;
  /** Callback when refresh is clicked */
  onRefresh?: (widgetId: string) => void;
  /** Callback when collapse/expand is clicked */
  onToggleCollapse?: (widgetId: string) => void;
  /** Callback when resize is requested */
  onResize?: (widgetId: string, size: "small" | "medium" | "large" | "full") => void;
  /** Whether this is rendered in mobile view */
  isMobileView?: boolean;
  /** Whether this is rendered in tablet view */
  isTabletView?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Widget loading skeleton
 */
function WidgetSkeleton({ height = "h-32" }: { height?: string }) {
  return (
    <div className={cn("space-y-3", height)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

/**
 * Widget error state
 */
function WidgetError({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-center p-4">
      <div className="rounded-full bg-destructive/10 p-3 mb-3">
        <HugeiconsIcon
          icon={Delete02Icon}
          className="h-5 w-5 text-destructive"
        />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{error}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="min-h-[44px]">
          <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * Touch-friendly resize handle for mobile/tablet
 */
function TouchResizeHandle({
  position,
  onResize,
  className,
}: {
  position: "bottom" | "right" | "corner";
  onResize?: () => void;
  className?: string;
}) {
  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.stopPropagation();
      onResize?.();
    },
    [onResize]
  );

  const positionStyles = {
    bottom: "bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 cursor-ns-resize",
    right: "right-0 top-1/2 -translate-y-1/2 w-3 h-12 cursor-ew-resize",
    corner: "bottom-0 right-0 w-6 h-6 cursor-nwse-resize",
  };

  return (
    <div
      className={cn(
        "absolute touch-none select-none",
        // Minimum 44px touch target
        "min-w-[44px] min-h-[44px]",
        "flex items-center justify-center",
        "opacity-0 group-hover:opacity-100 transition-opacity",
        positionStyles[position],
        className
      )}
      onTouchStart={handleTouchStart}
      onMouseDown={handleTouchStart}
      role="slider"
      aria-label={`Resize widget ${position}`}
      tabIndex={0}
    >
      <div
        className={cn(
          "bg-muted-foreground/30 rounded-full",
          position === "bottom" && "w-8 h-1",
          position === "right" && "w-1 h-8",
          position === "corner" && "w-3 h-3"
        )}
      />
    </div>
  );
}

/**
 * Swipe-to-dismiss wrapper for edit mode
 */
function SwipeToDismiss({
  children,
  onDismiss,
  enabled = false,
}: {
  children: React.ReactNode;
  onDismiss?: () => void;
  enabled?: boolean;
}) {
  const [translateX, setTranslateX] = React.useState(0);
  const [isDismissing, setIsDismissing] = React.useState(false);
  const startXRef = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const DISMISS_THRESHOLD = 100;

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    startXRef.current = e.touches[0].clientX;
  }, [enabled]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    // Only allow swiping right (positive direction)
    if (diff > 0) {
      setTranslateX(Math.min(diff, DISMISS_THRESHOLD * 1.5));
    }
  }, [enabled]);

  const handleTouchEnd = React.useCallback(() => {
    if (!enabled) return;
    if (translateX > DISMISS_THRESHOLD) {
      setIsDismissing(true);
      setTranslateX(300);
      setTimeout(() => {
        onDismiss?.();
      }, 200);
    } else {
      setTranslateX(0);
    }
  }, [enabled, translateX, onDismiss]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Delete indicator background */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 bg-destructive/20 flex items-center pl-4 transition-opacity",
          translateX > 20 ? "opacity-100" : "opacity-0"
        )}
        style={{ width: translateX }}
      >
        <HugeiconsIcon icon={Delete02Icon} className="h-5 w-5 text-destructive" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "transition-transform",
          isDismissing && "transition-all duration-200"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Widget container component
 * Wrapper for individual widgets with header, drag handle, settings menu, and states
 * Responsive: adapts to mobile/tablet/desktop views
 */
export function WidgetContainer({
  widget,
  children,
  isDragging = false,
  isEditMode = false,
  dragHandleProps,
  onRemove,
  onSettings,
  onRefresh,
  onToggleCollapse,
  onResize,
  isMobileView = false,
  isTabletView = false,
  className,
}: WidgetContainerProps) {
  const { id, title, config, isLoading, error, locked } = widget;
  const isCollapsed = config?.collapsed ?? false;
  const showHeader = config?.showHeader !== false;

  const handleRemove = React.useCallback(() => {
    onRemove?.(id);
  }, [id, onRemove]);

  const handleSettings = React.useCallback(() => {
    onSettings?.(id);
  }, [id, onSettings]);

  const handleRefresh = React.useCallback(() => {
    onRefresh?.(id);
  }, [id, onRefresh]);

  const handleToggleCollapse = React.useCallback(() => {
    onToggleCollapse?.(id);
  }, [id, onToggleCollapse]);

  // Mobile view - simplified card without drag handle
  if (isMobileView) {
    return (
      <SwipeToDismiss
        enabled={isEditMode && !locked}
        onDismiss={handleRemove}
      >
        <div
          className={cn(
            "relative transition-all duration-200",
            className
          )}
          data-widget-id={id}
        >
          {/* Content */}
          <div className={cn("pt-2")}>
            {isLoading ? (
              <WidgetSkeleton />
            ) : error ? (
              <WidgetError error={error} onRetry={onRefresh ? handleRefresh : undefined} />
            ) : (
              children
            )}
          </div>

          {/* Mobile action buttons - touch-friendly */}
          {isEditMode && (
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
              {onSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] min-w-[44px]"
                  onClick={handleSettings}
                  aria-label="Widget settings"
                >
                  <HugeiconsIcon icon={Settings02Icon} className="h-5 w-5" />
                </Button>
              )}
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] min-w-[44px]"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  aria-label="Refresh widget"
                >
                  <HugeiconsIcon
                    icon={RefreshIcon}
                    className={cn("h-5 w-5", isLoading && "animate-spin")}
                  />
                </Button>
              )}
              {onRemove && !locked && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                  onClick={handleRemove}
                  aria-label="Remove widget"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </SwipeToDismiss>
    );
  }

  return (
    <Card
      className={cn(
        "group relative h-full transition-all duration-200",
        isDragging && "opacity-50 ring-2 ring-primary shadow-lg scale-[1.02]",
        isEditMode && !isDragging && "ring-1 ring-dashed ring-muted-foreground/30",
        isCollapsed && "h-auto",
        className
      )}
      data-widget-id={id}
      data-widget-dragging={isDragging}
    >
      {/* Header */}
      {showHeader && (
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Drag Handle - only on desktop */}
            {isEditMode && !locked && dragHandleProps && (
              <button
                {...dragHandleProps}
                className={cn(
                  "cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  // Touch-friendly size
                  "min-w-[44px] min-h-[44px] flex items-center justify-center"
                )}
                aria-label="Drag to reorder widget"
              >
                <HugeiconsIcon
                  icon={DragDropVerticalIcon}
                  className="h-5 w-5 text-muted-foreground"
                />
              </button>
            )}
            <CardTitle className="text-sm font-medium truncate">
              {title}
            </CardTitle>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Collapse/Expand button */}
            {config?.collapsible && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-0",
                  // Touch-friendly on tablet
                  isTabletView ? "h-11 w-11" : "h-7 w-7"
                )}
                onClick={handleToggleCollapse}
                aria-label={isCollapsed ? "Expand widget" : "Collapse widget"}
              >
                <HugeiconsIcon
                  icon={isCollapsed ? MaximizeIcon : MinimizeIcon}
                  className={cn(isTabletView ? "h-5 w-5" : "h-4 w-4")}
                />
              </Button>
            )}

            {/* Refresh button */}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-0",
                  isTabletView ? "h-11 w-11" : "h-7 w-7"
                )}
                onClick={handleRefresh}
                disabled={isLoading}
                aria-label="Refresh widget"
              >
                <HugeiconsIcon
                  icon={RefreshIcon}
                  className={cn(
                    isTabletView ? "h-5 w-5" : "h-4 w-4",
                    isLoading && "animate-spin"
                  )}
                />
              </Button>
            )}

            {/* Settings dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-0",
                    isTabletView ? "h-11 w-11" : "h-7 w-7"
                  )}
                  aria-label="Widget options"
                >
                  <HugeiconsIcon
                    icon={MoreHorizontalIcon}
                    className={cn(isTabletView ? "h-5 w-5" : "h-4 w-4")}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onSettings && (
                  <DropdownMenuItem
                    onClick={handleSettings}
                    className={cn(isTabletView && "min-h-[44px]")}
                  >
                    <HugeiconsIcon icon={Settings02Icon} className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                )}
                {onRefresh && (
                  <DropdownMenuItem
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className={cn(isTabletView && "min-h-[44px]")}
                  >
                    <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4 mr-2" />
                    Refresh
                  </DropdownMenuItem>
                )}
                {onResize && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onResize(id, "small")}
                      className={cn(isTabletView && "min-h-[44px]")}
                    >
                      <HugeiconsIcon icon={ArrowShrink02Icon} className="h-4 w-4 mr-2" />
                      Small
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onResize(id, "medium")}
                      className={cn(isTabletView && "min-h-[44px]")}
                    >
                      <HugeiconsIcon icon={ArrowShrink02Icon} className="h-4 w-4 mr-2" />
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onResize(id, "large")}
                      className={cn(isTabletView && "min-h-[44px]")}
                    >
                      <HugeiconsIcon icon={MaximizeIcon} className="h-4 w-4 mr-2" />
                      Large
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onResize(id, "full")}
                      className={cn(isTabletView && "min-h-[44px]")}
                    >
                      <HugeiconsIcon icon={MaximizeIcon} className="h-4 w-4 mr-2" />
                      Full Width
                    </DropdownMenuItem>
                  </>
                )}
                {onRemove && !locked && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleRemove}
                      className={cn(
                        "text-destructive focus:text-destructive",
                        isTabletView && "min-h-[44px]"
                      )}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      )}

      {/* Content */}
      {!isCollapsed && (
        <CardContent className={cn(!showHeader && "pt-4")}>
          {isLoading ? (
            <WidgetSkeleton />
          ) : error ? (
            <WidgetError error={error} onRetry={onRefresh ? handleRefresh : undefined} />
          ) : (
            children
          )}
        </CardContent>
      )}

      {/* Touch-friendly resize handles for tablet */}
      {isEditMode && isTabletView && !locked && onResize && (
        <>
          <TouchResizeHandle
            position="corner"
            onResize={() => {
              // Cycle through sizes
              const sizes: Array<"small" | "medium" | "large" | "full"> = ["small", "medium", "large", "full"];
              const currentSize = typeof widget.size === "string" ? widget.size : "medium";
              const currentIndex = sizes.indexOf(currentSize);
              const nextSize = sizes[(currentIndex + 1) % sizes.length];
              onResize(id, nextSize);
            }}
          />
        </>
      )}

      {/* Edit mode overlay indicator */}
      {isEditMode && !isDragging && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={cn(
              "absolute top-2 right-2 bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-medium",
              isTabletView && "text-xs px-2 py-1"
            )}
          >
            {locked ? "Locked" : dragHandleProps ? "Drag to move" : "Tap to edit"}
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Empty widget placeholder for drop zones
 */
export function WidgetPlaceholder({
  className,
  isOver = false,
}: {
  className?: string;
  isOver?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg flex items-center justify-center transition-colors",
        // Touch-friendly minimum height
        "min-h-[120px]",
        isOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20 bg-muted/30",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        {isOver ? "Drop widget here" : "Empty slot"}
      </p>
    </div>
  );
}

export { WidgetSkeleton, WidgetError, TouchResizeHandle, SwipeToDismiss };
