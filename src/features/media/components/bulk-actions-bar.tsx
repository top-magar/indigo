"use client";

import { Trash2, X, FolderOpen, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaStore } from "@/features/media/media-store";

interface BulkActionsBarProps {
  onDelete: () => void;
  onMove: () => void;
}

export function BulkActionsBar({ onDelete, onMove }: BulkActionsBarProps) {
  const selectedCount = useMediaStore(s => s.selectedIds.size);
  const totalCount = useMediaStore(s => s.assets.length);
  const selectAll = useMediaStore(s => s.selectAll);
  const clearSelection = useMediaStore(s => s.clearSelection);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-lg border bg-background px-2 py-1.5 text-xs">
      <span className="font-medium tabular-nums px-1.5">{selectedCount} <span className="text-muted-foreground font-normal">selected</span></span>
      <div className="h-4 w-px bg-border" />
      <Button variant="ghost" size="icon" className="size-7" onClick={selectedCount === totalCount ? clearSelection : selectAll} title={selectedCount === totalCount ? "Deselect all" : "Select all"}>
        <CheckSquare className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="size-7" onClick={onMove} title="Move">
        <FolderOpen className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={onDelete} title="Delete">
        <Trash2 className="size-3.5" />
      </Button>
      <div className="h-4 w-px bg-border" />
      <Button variant="ghost" size="icon" className="size-7" onClick={clearSelection} title="Clear selection">
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
