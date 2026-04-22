"use client";

import { Trash2, X, FolderOpen } from "lucide-react";
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
    <div className="h-10 border-b px-4 flex items-center gap-3 text-xs">
      <button onClick={selectedCount === totalCount ? clearSelection : selectAll} className="text-muted-foreground hover:text-foreground">
        {selectedCount === totalCount ? "Deselect All" : "Select All"}
      </button>
      <span className="font-medium tabular-nums">{selectedCount} <span className="text-muted-foreground font-normal">of {totalCount} selected</span></span>
      <div className="flex-1" />
      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onMove}>
        <FolderOpen className="size-3.5" /> Move
      </Button>
      <Button variant="outline" size="sm" className="h-7 text-xs text-destructive" onClick={onDelete}>
        <Trash2 className="size-3.5" /> Delete
      </Button>
      <button onClick={clearSelection} className="text-muted-foreground hover:text-foreground">
        <X className="size-3.5" />
      </button>
    </div>
  );
}
