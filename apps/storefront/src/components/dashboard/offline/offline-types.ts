/**
 * Offline Support Types
 * Types and interfaces for offline functionality and sync operations
 */

/**
 * Status of a sync operation
 */
export type SyncStatus =
  | "pending"
  | "syncing"
  | "completed"
  | "failed"
  | "conflict";

/**
 * Type of sync operation
 */
export type SyncOperationType =
  | "create"
  | "update"
  | "delete"
  | "batch";

/**
 * Entity types that can be synced
 */
export type SyncEntityType =
  | "order"
  | "product"
  | "customer"
  | "inventory"
  | "category"
  | "collection"
  | "settings";

/**
 * Conflict resolution strategy
 */
export type ConflictResolution =
  | "client_wins"
  | "server_wins"
  | "manual"
  | "merge";

/**
 * A single sync operation
 */
export interface SyncOperation {
  /** Unique identifier */
  id: string;
  /** Type of operation */
  type: SyncOperationType;
  /** Entity type being synced */
  entityType: SyncEntityType;
  /** Entity ID */
  entityId: string;
  /** Display name for the entity */
  entityName?: string;
  /** The data payload */
  payload: Record<string, unknown>;
  /** When the operation was created */
  createdAt: Date;
  /** Number of retry attempts */
  retryCount: number;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Error message if failed */
  error?: string;
  /** Server version at time of operation (for conflict detection) */
  serverVersion?: number;
}

/**
 * Item in the sync queue
 */
export interface SyncQueueItem extends SyncOperation {
  /** Current status */
  status: SyncStatus;
  /** When the item was last attempted */
  lastAttemptAt?: Date;
  /** When the item was completed */
  completedAt?: Date;
  /** Priority (lower = higher priority) */
  priority: number;
}

/**
 * Sync conflict information
 */
export interface SyncConflict {
  /** The queue item with conflict */
  item: SyncQueueItem;
  /** Server data that conflicts */
  serverData: Record<string, unknown>;
  /** Client data that conflicts */
  clientData: Record<string, unknown>;
  /** Fields that have conflicts */
  conflictingFields: string[];
  /** Detected at timestamp */
  detectedAt: Date;
}

/**
 * Overall offline state
 */
export interface OfflineState {
  /** Whether the device is online */
  isOnline: boolean;
  /** Whether the device was recently offline */
  wasOffline: boolean;
  /** When the connection status last changed */
  lastStatusChange: Date | null;
  /** Whether a sync is in progress */
  isSyncing: boolean;
  /** Current sync progress (0-100) */
  syncProgress: number;
  /** Last successful sync timestamp */
  lastSyncAt: Date | null;
  /** Number of pending operations */
  pendingCount: number;
  /** Number of failed operations */
  failedCount: number;
  /** Active conflicts */
  conflicts: SyncConflict[];
  /** Whether the offline banner is dismissed */
  bannerDismissed: boolean;
}

/**
 * Sync queue state
 */
export interface SyncQueueState {
  /** Queue items */
  items: SyncQueueItem[];
  /** Whether the queue is processing */
  isProcessing: boolean;
  /** Current processing item ID */
  currentItemId: string | null;
  /** Processing progress (0-100) */
  progress: number;
  /** Last sync timestamp */
  lastSyncAt: Date | null;
  /** Conflict resolution strategy */
  conflictStrategy: ConflictResolution;
}

/**
 * Sync queue actions
 */
export interface SyncQueueActions {
  /** Add an operation to the queue */
  addOperation: (operation: Omit<SyncOperation, "id" | "createdAt" | "retryCount" | "maxRetries">) => string;
  /** Remove an operation from the queue */
  removeOperation: (id: string) => void;
  /** Update operation status */
  updateStatus: (id: string, status: SyncStatus, error?: string) => void;
  /** Process the queue */
  processQueue: () => Promise<void>;
  /** Retry a failed operation */
  retryOperation: (id: string) => void;
  /** Retry all failed operations */
  retryAllFailed: () => void;
  /** Clear completed operations */
  clearCompleted: () => void;
  /** Clear all operations */
  clearAll: () => void;
  /** Resolve a conflict */
  resolveConflict: (id: string, resolution: ConflictResolution, mergedData?: Record<string, unknown>) => void;
  /** Set conflict strategy */
  setConflictStrategy: (strategy: ConflictResolution) => void;
  /** Set processing state */
  setProcessing: (processing: boolean) => void;
  /** Set progress */
  setProgress: (progress: number) => void;
  /** Set last sync time */
  setLastSyncAt: (date: Date | null) => void;
}

/**
 * Complete sync queue store type
 */
export type SyncQueueStore = SyncQueueState & SyncQueueActions;

/**
 * Cache entry metadata
 */
export interface CacheEntry<T = unknown> {
  /** The cached data */
  data: T;
  /** When the entry was cached */
  cachedAt: Date;
  /** When the entry expires */
  expiresAt: Date | null;
  /** Version number for conflict detection */
  version: number;
  /** ETag from server */
  etag?: string;
  /** Whether the entry is stale */
  isStale: boolean;
}

/**
 * Cache invalidation strategy
 */
export type CacheInvalidationStrategy =
  | "time_based"
  | "version_based"
  | "manual"
  | "on_mutation";

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Default TTL in milliseconds */
  defaultTtl: number;
  /** Maximum entries to store */
  maxEntries: number;
  /** Invalidation strategy */
  invalidationStrategy: CacheInvalidationStrategy;
  /** Whether to persist to IndexedDB */
  persistToIndexedDB: boolean;
}

/**
 * Return type for useOnlineStatus hook
 */
export interface UseOnlineStatusReturn {
  /** Whether currently online */
  isOnline: boolean;
  /** Whether was recently offline */
  wasOffline: boolean;
  /** When status last changed */
  lastStatusChange: Date | null;
  /** Reset wasOffline flag */
  resetWasOffline: () => void;
}

/**
 * Return type for useSyncQueue hook
 */
export interface UseSyncQueueReturn {
  /** Pending items */
  pendingItems: SyncQueueItem[];
  /** Failed items */
  failedItems: SyncQueueItem[];
  /** Completed items */
  completedItems: SyncQueueItem[];
  /** All items */
  allItems: SyncQueueItem[];
  /** Pending count */
  pendingCount: number;
  /** Failed count */
  failedCount: number;
  /** Whether syncing */
  isSyncing: boolean;
  /** Sync progress */
  syncProgress: number;
  /** Last sync timestamp */
  lastSyncAt: Date | null;
  /** Add operation */
  addOperation: SyncQueueActions["addOperation"];
  /** Remove operation */
  removeOperation: SyncQueueActions["removeOperation"];
  /** Process queue */
  processQueue: () => Promise<void>;
  /** Retry operation */
  retryOperation: SyncQueueActions["retryOperation"];
  /** Retry all failed */
  retryAllFailed: SyncQueueActions["retryAllFailed"];
  /** Clear completed */
  clearCompleted: SyncQueueActions["clearCompleted"];
  /** Clear all */
  clearAll: SyncQueueActions["clearAll"];
  /** Has pending operations */
  hasPending: boolean;
  /** Has failed operations */
  hasFailed: boolean;
}
