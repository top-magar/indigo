"use client";

import { memo } from "react";
import { Image, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/shared/utils";
import type { MediaFolder } from "@/features/media/types";

interface MoveDialogProps {
  open: boolean;
  selectedCount: number;
  folders: MediaFolder[];
  targetFolderId: string | null;
  onOpenChange: (open: boolean) => void;
  onTargetChange: (folderId: string | null) => void;
  onMove: () => void;
}

export const MoveDialog = memo(function MoveDialog({
  open,
  selectedCount,
  folders,
  targetFolderId,
  onOpenChange,
  onTargetChange,
  onMove,
}: MoveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move {selectedCount} file(s)</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-1 max-h-64 overflow-auto py-2">
          <button
            onClick={() => onTargetChange(null)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all",
              targetFolderId === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Image className="h-4 w-4" />
            Root (All Files)
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onTargetChange(folder.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all",
                targetFolderId === folder.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Folder className="h-4 w-4" />
              {folder.name}
            </button>
          ))}
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={onMove}>Move Here</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
