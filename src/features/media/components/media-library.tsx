"use client";

import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

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
} from "@/features/media/types";
import { formatFileSize } from "@/features/media/types";
import {
  createFolder,
  renameFolder,
  deleteFolder,
  bulkDeleteAssets,
  bulkMoveAssets,
  getAssets,
} from "@/app/dashboard/media/actions";
import { useMediaStore } from "@/features/media/media-store";
import { useUploadStore } from "@/features/media/upload-store";
import { MediaHeader } from "./media-header";
import { MediaGrid } from "./media-grid";
import { BulkActionsBar } from "./bulk-actions-bar";
import { UploadPanel } from "./upload-panel";
import { AssetViewer } from "./asset-viewer";
import { FolderDialog } from "./folder-dialog";
import { MoveDialog } from "./move-dialog";

// --- Props ---
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

export function MediaLibrary(props: MediaLibraryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { announce } = useAnnouncer();

  // --- Hydrate store from SSR ---
  useEffect(() => {
    useMediaStore.getState().hydrate({
      assets: props.initialAssets,
      folders: props.folders,
      storageUsage: props.storageUsage,
      totalAssets: props.totalAssets,
      hasMore: props.initialHasMore,
      nextCursor: props.initialNextCursor,
      currentFolderId: props.currentFolderId,
      search: props.initialSearch,
      fileType: props.initialFileType,
      sort: props.initialSort,
    });
  }, [props.initialAssets, props.initialHasMore, props.initialNextCursor, props.totalAssets, props.folders, props.storageUsage, props.currentFolderId, props.initialSearch, props.initialFileType, props.initialSort]);

  // --- Store selectors ---
  const assets = useMediaStore((s) => s.assets);
  const folders = useMediaStore((s) => s.folders);
  const storageUsage = useMediaStore((s) => s.storageUsage);
  const totalAssets = useMediaStore((s) => s.totalAssets);
  const hasMore = useMediaStore((s) => s.hasMore);
  const nextCursor = useMediaStore((s) => s.nextCursor);
  const isLoadingMore = useMediaStore((s) => s.isLoadingMore);
  const viewMode = useMediaStore((s) => s.viewMode);
  const currentFolderId = useMediaStore((s) => s.currentFolderId);
  const search = useMediaStore((s) => s.search);
  const filters = useMediaStore((s) => s.filters);
  const selectedIds = useMediaStore((s) => s.selectedIds);
  const selectedAsset = useMediaStore((s) => s.selectedAsset);
  const viewerOpen = useMediaStore((s) => s.viewerOpen);
  const sidebarCollapsed = useMediaStore((s) => s.sidebarCollapsed);
  const folderDialogOpen = useMediaStore((s) => s.folderDialogOpen);
  const folderToEdit = useMediaStore((s) => s.folderToEdit);
  const moveDialogOpen = useMediaStore((s) => s.moveDialogOpen);

  const isDragging = useUploadStore((s) => s.isDragging);

  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");

  // --- Derived ---
  const currentFolder = useMemo(() => folders.find((f) => f.id === currentFolderId) ?? null, [folders, currentFolderId]);
  const rootFolders = useMemo(() => folders.filter((f) => !f.parentFolderId), [folders]);
  const storagePercent = useMemo(() => storageUsage ? Math.round((storageUsage.usedBytes / storageUsage.quotaBytes) * 100) : 0, [storageUsage]);

  // --- URL sync ---
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => (v === null ? params.delete(k) : params.set(k, v)));
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    const t = setTimeout(() => updateParams({ search: search || null }), 300);
    return () => clearTimeout(t);
  }, [search, updateParams]);

  // --- Drag-drop ---
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.types.includes("Files")) useUploadStore.getState().setDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget === e.target) useUploadStore.getState().setDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); useUploadStore.getState().setDragging(false); if (e.dataTransfer.files.length > 0) useUploadStore.getState().addFiles(Array.from(e.dataTransfer.files), currentFolderId); }, [currentFolderId]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "a" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); useMediaStore.getState().selectAll(); }
      else if (e.key === "Escape") { viewerOpen ? useMediaStore.getState().closeViewer() : useMediaStore.getState().clearSelection(); }
      else if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.size > 0 && !viewerOpen) { handleBulkDelete(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewerOpen, selectedIds.size]);

  // --- Server action callbacks ---
  const handleUploadClick = useCallback(() => fileInputRef.current?.click(), []);
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) { useUploadStore.getState().addFiles(Array.from(e.target.files), currentFolderId); e.target.value = ""; } }, [currentFolderId]);

  const handleFolderClick = useCallback((folderId: string | null) => updateParams({ folder: folderId }), [updateParams]);

  const handleSelect = useCallback((assetId: string, _index: number, e?: React.MouseEvent) => {
    if (e?.metaKey || e?.ctrlKey) { useMediaStore.getState().toggleSelect(assetId); }
    else { const s = useMediaStore.getState(); const next = new Set<string>(); if (s.selectedIds.has(assetId) && s.selectedIds.size === 1) { /* deselect */ } else { next.add(assetId); } useMediaStore.setState({ selectedIds: next }); }
  }, []);

  const handleLoadMore = useCallback(async () => {
    const s = useMediaStore.getState();
    if (s.isLoadingMore || !s.hasMore || !s.nextCursor) return;
    useMediaStore.getState().setIsLoadingMore(true);
    try {
      const result = await getAssets({ folderId: s.currentFolderId, search: s.search || undefined, fileType: s.filters.fileType, sort: s.filters.sort, cursor: s.nextCursor, limit: 50 });
      useMediaStore.getState().appendAssets(result.assets, result.nextCursor, result.hasMore);
    } catch { toast.error("Failed to load more assets"); }
    finally { useMediaStore.getState().setIsLoadingMore(false); }
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(useMediaStore.getState().selectedIds);
    if (ids.length === 0) return;
    try { await bulkDeleteAssets(ids); useMediaStore.getState().removeAssets(ids); toast.success(`${ids.length} assets deleted`); announce(`${ids.length} assets deleted`); }
    catch { toast.error("Failed to delete assets"); }
  }, [announce]);

  const handleBulkMove = useCallback(async (targetFolderId: string | null) => {
    const ids = Array.from(useMediaStore.getState().selectedIds);
    if (ids.length === 0) return;
    try { await bulkMoveAssets(ids, targetFolderId); if (targetFolderId !== currentFolderId) useMediaStore.getState().removeAssets(ids); useMediaStore.getState().clearSelection(); useMediaStore.getState().closeMoveDialog(); toast.success(`${ids.length} assets moved`); announce(`${ids.length} assets moved`); }
    catch { toast.error("Failed to move assets"); }
  }, [currentFolderId, announce]);

  const handleCreateFolder = useCallback(async (name: string) => {
    try { const result = await createFolder(name, currentFolderId); if (result.success && result.folder) { useMediaStore.getState().addFolder(result.folder); useMediaStore.getState().closeFolderDialog(); setFolderName(""); toast.success("Folder created"); announce("Folder created"); } else throw new Error(result.error); }
    catch { toast.error("Failed to create folder"); }
  }, [currentFolderId, announce]);

  const handleRenameFolder = useCallback(async (name: string) => {
    if (!folderToEdit) return;
    try { await renameFolder(folderToEdit.id, name); useMediaStore.getState().updateFolder(folderToEdit.id, { name }); useMediaStore.getState().closeFolderDialog(); setFolderName(""); toast.success("Folder renamed"); announce("Folder renamed"); }
    catch { toast.error("Failed to rename folder"); }
  }, [folderToEdit, announce]);

  const handleDeleteFolder = useCallback(async (folder: MediaFolder) => {
    try { await deleteFolder(folder.id); useMediaStore.getState().removeFolder(folder.id); if (currentFolderId === folder.id) handleFolderClick(null); toast.success("Folder deleted"); announce("Folder deleted"); }
    catch { toast.error("Failed to delete folder"); }
  }, [currentFolderId, handleFolderClick, announce]);

  const handleDeleteAsset = useCallback(async (assetId: string) => {
    try { const { deleteAsset } = await import("@/app/dashboard/media/actions"); await deleteAsset(assetId); useMediaStore.getState().removeAssets([assetId]); toast.success("Asset deleted"); announce("Asset deleted"); }
    catch { toast.error("Failed to delete asset"); }
  }, [announce]);

  const handleAssetDragStart = useCallback((e: React.DragEvent, assetId: string) => {
    const ids = selectedIds.has(assetId) ? Array.from(selectedIds) : [assetId];
    e.dataTransfer.setData("application/x-asset-ids", JSON.stringify(ids));
    e.dataTransfer.effectAllowed = "move";
  }, [selectedIds]);

  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const handleFolderDragOver = useCallback((e: React.DragEvent, folderId: string | null) => { e.preventDefault(); if (e.dataTransfer.types.includes("application/x-asset-ids")) setDragOverFolderId(folderId); }, []);
  const handleFolderDrop = useCallback(async (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault(); setDragOverFolderId(null);
    const data = e.dataTransfer.getData("application/x-asset-ids"); if (!data) return;
    try { const ids = JSON.parse(data) as string[]; await bulkMoveAssets(ids, folderId); if (folderId !== currentFolderId) useMediaStore.getState().removeAssets(ids); useMediaStore.getState().clearSelection(); toast.success(`${ids.length} asset(s) moved`); }
    catch { toast.error("Failed to move assets"); }
  }, [currentFolderId]);

  // --- Render ---
  return (
    <div className="flex h-[calc(100vh-6.5rem)] overflow-hidden rounded-lg border border-border" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleFileInputChange} className="hidden" />

      {/* Sidebar */}
      <aside className={cn("flex flex-col border-r border-border bg-background transition-all duration-200", sidebarCollapsed ? "w-0 overflow-hidden" : "w-56")}>
        <div className="h-12 px-3 flex items-center justify-between border-b border-border">
          <span className="text-xs font-medium text-foreground">Folders</span>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" onClick={() => useMediaStore.getState().openFolderDialog()} className="size-5 p-0"><FolderPlus className="size-3.5" /></Button></TooltipTrigger><TooltipContent>New folder</TooltipContent></Tooltip>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <button onClick={() => handleFolderClick(null)} onDragOver={(e) => handleFolderDragOver(e, null)} onDrop={(e) => handleFolderDrop(e, null)} className={cn("w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors", currentFolderId === null ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted", dragOverFolderId === null && currentFolderId !== null && "ring-2 ring-inset ring-primary/70")}>
            <HardDrive className="size-3.5 shrink-0" /><span className="truncate">All Files</span><span className="ml-auto text-[10px] text-muted-foreground/50">{totalAssets}</span>
          </button>
          {rootFolders.map((folder) => (
            <FolderItem key={folder.id} folder={folder} isActive={currentFolderId === folder.id} isDragOver={dragOverFolderId === folder.id} onClick={() => handleFolderClick(folder.id)} onDragOver={(e) => handleFolderDragOver(e, folder.id)} onDrop={(e) => handleFolderDrop(e, folder.id)} onRename={() => useMediaStore.getState().openFolderDialog(folder)} onDelete={() => handleDeleteFolder(folder)} />
          ))}
        </div>
        {storageUsage && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">Storage</span>
              <span className="text-[10px] text-muted-foreground">{formatFileSize(storageUsage.usedBytes)} / {formatFileSize(storageUsage.quotaBytes)}</span>
            </div>
            <Progress value={storagePercent} className={cn("h-1", storagePercent >= 90 && "[&>div]:bg-destructive", storagePercent >= 80 && storagePercent < 90 && "[&>div]:bg-amber-500")} />
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MediaHeader onUploadClick={handleUploadClick} />
        {currentFolder && (
          <div className="h-8 px-4 flex items-center gap-1 border-b border-border bg-background">
            <button onClick={() => handleFolderClick(null)} className="text-xs text-muted-foreground hover:text-foreground">All Files</button>
            <ChevronRight className="size-3.5 text-muted-foreground/30" /><span className="text-xs font-medium text-foreground">{currentFolder.name}</span>
          </div>
        )}
        {selectedIds.size > 0 && (
          <BulkActionsBar onDelete={handleBulkDelete} onMove={() => useMediaStore.getState().openMoveDialog()} />
        )}
        <MediaGrid ref={gridRef} assets={assets} viewMode={viewMode} selectedIds={selectedIds} isLoadingMore={isLoadingMore} hasMore={hasMore} onSelect={handleSelect} onDelete={handleDeleteAsset} onClick={(a) => useMediaStore.getState().openViewer(a)} onDragStart={handleAssetDragStart} onLoadMore={handleLoadMore} onUploadClick={handleUploadClick} />
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90">
            <div className="flex flex-col items-center gap-3 p-8 rounded-lg border-2 border-dashed"><UploadCloud className="size-8 text-muted-foreground" /><span className="text-sm text-muted-foreground">Drop files to upload</span></div>
          </div>
        )}
      </main>

      {/* Panels & Dialogs */}
      <UploadPanel />
      <AssetViewer asset={selectedAsset} assets={assets} open={viewerOpen} onOpenChange={(open) => { if (!open) useMediaStore.getState().closeViewer(); }} onDeleted={() => { if (selectedAsset) { useMediaStore.getState().removeAssets([selectedAsset.id]); useMediaStore.getState().closeViewer(); } }} onNavigate={(dir) => useMediaStore.getState().navigateViewer(dir === "prev" ? -1 : 1)} canNavigatePrev={selectedAsset ? assets.findIndex((a) => a.id === selectedAsset.id) > 0 : false} canNavigateNext={selectedAsset ? assets.findIndex((a) => a.id === selectedAsset.id) < assets.length - 1 : false} />
      <FolderDialog open={folderDialogOpen} onOpenChange={(open) => { if (!open) { useMediaStore.getState().closeFolderDialog(); setFolderName(""); } }} mode={folderToEdit ? "rename" : "create"} folderName={folderToEdit ? folderToEdit.name : folderName} parentFolderName={currentFolder?.name ?? null} onFolderNameChange={(name) => { if (folderToEdit) useMediaStore.setState({ folderToEdit: { ...folderToEdit, name } }); else setFolderName(name); }} onSubmit={() => { if (folderToEdit) handleRenameFolder(folderToEdit.name); else handleCreateFolder(folderName); }} />
      <MoveDialog open={moveDialogOpen} onOpenChange={(open) => { if (!open) useMediaStore.getState().closeMoveDialog(); }} folders={folders} selectedCount={selectedIds.size} targetFolderId={moveTargetFolderId} onTargetChange={setMoveTargetFolderId} onMove={() => handleBulkMove(moveTargetFolderId)} />
    </div>
  );
}

// --- FolderItem ---
function FolderItem({ folder, isActive, isDragOver, onClick, onDragOver, onDrop, onRename, onDelete }: { folder: MediaFolder; isActive: boolean; isDragOver: boolean; onClick: () => void; onDragOver: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void; onRename: () => void; onDelete: () => void }) {
  return (
    <div className={cn("group flex items-center gap-2 px-3 py-1.5 text-xs transition-colors cursor-pointer", isActive ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted", isDragOver && !isActive && "ring-2 ring-inset ring-primary/70")} onClick={onClick} onDragOver={onDragOver} onDrop={onDrop}>
      {isActive ? <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" /> : <Folder className="size-3.5 shrink-0 text-muted-foreground/50" />}
      <span className="truncate flex-1">{folder.name}</span>
      <DropdownMenu><DropdownMenuTrigger asChild><button onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-border transition-opacity"><MoreHorizontal className="size-3.5" /></button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32"><DropdownMenuItem onClick={onRename} className="text-xs gap-2"><PenLine className="size-3.5" />Rename</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={onDelete} className="text-xs gap-2 text-destructive"><Trash2 className="size-3.5" />Delete</DropdownMenuItem></DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
