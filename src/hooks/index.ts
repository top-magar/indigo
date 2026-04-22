// Hooks barrel — only export hooks that exist

export { useFileUpload, type UploadedFile } from "./use-file-upload";
export { useCharacterLimit } from "./use-character-limit";
export { useBulkActions, type UseBulkActionsReturn, type UseBulkActionsOptions } from "./use-bulk-actions";
export { useFilterPresets, type FilterPreset, type UseFilterPresetsReturn, type UseFilterPresetsOptions } from "./use-filter-presets";
export { useFormDirty, type UseFormDirtyReturn, type UseFormDirtyOptions } from "./use-form-dirty";
export { useUrlFilters, type UseUrlFiltersOptions, type UseUrlFiltersReturn } from "./use-url-filters";
export { ConfirmDialogProvider, useConfirmDialog, useConfirmDelete } from "./use-confirm-dialog";
export { useCommandPalette, useCommandPaletteStore, useRegisterCommands, useRegisterCommand, type UseCommandPaletteReturn } from "./use-command-palette";
export { useNotifications, useNotificationStore, useUnreadCount, useAddNotification, type UseNotificationsReturn } from "./use-notifications";
export { useRealtimeNotifications, useNotificationConnectionStatus, type ConnectionStatus, type UseRealtimeNotificationsOptions, type UseRealtimeNotificationsReturn } from "./use-realtime-notifications";
export { useInsights, useInsightsStore } from "./use-insights";
export { useAdvancedSearch, useAdvancedSearchStore, type UseAdvancedSearchReturn } from "./use-advanced-search";
export { useKeyboardShortcuts, useKeyboardShortcutsHelp, type ShortcutRegistration, type UseKeyboardShortcutsOptions, type UseKeyboardShortcutsReturn } from "./use-keyboard-shortcuts";
export { useActivityFeed, useActivityFeedStore, type TeamMember } from "./use-activity-feed";
export { useOnlineStatus, useIsOnline, type UseOnlineStatusReturn } from "./use-online-status";
export { useSyncQueue, useSyncQueueStore, usePendingSyncCount, useIsSyncing, type UseSyncQueueReturn } from "./use-sync-queue";
export { useChartInteraction, type UseChartInteractionOptions, type UseChartInteractionReturn } from "./use-chart-interaction";
export { useCachedQuery, useIsStale, usePrefetch, getCacheEntry, setCacheEntry, invalidateCacheEntry, invalidateCacheByPrefix, clearAllCache, type CacheOptions, type CachedQueryResult } from "./use-cached-query";
export { useSaveShortcut } from "./use-save-shortcut";
