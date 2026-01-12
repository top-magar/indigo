"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  UploadCloud,
  FolderPlus,
  HardDrive,
  ChevronRight,
  Folder,
  FolderOpen,
  MoreHorizontal,
  PenLine,
  Trash2,
  X,
} from "lucide-react";
import { useAnnouncer } from "@/components/ui/sr-announcer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";
import type {
  MediaAsset,
  MediaFolder,
  StorageUsage,
  FileTypeFilter,
  AssetSortOption,
  ViewMode,
  UploadingFile,
  MediaFiltersState,
} from "@/features/media/types";
import { validateFile, formatFileSize } from "@/features/media/types";
import { defaultMediaFilters } from "./media-filters";
import {
  deleteAsset,
  createFolder,
  renameFolder,
  deleteFolder,
  bulkDeleteAssets,
  bulkMoveAssets,
  getAssets,
} from "@/app/dashboard/media/actions";
import { MediaHeader } from "./media-header";
import { MediaGrid } from "./media-grid";
import { BulkActionsBar } from "./bulk-actions-bar";
import { UploadPanel } from "./upload-panel";
import { AssetViewer } from "./asset-viewer";
import { FolderDialog } from "./folder-dialog";
import { MoveDialog } from "./move-dialog";

interface MediaLibraryProps {
  initialAssets: MediaAsset[];
  initialHasMore: boolean;
  initialNextCursor?: string;
  totalAssets: number;
  folders: MediaFolder[];
  storageUsage: StorageUsage;
  currentFolderId: string | null;
  initialSearch: string;
  initialFileType: FileTypeFilter;
  initialSort: AssetSortOption;
}

export function MediaLibrary({
  initialAssets,
  initialHasMore,
  initialNextCursor,
  totalAssets,
  folders: initialFolders,
  storageUsage,
  currentFolderId,
  initialSearch,
  initialFileType,
  initialSort,
}: MediaLibraryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const lastSelectedIndex = useRef<number>(-1);
  const { announce } = useAnnouncer();

  // Deduplicate initial assets
  const deduplicatedInitialAssets = useMemo(() => {
    const seen = new Set<string>();
    return initialAssets.filter((asset) => {
      if (seen.has(asset.id)) return false;
      seen.add(asset.id);
      return true;
    });
  }, [initialAssets]);

  // Core state
  const [assets, setAssets] = useState(deduplicatedInitialAssets);
  const [folders, setFolders] = useState(initialFolders);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState<MediaFiltersState>({
    ...defaultMediaFilters,
    fileType: initialFileType,
    sort: initialSort,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // UI state
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<MediaFolder | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [folderName, setFolderName] = useState("");

  const uploadAbortControllers = useRef<Map<string, AbortController>>(new Map());

  // Sync state when server data changes
  useEffect(() => {
    setAssets(deduplicatedInitialAssets);
    setHasMore(initialHasMore);
    setNextCursor(initialNextCursor);
  }, [deduplicatedInitialAssets, initialHasMore, initialNextCursor]);

  // URL param helpers
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ search: search || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, updateParams]);

  // Filter handlers
  const handleFiltersChange = useCallback(
    (updates: Partial<MediaFiltersState>) => {
      setFilters((prev) => {
        const next = { ...prev, ...updates };
        const urlUpdates: Record<string, string | null> = {};
        if (updates.fileType !== undefined) {
          urlUpdates.type = next.fileType === "all" ? null : next.fileType;
        }
        if (updates.sort !== undefined) {
          urlUpdates.sort = next.sort === "newest" ? null : next.sort;
        }
        if (updates.dateRange !== undefined) {
          urlUpdates.dateRange = next.dateRange === "all" ? null : next.dateRange;
        }
        if (updates.sizeRange !== undefined) {
          urlUpdates.sizeRange = next.sizeRange === "all" ? null : next.sizeRange;
        }
        if (Object.keys(urlUpdates).length > 0) {
          updateParams(urlUpdates);
        }
        return next;
      });
    },
    [updateParams]
  );

  const handleClearFilters = useCallback(() => {
    setFilters(defaultMediaFilters);
    updateParams({ type: null, sort: null, dateRange: null, sizeRange: null });
  }, [updateParams]);

  const handleFolderClick = useCallback(
    (folderId: string | null) => {
      updateParams({ folder: folderId });
    },
    [updateParams]
  );

  // Current folder info
  const currentFolder = useMemo(
    () => folders.find((f) => f.id === currentFolderId) || null,
    [folders, currentFolderId]
  );

  // Root folders for sidebar
  const rootFolders = useMemo(
    () => folders.filter((f) => !f.parentFolderId),
    [folders]
  );

  // Storage percentage
  const storagePercent = useMemo(
    () => Math.round((storageUsage.usedBytes / storageUsage.quotaBytes) * 100),
    [storageUsage]
  );


  // Upload handling
  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const newUploads: UploadingFile[] = fileArray.map((file) => {
        const validation = validateFile(file);
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        return validation.valid
          ? { id, file, progress: 0, status: "pending" as const }
          : { id, file, progress: 0, status: "error" as const, error: validation.error };
      });

      setUploadingFiles((prev) => [...newUploads, ...prev]);

      const validUploads = newUploads.filter((u) => u.status === "pending");

      for (const upload of validUploads) {
        const controller = new AbortController();
        uploadAbortControllers.current.set(upload.id, controller);

        setUploadingFiles((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, status: "uploading" as const, progress: 5 } : u))
        );

        try {
          const formData = new FormData();
          formData.append("file", upload.file);
          if (currentFolderId) formData.append("folderId", currentFolderId);

          let serverProcessingStarted = false;
          let serverProgressInterval: NodeJS.Timeout | null = null;

          const result = await new Promise<{ success: boolean; asset?: MediaAsset; error?: string }>(
            (resolve, reject) => {
              const xhr = new XMLHttpRequest();

              xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                  const clientProgress = Math.round((e.loaded / e.total) * 70);
                  setUploadingFiles((prev) =>
                    prev.map((u) =>
                      u.id === upload.id && u.status === "uploading" ? { ...u, progress: Math.max(5, clientProgress) } : u
                    )
                  );
                }
              });

              xhr.upload.addEventListener("loadend", () => {
                if (!serverProcessingStarted) {
                  serverProcessingStarted = true;
                  let serverProgress = 70;
                  serverProgressInterval = setInterval(() => {
                    serverProgress = Math.min(95, serverProgress + 2);
                    setUploadingFiles((prev) =>
                      prev.map((u) =>
                        u.id === upload.id && u.status === "uploading" ? { ...u, progress: serverProgress } : u
                      )
                    );
                    if (serverProgress >= 95 && serverProgressInterval) {
                      clearInterval(serverProgressInterval);
                    }
                  }, 100);
                }
              });

              xhr.addEventListener("load", () => {
                if (serverProgressInterval) clearInterval(serverProgressInterval);
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch {
                  reject(new Error("Invalid response"));
                }
              });
              xhr.addEventListener("error", () => {
                if (serverProgressInterval) clearInterval(serverProgressInterval);
                reject(new Error("Upload failed"));
              });
              xhr.addEventListener("abort", () => {
                if (serverProgressInterval) clearInterval(serverProgressInterval);
                reject(new Error("Upload cancelled"));
              });
              controller.signal.addEventListener("abort", () => {
                if (serverProgressInterval) clearInterval(serverProgressInterval);
                xhr.abort();
              });
              xhr.open("POST", "/api/media/upload");
              xhr.send(formData);
            }
          );

          if (result.success && result.asset) {
            setUploadingFiles((prev) =>
              prev.map((u) =>
                u.id === upload.id
                  ? { ...u, status: "complete" as const, progress: 100, asset: result.asset }
                  : u
              )
            );
            setAssets((prev) => {
              if (prev.some((a) => a.id === result.asset!.id)) return prev;
              return [result.asset!, ...prev];
            });
            announce(`${upload.file.name} uploaded successfully`);

            const isHiddenByFilter =
              (filters.fileType === "images" && !upload.file.type.startsWith("image/")) ||
              (filters.fileType === "videos" && !upload.file.type.startsWith("video/")) ||
              (filters.fileType === "documents" && upload.file.type !== "application/pdf");

            if (isHiddenByFilter) {
              handleFiltersChange({ fileType: "all" });
              announce("Switched to 'All files' to show uploaded item");
            } else {
              router.refresh();
            }
          } else {
            throw new Error(result.error || "Upload failed");
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed";
          if (message !== "Upload cancelled") {
            setUploadingFiles((prev) =>
              prev.map((u) =>
                u.id === upload.id ? { ...u, status: "error" as const, error: message } : u
              )
            );
            toast.error(`Failed to upload ${upload.file.name}`);
          }
        } finally {
          uploadAbortControllers.current.delete(upload.id);
        }
      }
    },
    [currentFolderId, filters.fileType, handleFiltersChange, router, announce]
  );

  const handleCancelUpload = useCallback((uploadId: string) => {
    const controller = uploadAbortControllers.current.get(uploadId);
    if (controller) {
      controller.abort();
      uploadAbortControllers.current.delete(uploadId);
    }
    setUploadingFiles((prev) => prev.filter((u) => u.id !== uploadId));
  }, []);

  const handleClearUploads = useCallback(() => {
    uploadAbortControllers.current.forEach((controller) => controller.abort());
    uploadAbortControllers.current.clear();
    setUploadingFiles([]);
  }, []);

  const isUploading = uploadingFiles.some((u) => u.status === "uploading" || u.status === "pending");

  // Selection handlers
  const handleSelect = useCallback(
    (assetId: string, index: number, e?: React.MouseEvent) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (e?.shiftKey && lastSelectedIndex.current >= 0) {
          const start = Math.min(lastSelectedIndex.current, index);
          const end = Math.max(lastSelectedIndex.current, index);
          for (let i = start; i <= end; i++) {
            if (assets[i]) next.add(assets[i].id);
          }
        } else if (e?.metaKey || e?.ctrlKey) {
          if (next.has(assetId)) {
            next.delete(assetId);
          } else {
            next.add(assetId);
          }
        } else {
          if (next.has(assetId) && next.size === 1) {
            next.clear();
          } else {
            next.clear();
            next.add(assetId);
          }
        }
        lastSelectedIndex.current = index;
        return next;
      });
    },
    [assets]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === assets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(assets.map((a) => a.id)));
    }
  }, [assets, selectedIds.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastSelectedIndex.current = -1;
  }, []);


  // Asset actions
  const handleAssetClick = useCallback((asset: MediaAsset) => {
    setSelectedAsset(asset);
    setViewerOpen(true);
  }, []);

  const handleDeleteAsset = useCallback(
    async (assetId: string) => {
      try {
        await deleteAsset(assetId);
        setAssets((prev) => prev.filter((a) => a.id !== assetId));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(assetId);
          return next;
        });
        toast.success("Asset deleted");
        announce("Asset deleted");
      } catch {
        toast.error("Failed to delete asset");
      }
    },
    [announce]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkDeleteAssets(Array.from(selectedIds));
      setAssets((prev) => prev.filter((a) => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} assets deleted`);
      announce(`${selectedIds.size} assets deleted`);
    } catch {
      toast.error("Failed to delete assets");
    }
  }, [selectedIds, announce]);

  const handleBulkMove = useCallback(
    async (targetFolderId: string | null) => {
      if (selectedIds.size === 0) return;
      try {
        await bulkMoveAssets(Array.from(selectedIds), targetFolderId);
        if (targetFolderId !== currentFolderId) {
          setAssets((prev) => prev.filter((a) => !selectedIds.has(a.id)));
        }
        setSelectedIds(new Set());
        setMoveDialogOpen(false);
        toast.success(`${selectedIds.size} assets moved`);
        announce(`${selectedIds.size} assets moved`);
      } catch {
        toast.error("Failed to move assets");
      }
    },
    [selectedIds, currentFolderId, announce]
  );

  // Folder actions
  const handleCreateFolder = useCallback(
    async (name: string) => {
      try {
        const result = await createFolder(name, currentFolderId);
        if (result.success && result.folder) {
          setFolders((prev) => [...prev, result.folder!]);
          setFolderDialogOpen(false);
          setFolderName("");
          toast.success("Folder created");
          announce("Folder created");
        } else {
          throw new Error(result.error || "Failed to create folder");
        }
      } catch {
        toast.error("Failed to create folder");
      }
    },
    [currentFolderId, announce]
  );

  const handleRenameFolder = useCallback(
    async (name: string) => {
      if (!folderToEdit) return;
      try {
        await renameFolder(folderToEdit.id, name);
        setFolders((prev) =>
          prev.map((f) => (f.id === folderToEdit.id ? { ...f, name } : f))
        );
        setFolderToEdit(null);
        setFolderDialogOpen(false);
        setFolderName("");
        toast.success("Folder renamed");
        announce("Folder renamed");
      } catch {
        toast.error("Failed to rename folder");
      }
    },
    [folderToEdit, announce]
  );

  const handleDeleteFolder = useCallback(
    async (folder: MediaFolder) => {
      try {
        await deleteFolder(folder.id);
        setFolders((prev) => prev.filter((f) => f.id !== folder.id));
        if (currentFolderId === folder.id) {
          handleFolderClick(null);
        }
        toast.success("Folder deleted");
        announce("Folder deleted");
      } catch {
        toast.error("Failed to delete folder");
      }
    },
    [currentFolderId, handleFolderClick, announce]
  );

  // Load more
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;
    setIsLoadingMore(true);
    try {
      const result = await getAssets({
        folderId: currentFolderId,
        search: search || undefined,
        fileType: filters.fileType,
        sort: filters.sort,
        cursor: nextCursor,
        limit: 50,
      });
      setAssets((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newAssets = result.assets.filter((a) => !existingIds.has(a.id));
        return [...prev, ...newAssets];
      });
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch {
      toast.error("Failed to load more assets");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, nextCursor, currentFolderId, search, filters]);

  // Drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  const handleAssetDragStart = useCallback(
    (e: React.DragEvent, assetId: string) => {
      const ids = selectedIds.has(assetId) ? Array.from(selectedIds) : [assetId];
      e.dataTransfer.setData("application/x-asset-ids", JSON.stringify(ids));
      e.dataTransfer.effectAllowed = "move";
    },
    [selectedIds]
  );

  const handleFolderDragOver = useCallback((e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("application/x-asset-ids")) {
      setDragOverFolderId(folderId);
    }
  }, []);

  const handleFolderDrop = useCallback(
    async (e: React.DragEvent, folderId: string | null) => {
      e.preventDefault();
      setDragOverFolderId(null);
      const data = e.dataTransfer.getData("application/x-asset-ids");
      if (!data) return;
      try {
        const ids = JSON.parse(data) as string[];
        await bulkMoveAssets(ids, folderId);
        if (folderId !== currentFolderId) {
          setAssets((prev) => prev.filter((a) => !ids.includes(a.id)));
        }
        setSelectedIds(new Set());
        toast.success(`${ids.length} asset(s) moved`);
      } catch {
        toast.error("Failed to move assets");
      }
    },
    [currentFolderId]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSelectAll();
      } else if (e.key === "Escape") {
        if (viewerOpen) {
          setViewerOpen(false);
        } else if (selectedIds.size > 0) {
          handleClearSelection();
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.size > 0 && !viewerOpen) {
          handleBulkDelete();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSelectAll, handleClearSelection, handleBulkDelete, viewerOpen, selectedIds.size]);


  // File input ref for upload button
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleUpload(e.target.files);
        e.target.value = "";
      }
    },
    [handleUpload]
  );

  return (
    <div
      className="flex h-[calc(100vh-4rem)] overflow-hidden -m-6 md:-m-8"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Compact Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] transition-all duration-200",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-56"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-12 px-3 flex items-center justify-between border-b border-[var(--ds-gray-200)]">
          <span className="text-xs font-medium text-[var(--ds-gray-900)]">Folders</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFolderToEdit(null);
                  setFolderDialogOpen(true);
                }}
                className="h-6 w-6 p-0"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New folder</TooltipContent>
          </Tooltip>
        </div>

        {/* Folder List */}
        <div className="flex-1 overflow-y-auto py-1">
          {/* All Files */}
          <button
            onClick={() => handleFolderClick(null)}
            onDragOver={(e) => handleFolderDragOver(e, null)}
            onDrop={(e) => handleFolderDrop(e, null)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors",
              currentFolderId === null
                ? "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] font-medium"
                : "text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-100)]",
              dragOverFolderId === null && currentFolderId !== null && "ring-2 ring-inset ring-[var(--ds-blue-500)]"
            )}
          >
            <HardDrive className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">All Files</span>
            <span className="ml-auto text-[10px] text-[var(--ds-gray-500)]">{totalAssets}</span>
          </button>

          {/* Folders */}
          {rootFolders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              isActive={currentFolderId === folder.id}
              isDragOver={dragOverFolderId === folder.id}
              onClick={() => handleFolderClick(folder.id)}
              onDragOver={(e) => handleFolderDragOver(e, folder.id)}
              onDrop={(e) => handleFolderDrop(e, folder.id)}
              onRename={() => {
                setFolderToEdit(folder);
                setFolderDialogOpen(true);
              }}
              onDelete={() => handleDeleteFolder(folder)}
            />
          ))}
        </div>

        {/* Storage Usage */}
        <div className="p-3 border-t border-[var(--ds-gray-200)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[var(--ds-gray-600)]">Storage</span>
            <span className="text-[10px] text-[var(--ds-gray-600)]">
              {formatFileSize(storageUsage.usedBytes)} / {formatFileSize(storageUsage.quotaBytes)}
            </span>
          </div>
          <Progress
            value={storagePercent}
            className={cn(
              "h-1",
              storagePercent >= 90 && "[&>div]:bg-[var(--ds-red-600)]",
              storagePercent >= 80 && storagePercent < 90 && "[&>div]:bg-[var(--ds-amber-600)]"
            )}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <MediaHeader
          search={search}
          filters={filters}
          viewMode={viewMode}
          isUploading={isUploading}
          onSearchChange={setSearch}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onViewModeChange={setViewMode}
          onUploadClick={handleUploadClick}
        />

        {/* Breadcrumb */}
        {currentFolder && (
          <div className="h-8 px-4 flex items-center gap-1 border-b border-[var(--ds-gray-200)] bg-[var(--ds-background-100)]">
            <button
              onClick={() => handleFolderClick(null)}
              className="text-xs text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)]"
            >
              All Files
            </button>
            <ChevronRight className="h-3 w-3 text-[var(--ds-gray-400)]" />
            <span className="text-xs font-medium text-[var(--ds-gray-900)]">{currentFolder.name}</span>
          </div>
        )}

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <BulkActionsBar
              selectedCount={selectedIds.size}
              totalCount={assets.length}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onDelete={handleBulkDelete}
              onMove={() => setMoveDialogOpen(true)}
            />
          )}
        </AnimatePresence>

        {/* Grid */}
        <MediaGrid
          ref={gridRef}
          assets={assets}
          viewMode={viewMode}
          selectedIds={selectedIds}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onSelect={handleSelect}
          onDelete={handleDeleteAsset}
          onClick={handleAssetClick}
          onDragStart={handleAssetDragStart}
          onLoadMore={handleLoadMore}
          onUploadClick={handleUploadClick}
        />

        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--ds-background-100)]/90 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-[var(--ds-gray-300)]">
                <UploadCloud className="h-10 w-10 text-[var(--ds-gray-500)]" />
                <span className="text-sm font-medium text-[var(--ds-gray-700)]">Drop files to upload</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Upload Panel */}
      <UploadPanel
        uploadingFiles={uploadingFiles}
        onCancelUpload={handleCancelUpload}
        onClearUploads={handleClearUploads}
        onRetryUpload={(file) => handleUpload([file])}
      />

      {/* Asset Viewer */}
      <AssetViewer
        asset={selectedAsset}
        assets={assets}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onDeleted={() => {
          if (selectedAsset) {
            setAssets((prev) => prev.filter((a) => a.id !== selectedAsset.id));
            setSelectedAsset(null);
          }
        }}
        onNavigate={(direction) => {
          if (!selectedAsset) return;
          const currentIndex = assets.findIndex((a) => a.id === selectedAsset.id);
          if (direction === "prev" && currentIndex > 0) {
            setSelectedAsset(assets[currentIndex - 1]);
          } else if (direction === "next" && currentIndex < assets.length - 1) {
            setSelectedAsset(assets[currentIndex + 1]);
          }
        }}
        canNavigatePrev={selectedAsset ? assets.findIndex((a) => a.id === selectedAsset.id) > 0 : false}
        canNavigateNext={selectedAsset ? assets.findIndex((a) => a.id === selectedAsset.id) < assets.length - 1 : false}
      />

      {/* Folder Dialog */}
      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={(open) => {
          setFolderDialogOpen(open);
          if (!open) {
            setFolderToEdit(null);
            setFolderName("");
          }
        }}
        mode={folderToEdit ? "rename" : "create"}
        folderName={folderToEdit ? folderToEdit.name : folderName}
        parentFolderName={currentFolder?.name || null}
        onFolderNameChange={(name) => {
          if (folderToEdit) {
            setFolderToEdit({ ...folderToEdit, name });
          } else {
            setFolderName(name);
          }
        }}
        onSubmit={() => {
          if (folderToEdit) {
            handleRenameFolder(folderToEdit.name);
          } else {
            handleCreateFolder(folderName);
          }
        }}
      />

      {/* Move Dialog */}
      <MoveDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        folders={folders}
        selectedCount={selectedIds.size}
        targetFolderId={moveTargetFolderId}
        onTargetChange={setMoveTargetFolderId}
        onMove={() => handleBulkMove(moveTargetFolderId)}
      />
    </div>
  );
}

// Folder item component
function FolderItem({
  folder,
  isActive,
  isDragOver,
  onClick,
  onDragOver,
  onDrop,
  onRename,
  onDelete,
}: {
  folder: MediaFolder;
  isActive: boolean;
  isDragOver: boolean;
  onClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-3 py-1.5 text-xs transition-colors cursor-pointer",
        isActive
          ? "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] font-medium"
          : "text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-100)]",
        isDragOver && !isActive && "ring-2 ring-inset ring-[var(--ds-blue-500)]"
      )}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {isActive ? (
        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-600)]" />
      ) : (
        <Folder className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-500)]" />
      )}
      <span className="truncate flex-1">{folder.name}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--ds-gray-200)] transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={onRename} className="text-xs gap-2">
            <PenLine className="h-3 w-3" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="text-xs gap-2 text-[var(--ds-red-700)]"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
