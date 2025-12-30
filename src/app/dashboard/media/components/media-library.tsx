"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload04Icon } from "@hugeicons/core-free-icons";
import { useAnnouncer } from "@/components/ui/sr-announcer";
import type {
  MediaAsset,
  MediaFolder,
  StorageUsage,
  FileTypeFilter,
  AssetSortOption,
  ViewMode,
  UploadingFile,
} from "@/lib/media/types";
import { validateFile } from "@/lib/media/types";
import {
  deleteAsset,
  createFolder,
  renameFolder,
  deleteFolder,
  bulkDeleteAssets,
  bulkMoveAssets,
  getAssets,
} from "../actions";
import { FolderSidebar } from "./folder-sidebar";
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

  // Deduplicate initial assets (in case server returns duplicates)
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
  const [fileType, setFileType] = useState<FileTypeFilter>(initialFileType);
  const [sort, setSort] = useState<AssetSortOption>(initialSort);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync state when server data changes (e.g., after navigation or refresh)
  useEffect(() => {
    setAssets(deduplicatedInitialAssets);
    setHasMore(initialHasMore);
    setNextCursor(initialNextCursor);
  }, [deduplicatedInitialAssets, initialHasMore, initialNextCursor]);

  // Sync folders when server data changes
  useEffect(() => {
    setFolders(initialFolders);
  }, [initialFolders]);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Panel state
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Upload state
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const uploadAbortControllers = useRef<Map<string, AbortController>>(new Map());

  // Folder dialog state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<"create" | "rename">("create");
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [folderName, setFolderName] = useState("");

  // Move dialog state
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | null>(null);

  // Derived state
  const currentFolder = useMemo(
    () => folders.find((f) => f.id === currentFolderId),
    [folders, currentFolderId]
  );
  const isUploading = uploadingFiles.some(
    (u) => u.status === "uploading" || u.status === "pending"
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "a" && !e.shiftKey) {
        e.preventDefault();
        setSelectedIds(new Set(assets.map((a) => a.id)));
        return;
      }
      if (e.key === "Escape") {
        if (viewerOpen) {
          setViewerOpen(false);
        } else if (selectedIds.size > 0) {
          setSelectedIds(new Set());
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [assets, selectedIds, viewerOpen]);

  // URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/dashboard/media?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Search with debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        updateParams({ search: value || null });
      }, 300);
    },
    [updateParams]
  );

  const handleFileTypeChange = useCallback(
    (value: FileTypeFilter) => {
      setFileType(value);
      updateParams({ type: value === "all" ? null : value });
    },
    [updateParams]
  );

  const handleSortChange = useCallback(
    (value: AssetSortOption) => {
      setSort(value);
      updateParams({ sort: value === "newest" ? null : value });
    },
    [updateParams]
  );

  const handleFolderClick = useCallback(
    (folderId: string | null) => {
      updateParams({ folder: folderId });
    },
    [updateParams]
  );

  // Upload handling with realistic progress tracking
  // XHR progress only tracks client->server transfer, but the server then uploads to Vercel Blob
  // We split progress: 0-70% for client upload, 70-95% for server processing, 95-100% on complete
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

          // Track if we've started server processing phase
          let serverProcessingStarted = false;
          let serverProgressInterval: NodeJS.Timeout | null = null;

          const result = await new Promise<{ success: boolean; asset?: MediaAsset; error?: string }>(
            (resolve, reject) => {
              const xhr = new XMLHttpRequest();
              
              // Client upload progress (0-70%)
              xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                  // Scale to 0-70% range
                  const clientProgress = Math.round((e.loaded / e.total) * 70);
                  setUploadingFiles((prev) =>
                    prev.map((u) =>
                      u.id === upload.id && u.status === "uploading" ? { ...u, progress: Math.max(5, clientProgress) } : u
                    )
                  );
                }
              });

              // When client upload completes, start server processing animation (70-95%)
              xhr.upload.addEventListener("loadend", () => {
                if (!serverProcessingStarted) {
                  serverProcessingStarted = true;
                  let serverProgress = 70;
                  
                  // Animate progress from 70% to 95% while waiting for server response
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
            // Add to assets list, avoiding duplicates
            setAssets((prev) => {
              if (prev.some((a) => a.id === result.asset!.id)) {
                return prev; // Already exists, don't add duplicate
              }
              return [result.asset!, ...prev];
            });
            announce(`${upload.file.name} uploaded successfully`);

            // Check if we need to switch filters to show the new file
            const isHiddenByFilter =
              (fileType === "images" && !upload.file.type.startsWith("image/")) ||
              (fileType === "videos" && !upload.file.type.startsWith("video/")) ||
              (fileType === "documents" && upload.file.type !== "application/pdf");

            if (isHiddenByFilter) {
              handleFileTypeChange("all");
              announce("Switched to 'All files' to show uploaded item");
            } else {
              router.refresh();
            }
          } else {
            setUploadingFiles((prev) =>
              prev.map((u) =>
                u.id === upload.id ? { ...u, status: "error" as const, error: result.error } : u
              )
            );
            announce(`Failed to upload ${upload.file.name}`, "assertive");
          }
        } catch (error) {
          setUploadingFiles((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "error" as const, error: error instanceof Error ? error.message : "Upload failed" }
                : u
            )
          );
        } finally {
          uploadAbortControllers.current.delete(upload.id);
        }
      }

      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((u) => u.status !== "complete"));
      }, 3000);
    },
    [currentFolderId]
  );

  const cancelUpload = useCallback((uploadId: string) => {
    uploadAbortControllers.current.get(uploadId)?.abort();
    setUploadingFiles((prev) => prev.filter((u) => u.id !== uploadId));
  }, []);

  const clearUploads = useCallback(() => {
    uploadAbortControllers.current.forEach((c) => c.abort());
    uploadAbortControllers.current.clear();
    setUploadingFiles([]);
  }, []);

  const triggerUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*,.pdf";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) handleUpload(files);
    };
    input.click();
  }, [handleUpload]);

  // Drag and drop for files
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragOverFolderId(null);
      if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
    },
    [handleUpload]
  );

  // Drag assets to folders
  const handleAssetDragStart = useCallback(
    (e: React.DragEvent, assetId: string) => {
      e.dataTransfer.setData(
        "assetIds",
        selectedIds.has(assetId) ? Array.from(selectedIds).join(",") : assetId
      );
      e.dataTransfer.effectAllowed = "move";
    },
    [selectedIds]
  );

  const handleFolderDragOver = useCallback((e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("assetIds") || e.dataTransfer.getData("assetIds")) {
      setDragOverFolderId(folderId);
    }
  }, []);

  const handleFolderDrop = useCallback(
    async (e: React.DragEvent, folderId: string | null) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverFolderId(null);
      const assetIdsStr = e.dataTransfer.getData("assetIds");
      if (!assetIdsStr) return;
      const assetIds = assetIdsStr.split(",").filter(Boolean);
      if (assetIds.length === 0) return;

      const result = await bulkMoveAssets(assetIds, folderId);
      if (result.success.length > 0) {
        toast.success(`Moved ${result.success.length} file(s)`);
        if (folderId !== currentFolderId) {
          setAssets((prev) => prev.filter((a) => !result.success.includes(a.id)));
          setSelectedIds(new Set());
        }
      }
      if (result.failed.length > 0) {
        toast.error(`Failed to move ${result.failed.length} file(s)`);
      }
    },
    [currentFolderId]
  );

  // Selection handling
  const handleSelect = useCallback(
    (assetId: string, index: number, e?: React.MouseEvent) => {
      if (e?.shiftKey && lastSelectedIndex.current >= 0) {
        const start = Math.min(lastSelectedIndex.current, index);
        const end = Math.max(lastSelectedIndex.current, index);
        const rangeIds = assets.slice(start, end + 1).map((a) => a.id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          rangeIds.forEach((id) => next.add(id));
          return next;
        });
      } else {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(assetId)) next.delete(assetId);
          else next.add(assetId);
          return next;
        });
        lastSelectedIndex.current = index;
      }
    },
    [assets]
  );

  const selectAll = useCallback(() => {
    const isAllSelected = selectedIds.size === assets.length && assets.length > 0;
    const newSelection = isAllSelected ? new Set<string>() : new Set(assets.map((a) => a.id));

    setSelectedIds(newSelection);
    announce(newSelection.size === 0 ? "Selection cleared" : `${newSelection.size} items selected`);
  }, [assets, announce, selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastSelectedIndex.current = -1;
    announce("Selection cleared");
  }, [announce]);

  // Delete handling
  const handleDelete = useCallback(async (assetId: string) => {
    const result = await deleteAsset(assetId);
    if (result.success) {
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(assetId);
        return next;
      });
      toast.success("Asset deleted");
    } else {
      toast.error(result.error || "Failed to delete asset");
    }
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const result = await bulkDeleteAssets(Array.from(selectedIds));
    if (result.success.length > 0) {
      setAssets((prev) => prev.filter((a) => !result.success.includes(a.id)));
      setSelectedIds(new Set());
      toast.success(`Deleted ${result.success.length} assets`);
    }
    if (result.failed.length > 0) {
      toast.error(`Failed to delete ${result.failed.length} assets`);
    }
  }, [selectedIds]);

  // Move handling
  const handleBulkMove = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const result = await bulkMoveAssets(Array.from(selectedIds), moveTargetFolderId);
    if (result.success.length > 0) {
      toast.success(`Moved ${result.success.length} file(s)`);
      if (moveTargetFolderId !== currentFolderId) {
        setAssets((prev) => prev.filter((a) => !result.success.includes(a.id)));
      }
      setSelectedIds(new Set());
    }
    if (result.failed.length > 0) {
      toast.error(`Failed to move ${result.failed.length} file(s)`);
    }
    setMoveDialogOpen(false);
  }, [selectedIds, moveTargetFolderId, currentFolderId]);

  // Folder management
  const handleCreateFolder = useCallback(() => {
    setFolderDialogMode("create");
    setEditingFolder(null);
    setFolderName("");
    setFolderDialogOpen(true);
  }, []);

  const handleRenameFolder = useCallback((folder: MediaFolder) => {
    setFolderDialogMode("rename");
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderDialogOpen(true);
  }, []);

  const handleFolderSubmit = useCallback(async () => {
    if (!folderName.trim()) return;
    if (folderDialogMode === "create") {
      const result = await createFolder(folderName.trim(), currentFolderId);
      if (result.success && result.folder) {
        toast.success("Folder created");
        // Optimistically add the new folder to local state
        setFolders((prev) => [...prev, result.folder!].sort((a, b) => a.name.localeCompare(b.name)));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create folder");
      }
    } else if (editingFolder) {
      const result = await renameFolder(editingFolder.id, folderName.trim());
      if (result.success) {
        toast.success("Folder renamed");
        // Optimistically update the folder name in local state
        setFolders((prev) =>
          prev.map((f) =>
            f.id === editingFolder.id ? { ...f, name: folderName.trim() } : f
          ).sort((a, b) => a.name.localeCompare(b.name))
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to rename folder");
      }
    }
    setFolderDialogOpen(false);
  }, [folderDialogMode, folderName, currentFolderId, editingFolder, router]);

  const handleDeleteFolder = useCallback(
    async (folder: MediaFolder) => {
      if (!confirm(`Delete folder "${folder.name}"? Contents will be moved to parent folder.`)) return;
      const result = await deleteFolder(folder.id);
      if (result.success) {
        toast.success("Folder deleted");
        // Optimistically remove the folder from local state
        setFolders((prev) => prev.filter((f) => f.id !== folder.id));
        if (currentFolderId === folder.id) handleFolderClick(folder.parentFolderId);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete folder");
      }
    },
    [currentFolderId, handleFolderClick, router]
  );

  // Load more
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const result = await getAssets({
        folderId: currentFolderId,
        search,
        fileType,
        sort,
        cursor: nextCursor,
        limit: 50,
      });
      // Deduplicate: only add assets that aren't already in the list
      setAssets((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newAssets = result.assets.filter((a) => !existingIds.has(a.id));
        return [...prev, ...newAssets];
      });
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, nextCursor, isLoadingMore, currentFolderId, search, fileType, sort]);

  // Asset interactions
  const handleAssetClick = useCallback((asset: MediaAsset) => {
    setSelectedAsset(asset);
    setViewerOpen(true);
  }, []);

  const navigateViewer = useCallback(
    (direction: "prev" | "next") => {
      if (!selectedAsset) return;
      const idx = assets.findIndex((a) => a.id === selectedAsset.id);
      if (direction === "prev" && idx > 0) setSelectedAsset(assets[idx - 1]);
      else if (direction === "next" && idx < assets.length - 1) setSelectedAsset(assets[idx + 1]);
    },
    [assets, selectedAsset]
  );

  const handleAssetDeleted = useCallback(() => {
    if (selectedAsset) {
      setAssets((prev) => prev.filter((a) => a.id !== selectedAsset.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(selectedAsset.id);
        return next;
      });
    }
  }, [selectedAsset]);

  const handleAssetUpdated = useCallback((updatedAsset: MediaAsset) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setSelectedAsset(updatedAsset);
  }, []);

  const viewerIndex = selectedAsset ? assets.findIndex((a) => a.id === selectedAsset.id) : -1;

  return (
    <>
      <div
        className="flex h-[calc(100vh-4rem)] relative -m-6 md:-m-8 overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center backdrop-blur-sm transition-all">
            <div className="text-center animate-in fade-in zoom-in-95 duration-200">
              <HugeiconsIcon icon={Upload04Icon} className="h-16 w-16 mx-auto text-primary" />
              <p className="mt-3 text-lg font-medium">Drop files to upload</p>
              <p className="text-sm text-muted-foreground">Images, videos, and PDFs supported</p>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <FolderSidebar
          folders={folders}
          currentFolderId={currentFolderId}
          storageUsage={storageUsage}
          dragOverFolderId={dragOverFolderId}
          totalAssetCount={totalAssets}
          onFolderClick={handleFolderClick}
          onFolderDragOver={handleFolderDragOver}
          onFolderDrop={handleFolderDrop}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <MediaHeader
            search={search}
            fileType={fileType}
            sort={sort}
            viewMode={viewMode}
            isUploading={isUploading}
            onSearchChange={handleSearch}
            onFileTypeChange={handleFileTypeChange}
            onSortChange={handleSortChange}
            onViewModeChange={setViewMode}
            onUploadClick={triggerUpload}
          />

          <BulkActionsBar
            selectedCount={selectedIds.size}
            totalCount={assets.length}
            onSelectAll={selectAll}
            onMove={() => {
              setMoveTargetFolderId(null);
              setMoveDialogOpen(true);
            }}
            onDelete={handleBulkDelete}
            onClearSelection={clearSelection}
          />

          <UploadPanel
            uploadingFiles={uploadingFiles}
            onCancelUpload={cancelUpload}
            onClearUploads={clearUploads}
            onRetryUpload={(file) => handleUpload([file])}
          />

          <MediaGrid
            ref={gridRef}
            assets={assets}
            viewMode={viewMode}
            selectedIds={selectedIds}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onClick={handleAssetClick}
            onDragStart={handleAssetDragStart}
            onLoadMore={loadMore}
            onUploadClick={triggerUpload}
          />
        </div>
      </div>

      {/* Dialogs and panels */}
      <AssetViewer
        asset={selectedAsset}
        assets={assets}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onDeleted={handleAssetDeleted}
        onUpdated={handleAssetUpdated}
        onNavigate={navigateViewer}
        canNavigatePrev={viewerIndex > 0}
        canNavigateNext={viewerIndex < assets.length - 1}
      />

      <FolderDialog
        open={folderDialogOpen}
        mode={folderDialogMode}
        folderName={folderName}
        parentFolderName={currentFolder?.name ?? null}
        onOpenChange={setFolderDialogOpen}
        onFolderNameChange={setFolderName}
        onSubmit={handleFolderSubmit}
      />

      <MoveDialog
        open={moveDialogOpen}
        selectedCount={selectedIds.size}
        folders={folders}
        targetFolderId={moveTargetFolderId}
        onOpenChange={setMoveDialogOpen}
        onTargetChange={setMoveTargetFolderId}
        onMove={handleBulkMove}
      />
    </>
  );
}
