"use client";

import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FolderDialogProps {
  open: boolean;
  mode: "create" | "rename";
  folderName: string;
  parentFolderName?: string | null; // Name of parent folder, null means root
  onOpenChange: (open: boolean) => void;
  onFolderNameChange: (name: string) => void;
  onSubmit: () => void;
}

export const FolderDialog = memo(function FolderDialog({
  open,
  mode,
  folderName,
  parentFolderName,
  onOpenChange,
  onFolderNameChange,
  onSubmit,
}: FolderDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && folderName.trim()) {
      onSubmit();
    }
  };

  const isRoot = parentFolderName === null || parentFolderName === undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Folder" : "Rename Folder"}
          </DialogTitle>
          {mode === "create" && (
            <DialogDescription className="flex items-center gap-2 pt-1">
              <span className="text-muted-foreground">Location:</span>
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
                "bg-muted text-foreground"
              )}>
                <HugeiconsIcon 
                  icon={isRoot ? Image01Icon : Folder01Icon} 
                  className="h-3 w-3" 
                />
                {isRoot ? "All Files (Root)" : parentFolderName}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>
        <Input
          placeholder="Folder name"
          value={folderName}
          onChange={(e) => onFolderNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="mt-2"
        />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!folderName.trim()}>
            {mode === "create" ? "Create" : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
