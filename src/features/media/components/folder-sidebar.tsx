"use client";

import { memo, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderPlus,
  Image,
  Folder,
  FolderOpen,
  PenLine,
  Trash2,
  HardDrive,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/shared/utils";
import type { MediaFolder, StorageUsage } from "@/features/media/types";
import { formatFileSize } from "@/features/media/types";

// Extended folder type with optional asset count
interface FolderWithCount extends MediaFolder {
  assetCount?: number;
}

interface FolderSidebarProps {
  folders: FolderWithCount[];
  currentFolderId: string | null;
  storageUsage: StorageUsage;
  dragOverFolderId: string | null;
  totalAssetCount?: number;
  onFolderClick: (folderId: string | null) => void;
  onFolderDragOver: (e: React.DragEvent, folderId: string | null) => void;
  onFolderDrop: (e: React.DragEvent, folderId: string | null) => void;
  onCreateFolder: () => void;
  onRenameFolder: (folder: FolderWithCount) => void;
  onDeleteFolder: (folder: FolderWithCount) => void;
}

// Recursive folder item component with drag animations
function FolderItem({
  folder,
  folders,
  currentFolderId,
  dragOverFolderId,
  depth = 0,
  onFolderClick,
  onFolderDragOver,
  onFolderDrop,
  onRenameFolder,
  onDeleteFolder,
}: {
  folder: FolderWithCount;
  folders: FolderWithCount[];
  currentFolderId: string | null;
  dragOverFolderId: string | null;
  depth?: number;
  onFolderClick: (folderId: string | null) => void;
  onFolderDragOver: (e: React.DragEvent, folderId: string | null) => void;
  onFolderDrop: (e: React.DragEvent, folderId: string | null) => void;
  onRenameFolder: (folder: FolderWithCount) => void;
  onDeleteFolder: (folder: FolderWithCount) => void;
}) {
  const childFolders = folders.filter((f) => f.parentFolderId === folder.id);
  const hasChildren = childFolders.length > 0;
  const [isOpen, setIsOpen] = useState(true);
  const isActive = currentFolderId === folder.id;
  const isDragOver = dragOverFolderId === folder.id && !isActive;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex items-center">
            {hasChildren && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "h-6 w-6 flex items-center justify-center rounded hover:bg-muted shrink-0",
                      depth > 0 && "ml-1"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(!isOpen);
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <ChevronRight className="h-3 w-3 text-[var(--ds-gray-600)]" />
                    </motion.div>
                  </button>
                </CollapsibleTrigger>
              </Collapsible>
            )}
            <motion.button
              onClick={() => onFolderClick(folder.id)}
              onDragOver={(e) => onFolderDragOver(e, folder.id)}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => onFolderDrop(e, folder.id)}
              animate={{
                scale: isDragOver ? 1.02 : 1,
                y: isDragOver ? -2 : 0,
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "flex-1 text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 transition-colors outline-none group",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                !hasChildren && depth > 0 && "ml-7",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-900)]",
                isDragOver && "bg-primary/15 ring-2 ring-primary/40 shadow-md"
              )}
              style={{ paddingLeft: hasChildren ? undefined : `${depth * 12 + 12}px` }}
            >
              {/* Animated folder icon */}
              <motion.div
                animate={{
                  scale: isDragOver ? 1.2 : 1,
                  rotate: isDragOver ? -5 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {isDragOver ? (
                  <FolderOpen
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      "text-primary"
                    )}
                  />
                ) : (
                  <Folder
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive 
                        ? "text-primary" 
                        : "text-[var(--ds-gray-500)] group-hover:text-[var(--ds-gray-900)]"
                    )}
                  />
                )}
              </motion.div>
              <span className="truncate flex-1">{folder.name}</span>
              
              {/* Drop indicator badge */}
              <AnimatePresence>
                {isDragOver && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary text-primary-foreground"
                  >
                    Drop
                  </motion.span>
                )}
              </AnimatePresence>
              
              {folder.assetCount !== undefined && folder.assetCount > 0 && !isDragOver && (
                <span className={cn(
                  "text-xs tabular-nums px-2 py-0.5 rounded-sm",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)] group-hover:bg-[var(--ds-gray-200)]"
                )}>
                  {folder.assetCount}
                </span>
              )}
            </motion.button>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onRenameFolder(folder)}>
            <PenLine className="h-4 w-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => onDeleteFolder(folder)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Child folders with animation */}
      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="ml-3 border-l border-border/50 pl-1 mt-0.5 space-y-0.5 overflow-hidden"
          >
            {childFolders.map((child) => (
              <FolderItem
                key={child.id}
                folder={child}
                folders={folders}
                currentFolderId={currentFolderId}
                dragOverFolderId={dragOverFolderId}
                depth={depth + 1}
                onFolderClick={onFolderClick}
                onFolderDragOver={onFolderDragOver}
                onFolderDrop={onFolderDrop}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const FolderSidebar = memo(function FolderSidebar({
  folders,
  currentFolderId,
  storageUsage,
  dragOverFolderId,
  totalAssetCount = 0,
  onFolderClick,
  onFolderDragOver,
  onFolderDrop,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderSidebarProps) {
  const rootFolders = useMemo(() => folders.filter((f) => !f.parentFolderId), [folders]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  // Close mobile sidebar when folder is selected
  const handleFolderClick = (folderId: string | null) => {
    onFolderClick(folderId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-40 lg:hidden h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open folders"
      >
        <Folder className="h-5 w-5" />
      </Button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "w-60 border-r bg-sidebar flex flex-col shrink-0",
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-14 px-4 border-b flex items-center justify-between bg-sidebar">
          <span className="text-sm font-semibold tracking-tight">Folders</span>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onCreateFolder}
                  aria-label="Create folder"
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create folder</TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close folders"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-1">
          {/* All Files with drag animation */}
          <motion.button
            onClick={() => handleFolderClick(null)}
            onDragOver={(e) => onFolderDragOver(e, null)}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => onFolderDrop(e, null)}
            animate={{
              scale: dragOverFolderId === null && currentFolderId !== null ? 1.02 : 1,
              y: dragOverFolderId === null && currentFolderId !== null ? -2 : 0,
            }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition-colors outline-none group",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              currentFolderId === null
                ? "bg-primary/10 text-primary font-medium"
                : "text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-900)]",
              dragOverFolderId === null && currentFolderId !== null && "bg-primary/15 ring-2 ring-primary/40 shadow-md"
            )}
          >
            <motion.div
              animate={{
                scale: dragOverFolderId === null && currentFolderId !== null ? 1.2 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Image className="h-4 w-4 shrink-0" />
            </motion.div>
            <span className="flex-1">All Files</span>
            
            {/* Drop indicator for All Files */}
            <AnimatePresence>
              {dragOverFolderId === null && currentFolderId !== null && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary text-primary-foreground"
                >
                  Drop
                </motion.span>
              )}
            </AnimatePresence>
            
            {totalAssetCount > 0 && !(dragOverFolderId === null && currentFolderId !== null) && (
              <span className={cn(
                "text-xs tabular-nums px-2 py-0.5 rounded-sm",
                currentFolderId === null
                  ? "bg-primary/20 text-primary"
                  : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)] group-hover:bg-[var(--ds-gray-200)]"
              )}>
                {totalAssetCount}
              </span>
            )}
          </motion.button>

          {/* Folders section */}
          {folders.length > 0 && (
            <div className="px-3 pt-4 pb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-gray-500)]">
                Folders
              </span>
            </div>
          )}

          {/* Folder tree */}
          <div className="space-y-0.5">
            {rootFolders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                folders={folders}
                currentFolderId={currentFolderId}
                dragOverFolderId={dragOverFolderId}
                onFolderClick={handleFolderClick}
                onFolderDragOver={onFolderDragOver}
                onFolderDrop={onFolderDrop}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
              />
            ))}
          </div>

          {/* Empty state */}
          {folders.length === 0 && (
            <div className="px-3 py-8 text-center">
              <Folder className="h-8 w-8 mx-auto text-[var(--ds-gray-300)]" />
              <p className="text-xs text-[var(--ds-gray-600)] mt-3">No folders created yet</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 h-8 text-xs font-medium"
                onClick={onCreateFolder}
              >
                Create new folder
              </Button>
            </div>
          )}
        </div>

        {/* Storage Usage */}
        <div className="p-3 border-t bg-[var(--ds-gray-100)]">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-4 w-4 text-[var(--ds-gray-600)]" />
            <span className="text-xs font-medium">Storage</span>
          </div>
          <Progress
            value={storageUsage.percentUsed}
            className={cn(
              "h-1.5",
              storageUsage.percentUsed >= 90 && "[&>div]:bg-[var(--ds-red-700)]",
              storageUsage.percentUsed >= 80 && storageUsage.percentUsed < 90 && "[&>div]:bg-[var(--ds-amber-600)]"
            )}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--ds-gray-600)]">
            <span>{formatFileSize(storageUsage.usedBytes)} used</span>
            <span>{formatFileSize(storageUsage.quotaBytes - storageUsage.usedBytes)} free</span>
          </div>
          {storageUsage.percentUsed >= 80 && (
            <p className={cn(
              "text-xs mt-2 font-medium",
              storageUsage.percentUsed >= 90 ? "text-[var(--ds-red-700)]" : "text-[var(--ds-amber-700)]"
            )}>
              {storageUsage.percentUsed >= 90 ? "Storage almost full!" : "Storage running low"}
            </p>
          )}
        </div>
      </div>
    </>
  );
});
