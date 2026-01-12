"use client";

import { memo } from "react";
import { FolderOpen, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onMove: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export const BulkActionsBar = memo(function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onMove,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="border-b bg-primary/5 px-3 sm:px-4 py-2.5 animate-in slide-in-from-top-2 duration-200">
      {/* Mobile: stacked layout, Desktop: horizontal layout */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Top row on mobile: selection info + clear button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="hover:underline"
          >
            {selectedCount === totalCount ? "Deselect All" : "Select All"}
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <span className="text-sm font-medium flex-1 sm:flex-none">
            {selectedCount} <span className="text-muted-foreground font-normal">of {totalCount}</span>
            <span className="text-muted-foreground font-normal hidden sm:inline"> selected</span>
          </span>

          {/* Clear button - visible on mobile in top row */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClearSelection}
                className="sm:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear selection</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1 hidden sm:block" />

        {/* Action buttons - full width on mobile */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onMove}
            className="flex-1 sm:flex-none"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Move
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

          {/* Clear button - desktop only */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClearSelection}
                className="hidden sm:flex"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="flex items-center gap-2">
                Clear selection
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">Esc</kbd>
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});
