import { create } from "zustand";
import type {
  MediaAsset,
  MediaFolder,
  StorageUsage,
  FileTypeFilter,
  AssetSortOption,
  ViewMode,
  MediaFiltersState,
} from "@/features/media/types";

interface MediaState {
  // Data
  assets: MediaAsset[];
  folders: MediaFolder[];
  storageUsage: StorageUsage | null;
  totalAssets: number;
  hasMore: boolean;
  nextCursor: string | undefined;
  isLoadingMore: boolean;

  // UI
  viewMode: ViewMode;
  currentFolderId: string | null;
  search: string;
  filters: MediaFiltersState;
  selectedIds: Set<string>;
  selectedAsset: MediaAsset | null;
  viewerOpen: boolean;
  sidebarCollapsed: boolean;

  // Dialogs
  folderDialogOpen: boolean;
  folderToEdit: MediaFolder | null;
  moveDialogOpen: boolean;

  // Actions — data
  setAssets: (assets: MediaAsset[]) => void;
  appendAssets: (assets: MediaAsset[], cursor: string | undefined, hasMore: boolean) => void;
  addAsset: (asset: MediaAsset) => void;
  removeAssets: (ids: string[]) => void;
  updateAsset: (id: string, updates: Partial<MediaAsset>) => void;
  setFolders: (folders: MediaFolder[]) => void;
  addFolder: (folder: MediaFolder) => void;
  removeFolder: (id: string) => void;
  updateFolder: (id: string, updates: Partial<MediaFolder>) => void;
  setStorageUsage: (usage: StorageUsage) => void;
  setIsLoadingMore: (v: boolean) => void;

  // Actions — UI
  setViewMode: (mode: ViewMode) => void;
  setCurrentFolder: (id: string | null) => void;
  setSearch: (search: string) => void;
  setFilters: (updates: Partial<MediaFiltersState>) => void;
  resetFilters: () => void;
  toggleSelect: (id: string, shiftKey?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  openViewer: (asset: MediaAsset) => void;
  closeViewer: () => void;
  navigateViewer: (direction: 1 | -1) => void;
  setSidebarCollapsed: (v: boolean) => void;
  openFolderDialog: (folder?: MediaFolder) => void;
  closeFolderDialog: () => void;
  openMoveDialog: () => void;
  closeMoveDialog: () => void;

  // Derived
  selectedAssets: () => MediaAsset[];
  selectedCount: () => number;

  // Init / hydrate from server
  hydrate: (data: {
    assets: MediaAsset[];
    folders: MediaFolder[];
    storageUsage: StorageUsage;
    totalAssets: number;
    hasMore: boolean;
    nextCursor?: string;
    currentFolderId: string | null;
    search: string;
    fileType: FileTypeFilter;
    sort: AssetSortOption;
  }) => void;
}

const defaultFilters: MediaFiltersState = {
  fileType: "all",
  sort: "newest",
  dateRange: "all",
  sizeRange: "all",
};

export const useMediaStore = create<MediaState>((set, get) => ({
  // Data
  assets: [],
  folders: [],
  storageUsage: null,
  totalAssets: 0,
  hasMore: false,
  nextCursor: undefined,
  isLoadingMore: false,

  // UI
  viewMode: "grid",
  currentFolderId: null,
  search: "",
  filters: defaultFilters,
  selectedIds: new Set(),
  selectedAsset: null,
  viewerOpen: false,
  sidebarCollapsed: false,

  // Dialogs
  folderDialogOpen: false,
  folderToEdit: null,
  moveDialogOpen: false,

  // Actions — data
  setAssets: (assets) => set({ assets, selectedIds: new Set() }),
  appendAssets: (newAssets, cursor, hasMore) =>
    set((s) => {
      const seen = new Set(s.assets.map((a) => a.id));
      const deduped = newAssets.filter((a) => !seen.has(a.id));
      return { assets: [...s.assets, ...deduped], nextCursor: cursor, hasMore };
    }),
  addAsset: (asset) =>
    set((s) => ({ assets: [asset, ...s.assets], totalAssets: s.totalAssets + 1 })),
  removeAssets: (ids) => {
    const idSet = new Set(ids);
    set((s) => ({
      assets: s.assets.filter((a) => !idSet.has(a.id)),
      totalAssets: s.totalAssets - ids.length,
      selectedIds: new Set([...s.selectedIds].filter((id) => !idSet.has(id))),
    }));
  },
  updateAsset: (id, updates) =>
    set((s) => ({
      assets: s.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      selectedAsset: s.selectedAsset?.id === id ? { ...s.selectedAsset, ...updates } : s.selectedAsset,
    })),
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) => set((s) => ({ folders: [...s.folders, folder] })),
  removeFolder: (id) => set((s) => ({ folders: s.folders.filter((f) => f.id !== id) })),
  updateFolder: (id, updates) =>
    set((s) => ({ folders: s.folders.map((f) => (f.id === id ? { ...f, ...updates } : f)) })),
  setStorageUsage: (usage) => set({ storageUsage: usage }),
  setIsLoadingMore: (v) => set({ isLoadingMore: v }),

  // Actions — UI
  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentFolder: (id) => set({ currentFolderId: id, selectedIds: new Set() }),
  setSearch: (search) => set({ search }),
  setFilters: (updates) => set((s) => ({ filters: { ...s.filters, ...updates } })),
  resetFilters: () => set({ filters: defaultFilters }),
  toggleSelect: (id) => {
    set((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    });
  },
  selectAll: () => set((s) => ({ selectedIds: new Set(s.assets.map((a) => a.id)) })),
  clearSelection: () => set({ selectedIds: new Set() }),
  openViewer: (asset) => set({ selectedAsset: asset, viewerOpen: true }),
  closeViewer: () => set({ viewerOpen: false }),
  navigateViewer: (direction) => {
    const { assets, selectedAsset } = get();
    if (!selectedAsset) return;
    const idx = assets.findIndex((a) => a.id === selectedAsset.id);
    const next = assets[idx + direction];
    if (next) set({ selectedAsset: next });
  },
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  openFolderDialog: (folder) => set({ folderDialogOpen: true, folderToEdit: folder ?? null }),
  closeFolderDialog: () => set({ folderDialogOpen: false, folderToEdit: null }),
  openMoveDialog: () => set({ moveDialogOpen: true }),
  closeMoveDialog: () => set({ moveDialogOpen: false }),

  // Derived
  selectedAssets: () => {
    const { assets, selectedIds } = get();
    return assets.filter((a) => selectedIds.has(a.id));
  },
  selectedCount: () => get().selectedIds.size,

  // Hydrate from server
  hydrate: (data) => {
    const seen = new Set<string>();
    const deduped = data.assets.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
    set({
      assets: deduped,
      folders: data.folders,
      storageUsage: data.storageUsage,
      totalAssets: data.totalAssets,
      hasMore: data.hasMore,
      nextCursor: data.nextCursor,
      currentFolderId: data.currentFolderId,
      search: data.search,
      filters: { ...defaultFilters, fileType: data.fileType, sort: data.sort },
      selectedIds: new Set(),
      viewerOpen: false,
    });
  },
}));
