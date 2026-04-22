// Existing hooks
export { useFileUpload, type UploadedFile } from "./use-file-upload";
export { useCharacterLimit } from "./use-character-limit";
export { useIsMobile } from "./use-mobile";

// Saleor-inspired hooks
export { useWizard, type UseWizardReturn, type UseWizardOptions } from "./use-wizard";
export { useBulkActions, type UseBulkActionsReturn, type UseBulkActionsOptions } from "./use-bulk-actions";
export { useFilterPresets, type FilterPreset, type UseFilterPresetsReturn, type UseFilterPresetsOptions } from "./use-filter-presets";
export { useDebounce, useDebouncedCallback, useDebouncedState, type UseDebouncedStateReturn } from "./use-debounce";
export { useClipboard, type UseClipboardReturn, type UseClipboardOptions } from "./use-clipboard";
export { useFormDirty, type UseFormDirtyReturn, type UseFormDirtyOptions } from "./use-form-dirty";
export { useListActions, type UseListActionsReturn } from "./use-list-actions";
export { useUrlFilters, type UseUrlFiltersOptions, type UseUrlFiltersReturn } from "./use-url-filters";

// Currency hooks
export {
  useCurrency,
  useFormatPrice,
  usePriceFormatter,
  useCurrencyConverter,
  useCurrencyInfo,
  useCurrencyWithFallback,
  type UseCurrencyConverterReturn,
} from "./use-currency";

// UI hooks
export {
  ConfirmDialogProvider,
  useConfirmDialog,
  useConfirmDelete,
} from "./use-confirm-dialog";

// Unsaved changes warning hook
export {
  useUnsavedChanges,
  useBlockUnsavedChanges,
  type UseUnsavedChangesOptions,
  type UseUnsavedChangesReturn,
} from "./use-unsaved-changes";

// Command palette hook
export {
  useCommandPalette,
  useCommandPaletteStore,
  useRegisterCommands,
  useRegisterCommand,
  type UseCommandPaletteReturn,
} from "./use-command-palette";

// Onboarding hooks
export {
  useOnboarding,
  useOnboardingTip,
  type OnboardingTipId,
  type SetupStepId,
  type OnboardingState,
  type UseOnboardingReturn,
} from "./use-onboarding";

// Bulk Export hook
export {
  useBulkExport,
  type ExportFormat,
  type ExportColumnConfig,
  type ExportOptions,
  type UseBulkExportReturn,
  type BulkExportColumn,
} from "./use-bulk-export";

// Notifications hooks
export {
  useNotifications,
  useNotificationStore,
  useUnreadCount,
  useAddNotification,
  type UseNotificationsReturn,
} from "./use-notifications";

// Real-time Notifications hooks
export {
  useRealtimeNotifications,
  useNotificationConnectionStatus,
  type ConnectionStatus,
  type UseRealtimeNotificationsOptions,
  type UseRealtimeNotificationsReturn,
  type NotificationEventData,
} from "./use-realtime-notifications";

// AI-Powered Insights hooks
export {
  useInsights,
  useInsightsStore,
} from "./use-insights";

// Advanced Search hooks
export {
  useAdvancedSearch,
  useAdvancedSearchStore,
  type UseAdvancedSearchReturn,
} from "./use-advanced-search";

// Keyboard shortcuts hooks
export {
  useKeyboardShortcuts,
  useKeyboardShortcutsHelp,
  type ShortcutRegistration,
  type UseKeyboardShortcutsOptions,
  type UseKeyboardShortcutsReturn,
} from "./use-keyboard-shortcuts";

// Activity Feed hooks
export {
  useActivityFeed,
  useActivityFeedStore,
  MOCK_TEAM_MEMBERS,
  generateMockActivities,
  groupActivitiesByDate,
  getActivityCategory,
  type TeamMember,
} from "./use-activity-feed";

// Offline Support hooks
export {
  useOnlineStatus,
  useIsOnline,
  type UseOnlineStatusReturn,
} from "./use-online-status";

export {
  useSyncQueue,
  useSyncQueueStore,
  usePendingSyncCount,
  useIsSyncing,
  type UseSyncQueueReturn,
} from "./use-sync-queue";

// Chart Interaction hooks
export {
  useChartInteraction,
  type UseChartInteractionOptions,
  type UseChartInteractionReturn,
} from "./use-chart-interaction";


// Dashboard Layout hooks
export {
  useDashboardLayout,
  useDashboardLayoutStore,
  DEFAULT_RESPONSIVE_CONFIG,
} from "./use-dashboard-layout";
export type {
  DashboardLayoutState,
  DashboardLayoutActions,
  DashboardLayoutStore,
  ResponsiveLayoutConfig,
} from "./use-dashboard-layout";

// Responsive Breakpoint hooks
export {
  useResponsiveBreakpoint,
  useBreakpoint,
  useMinBreakpoint,
  useMaxBreakpoint,
  BREAKPOINT_VALUES,
} from "./use-responsive-breakpoint";
export type {
  Breakpoint,
  UseResponsiveBreakpointOptions,
  UseResponsiveBreakpointReturn,
} from "./use-responsive-breakpoint";

// Cached Query hooks (stale-while-revalidate pattern)
export {
  useCachedQuery,
  useIsStale,
  usePrefetch,
  getCacheEntry,
  setCacheEntry,
  invalidateCacheEntry,
  invalidateCacheByPrefix,
  clearAllCache,
} from "./use-cached-query";
export type {
  CacheOptions,
  CachedQueryResult,
} from "./use-cached-query";

// WebSocket hooks
export {
  useWebSocket,
  useWebSocketStore,
  useWebSocketStatus,
  useIsWebSocketConnected,
  usePendingWebSocketMessages,
  useRoomUsers,
  useTypingUsers,
} from "./use-websocket";
export type {
  WebSocketStatus,
  MessageHandler,
  UseWebSocketOptions,
  UseWebSocketReturn,
  QueuedMessage,
} from "./use-websocket";

// Chart Colors hooks (OKLCH)
export {
  useChartColors,
  useChartPreset,
  CHART_PRESETS,
} from "./use-chart-colors";
export type { ChartColorName } from "./use-chart-colors";
