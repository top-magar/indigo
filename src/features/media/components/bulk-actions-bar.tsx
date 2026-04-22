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
  const clearSelection = useMediaStore(s => s.clearSelection);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg border bg-background px-4 py-2 text-xs">
      <span className="font-medium tabular-nums">{selectedCount} <span className="text-muted-foreground font-normal">selected</span></span>
      <div className="h-4 w-px bg-border" />
      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onMove}>
        <FolderOpen className="size-3.5" /> Move
      </Button>
      <Button variant="outline" size="sm" className="h-7 text-xs text-destructive" onClick={onDelete}>
        <Trash2 className="size-3.5" /> Delete
      </Button>
      <button onClick={clearSelection} className="text-muted-foreground hover:text-foreground ml-1">
        <X className="size-3.5" />
      </button>
    </div>
  );
}
