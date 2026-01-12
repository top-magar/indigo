"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WidgetContainer, WidgetPlaceholder } from "./widget-container";
import { WidgetRenderer } from "./widget-renderer";
import { useResponsiveBreakpoint, type Breakpoint } from "@/shared/hooks/use-responsive-breakpoint";
import type { Widget, WidgetSize } from "./widget-types";

/**
 * Responsive grid configuration
 */
const RESPONSIVE_GRID_CONFIG = {
  mobile: {
    columns: 1,
    gap: 12,
    rowHeight: 'auto' as const,
  },
  tablet: {
    columns: 2,
    gap: 16,
    rowHeight: 80,
    // Column split: 61.8% : 38.2%
    columnRatios: [1.618, 1],
  },
  desktop: {
    columns: 12,
    gap: 16,
    rowHeight: 80,
    // Spacing variants
    standardGap: 24, // gap-6
    standardRowHeight: 130, // ~80 * 1.618
  },
} as const;

/**
 * Golden ratio widget size presets for the 12-column grid
 */
export const GOLDEN_WIDGET_SIZES = {
  /** Small widget: 3 columns (25%) */
  small: { width: 3, height: 1 },
  /** Medium widget: 5 columns (~41.7%, approximates 1/φ) */
  medium: { width: 5, height: 1 },
  /** Large widget: 7 columns (~58.3%, approximates φ/(φ+1)) */
  large: { width: 7, height: 1 },
  /** Full-width widget: 12 columns */
  full: { width: 12, height: 1 },
  /** Featured widget: 7 columns, 2 rows */
  featured: { width: 7, height: 2 },
  /** Featured full-width: 12 columns, 2 rows */
  featuredFull: { width: 12, height: 2 },
} as const;

export interface WidgetGridProps {
  /** Array of widgets to display */
  widgets: Widget[];
  /** Whether the grid is in edit mode (allows drag-and-drop) */
  isEditMode?: boolean;
  /** Number of columns in the grid (overrides responsive) */
  columns?: number;
  /** Gap between widgets in pixels */
  gap?: number;
  /** Row height in pixels */
  rowHeight?: number;
  /** Use standard Geist spacing (24px gap, 130px row height) */
  useStandardSpacing?: boolean;
  /** Callback when widget order changes */
  onWidgetsChange?: (widgets: Widget[]) => void;
  /** Callback when a widget is removed */
  onWidgetRemove?: (widgetId: string) => void;
  /** Callback when widget settings is clicked */
  onWidgetSettings?: (widgetId: string) => void;
  /** Callback when widget refresh is clicked */
  onWidgetRefresh?: (widgetId: string) => void;
  /** Callback when widget is resized */
  onWidgetResize?: (widgetId: string, size: WidgetSize) => void;
  /** Callback when widget collapse state changes */
  onWidgetToggleCollapse?: (widgetId: string) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Mobile collapsible widget wrapper
 */
function MobileCollapsibleWidget({
  widget,
  isEditMode,
  onRemove,
  onSettings,
  onRefresh,
  onResize,
  onToggleCollapse,
  defaultOpen = true,
}: {
  widget: Widget;
  isEditMode: boolean;
  onRemove?: (widgetId: string) => void;
  onSettings?: (widgetId: string) => void;
  onRefresh?: (widgetId: string) => void;
  onResize?: (widgetId: string, size: WidgetSize) => void;
  onToggleCollapse?: (widgetId: string) => void;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const handleToggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
    onToggleCollapse?.(widget.id);
  }, [widget.id, onToggleCollapse]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="rounded-xl border bg-card">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 h-auto min-h-[56px] hover:bg-muted/50"
            onClick={handleToggle}
          >
            <span className="font-medium text-sm truncate">{widget.title}</span>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <WidgetContainer
              widget={widget}
              isDragging={false}
              isEditMode={isEditMode}
              onRemove={onRemove}
              onSettings={onSettings}
              onRefresh={onRefresh}
              onResize={onResize}
              isMobileView
            >
              <WidgetRenderer widget={widget} />
            </WidgetContainer>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/**
 * Sortable widget item wrapper
 */
function SortableWidget({
  widget,
  isEditMode,
  breakpoint,
  onRemove,
  onSettings,
  onRefresh,
  onResize,
  onToggleCollapse,
}: {
  widget: Widget;
  isEditMode: boolean;
  breakpoint: Breakpoint;
  onRemove?: (widgetId: string) => void;
  onSettings?: (widgetId: string) => void;
  onRefresh?: (widgetId: string) => void;
  onResize?: (widgetId: string, size: WidgetSize) => void;
  onToggleCollapse?: (widgetId: string) => void;
}) {
  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";
  const isDesktop = breakpoint === "desktop";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !isEditMode || widget.locked || !isDesktop, // Disable drag on touch devices
  });

  // Calculate responsive grid span
  const getGridSpan = () => {
    if (isMobile) {
      return { gridColumn: "span 1", gridRow: "auto" };
    }
    if (isTablet) {
      // On tablet, large/full widgets span 2 columns, others span 1
      const span = widget.position.width >= 6 ? 2 : 1;
      return { gridColumn: `span ${span}`, gridRow: `span ${widget.position.height}` };
    }
    // Desktop - use original position
    return {
      gridColumn: `span ${widget.position.width}`,
      gridRow: `span ${widget.position.height}`,
    };
  };

  const gridSpan = getGridSpan();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...gridSpan,
  };

  // Mobile view - use collapsible sections
  if (isMobile) {
    return (
      <div ref={setNodeRef} style={style} className="w-full">
        <MobileCollapsibleWidget
          widget={widget}
          isEditMode={isEditMode}
          onRemove={onRemove}
          onSettings={onSettings}
          onRefresh={onRefresh}
          onResize={onResize}
          onToggleCollapse={onToggleCollapse}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "z-50")}
      {...attributes}
    >
      <WidgetContainer
        widget={widget}
        isDragging={isDragging}
        isEditMode={isEditMode}
        dragHandleProps={isDesktop ? listeners : undefined}
        onRemove={onRemove}
        onSettings={onSettings}
        onRefresh={onRefresh}
        onResize={onResize}
        isMobileView={false}
        isTabletView={isTablet}
      >
        <WidgetRenderer widget={widget} />
      </WidgetContainer>
    </div>
  );
}

/**
 * Widget Grid component
 * CSS Grid-based layout with drag-and-drop using @dnd-kit
 * Responsive: mobile (1 col), tablet (2 cols), desktop (12 cols)
 */
export function WidgetGrid({
  widgets,
  isEditMode = false,
  columns,
  gap,
  rowHeight,
  useStandardSpacing = false,
  onWidgetsChange,
  onWidgetRemove,
  onWidgetSettings,
  onWidgetRefresh,
  onWidgetResize,
  onWidgetToggleCollapse,
  className,
}: WidgetGridProps) {
  const { breakpoint, isTouchDevice, isDesktop } = useResponsiveBreakpoint();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [, setOverId] = React.useState<string | null>(null);

  // Get responsive grid configuration
  const gridConfig = RESPONSIVE_GRID_CONFIG[breakpoint];
  const effectiveColumns = columns ?? gridConfig.columns;
  const effectiveGap = gap ?? gridConfig.gap;
  const effectiveRowHeight = rowHeight ?? gridConfig.rowHeight;

  // Apply standard Geist spacing if enabled
  const finalGap = useStandardSpacing && isDesktop ? RESPONSIVE_GRID_CONFIG.desktop.standardGap : effectiveGap;
  const finalRowHeight = useStandardSpacing && isDesktop ? RESPONSIVE_GRID_CONFIG.desktop.standardRowHeight : effectiveRowHeight;

  // Disable drag-and-drop on touch devices
  const enableDragAndDrop = isDesktop && !isTouchDevice;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeWidget = React.useMemo(
    () => widgets.find((w) => w.id === activeId),
    [widgets, activeId]
  );

  const visibleWidgets = React.useMemo(
    () => widgets.filter((w) => w.visible),
    [widgets]
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    if (!enableDragAndDrop) return;
    setActiveId(event.active.id as string);
  }, [enableDragAndDrop]);

  const handleDragOver = React.useCallback((event: DragOverEvent) => {
    if (!enableDragAndDrop) return;
    setOverId(event.over?.id as string | null);
  }, [enableDragAndDrop]);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      if (!enableDragAndDrop) return;
      
      const { active, over } = event;
      setActiveId(null);
      setOverId(null);

      if (!over || active.id === over.id) return;

      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newWidgets = [...widgets];
      const [movedWidget] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, movedWidget);

      const updatedWidgets = newWidgets.map((widget, index) => ({
        ...widget,
        position: {
          ...widget.position,
          y: Math.floor(index / Math.floor(effectiveColumns / widget.position.width)),
        },
      }));

      onWidgetsChange?.(updatedWidgets);
    },
    [widgets, effectiveColumns, onWidgetsChange, enableDragAndDrop]
  );

  const handleDragCancel = React.useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  // Build grid styles based on breakpoint
  const gridStyle: React.CSSProperties = React.useMemo(() => {
    const baseStyle: React.CSSProperties = {
      display: "grid",
      gap: `${finalGap}px`,
    };

    if (breakpoint === "mobile") {
      return {
        ...baseStyle,
        gridTemplateColumns: "1fr",
        // Auto rows for mobile - widgets stack vertically
      };
    }

    if (breakpoint === "tablet") {
      return {
        ...baseStyle,
        gridTemplateColumns: "repeat(2, 1fr)",
        gridAutoRows: `${finalRowHeight}px`,
      };
    }

    // Desktop
    return {
      ...baseStyle,
      gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
      gridAutoRows: `${finalRowHeight}px`,
    };
  }, [breakpoint, effectiveColumns, finalGap, finalRowHeight]);

  const gridContent = (
    <div
      className={cn(
        "w-full",
        isEditMode && "min-h-[400px]",
        breakpoint === "mobile" && "space-y-3",
        className
      )}
      style={breakpoint !== "mobile" ? gridStyle : undefined}
    >
      <SortableContext
        items={visibleWidgets.map((w) => w.id)}
        strategy={rectSortingStrategy}
        disabled={!enableDragAndDrop}
      >
        {breakpoint === "mobile" ? (
          // Mobile: Stack widgets vertically with collapsible sections
          <div className="flex flex-col gap-3">
            {visibleWidgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                isEditMode={isEditMode}
                breakpoint={breakpoint}
                onRemove={onWidgetRemove}
                onSettings={onWidgetSettings}
                onRefresh={onWidgetRefresh}
                onResize={onWidgetResize}
                onToggleCollapse={onWidgetToggleCollapse}
              />
            ))}
          </div>
        ) : (
          // Tablet/Desktop: Grid layout
          visibleWidgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              isEditMode={isEditMode}
              breakpoint={breakpoint}
              onRemove={onWidgetRemove}
              onSettings={onWidgetSettings}
              onRefresh={onWidgetRefresh}
              onResize={onWidgetResize}
              onToggleCollapse={onWidgetToggleCollapse}
            />
          ))
        )}
      </SortableContext>

      {isEditMode && visibleWidgets.length === 0 && (
        <div
          className="col-span-full"
          style={{ gridColumn: breakpoint !== "mobile" ? `span ${effectiveColumns}` : undefined }}
        >
          <WidgetPlaceholder className="h-[200px]" isOver={false} />
        </div>
      )}
    </div>
  );

  // Only wrap with DndContext on desktop
  if (!enableDragAndDrop) {
    return gridContent;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {gridContent}

      <DragOverlay>
        {activeWidget && (
          <div
            style={{
              width: `${(activeWidget.position.width / effectiveColumns) * 100}%`,
              minWidth: 200,
            }}
          >
            <WidgetContainer widget={activeWidget} isDragging isEditMode={isEditMode}>
              <WidgetRenderer widget={activeWidget} />
            </WidgetContainer>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}


/**
 * Responsive widget grid with automatic column adjustment
 */
export function ResponsiveWidgetGrid({
  widgets,
  isEditMode = false,
  gap,
  rowHeight,
  onWidgetsChange,
  onWidgetRemove,
  onWidgetSettings,
  onWidgetRefresh,
  onWidgetResize,
  onWidgetToggleCollapse,
  className,
}: Omit<WidgetGridProps, "columns">) {
  // The main WidgetGrid is now responsive by default
  return (
    <WidgetGrid
      widgets={widgets}
      isEditMode={isEditMode}
      gap={gap}
      rowHeight={rowHeight}
      onWidgetsChange={onWidgetsChange}
      onWidgetRemove={onWidgetRemove}
      onWidgetSettings={onWidgetSettings}
      onWidgetRefresh={onWidgetRefresh}
      onWidgetResize={onWidgetResize}
      onWidgetToggleCollapse={onWidgetToggleCollapse}
      className={className}
    />
  );
}

/**
 * Drop zone component for adding widgets from catalog
 */
export function WidgetDropZone({
  onDrop,
  isOver = false,
  className,
}: {
  onDrop?: () => void;
  isOver?: boolean;
  className?: string;
}) {
  return (
    <div
      onClick={onDrop}
      className={cn(
        "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all",
        // Touch-friendly: minimum 44px touch target
        "min-h-[88px]",
        isOver
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30",
        className
      )}
    >
      <div className="text-4xl mb-2">+</div>
      <p className="text-sm text-muted-foreground text-center">
        {isOver ? "Drop to add widget" : "Click or drag widget here"}
      </p>
    </div>
  );
}

export { SortableWidget };
