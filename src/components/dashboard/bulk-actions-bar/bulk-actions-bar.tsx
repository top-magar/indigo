"use client";

import { type ReactNode } from "react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Callback to clear selection */
  onClear: () => void;
  /** Action buttons */
  children: ReactNode;
  /** Item label (singular) */
  itemLabel?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Floating bar for bulk actions when items are selected
 * Inspired by Saleor's bulk action patterns
 * 
 * @example
 * ```tsx
 * {selectedCount > 0 && (
 *   <BulkActionsBar
 *     selectedCount={selectedCount}
 *     onClear={clearSelection}
 *     itemLabel="order"
 *   >
 *     <Button size="sm" variant="outline" onClick={handleBulkExport}>
 *       Export
 *     </Button>
 *     <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
 *       Delete
 *     </Button>
 *   </BulkActionsBar>
 * )}
 * ```
 */
export function BulkActionsBar({
  selectedCount,
  onClear,
  children,
  itemLabel = "item",
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  const pluralLabel = selectedCount === 1 ? itemLabel : `${itemLabel}s`;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        "bg-muted/50 border",
        "animate-in fade-in-0 slide-in-from-top-2 duration-200",
        className
      )}
    >
      {/* Selection count */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedCount} {pluralLabel} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={onClear}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5 mr-1" />
          Clear
        </Button>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-border" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

/**
 * Sticky version that stays at the bottom of the viewport
 */
export function StickyBulkActionsBar({
  selectedCount,
  onClear,
  children,
  itemLabel = "item",
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  const pluralLabel = selectedCount === 1 ? itemLabel : `${itemLabel}s`;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-4 py-3 rounded-full",
        "bg-background/95 backdrop-blur border shadow-lg",
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-300",
        className
      )}
    >
      {/* Selection count */}
      <span className="text-sm font-medium whitespace-nowrap">
        {selectedCount} {pluralLabel}
      </span>

      {/* Separator */}
      <div className="h-4 w-px bg-border" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {children}
      </div>

      {/* Clear button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={onClear}
      >
        <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
      </Button>
    </div>
  );
}

BulkActionsBar.displayName = "BulkActionsBar";
StickyBulkActionsBar.displayName = "StickyBulkActionsBar";
