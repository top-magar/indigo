// Offline Support Components
export {
  OfflineIndicator,
  OfflineIndicatorCompact,
} from "./offline-indicator";
export type { OfflineIndicatorProps } from "./offline-indicator";

export { SyncStatus } from "./sync-status";
export type { SyncStatusProps } from "./sync-status";

export {
  OfflineBanner,
  OfflineBannerCompact,
  ReconnectedBanner,
} from "./offline-banner";
export type { OfflineBannerProps } from "./offline-banner";

export {
  OfflineFallback,
  StaleDataWarning,
  CachedDataBadge,
} from "./offline-fallback";
export type { OfflineFallbackProps } from "./offline-fallback";

// Types
export type {
  SyncStatus as SyncStatusType,
  SyncOperationType,
  SyncEntityType,
  ConflictResolution,
  SyncOperation,
  SyncQueueItem,
  SyncConflict,
  OfflineState,
  SyncQueueState,
  SyncQueueActions,
  SyncQueueStore,
  CacheEntry,
  CacheInvalidationStrategy,
  CacheConfig,
  UseOnlineStatusReturn,
  UseSyncQueueReturn,
} from "./offline-types";
