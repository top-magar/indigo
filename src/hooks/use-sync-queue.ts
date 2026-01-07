"use client";

import { useMemo, useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SyncQueueItem,
  SyncQueueState,
  SyncQueueStore,
  SyncOperation,
  SyncStatus,
  ConflictResolution,
  UseSyncQueueReturn,
} from "@/components/dashboard/offline/offline-types";

// Helper to generate unique IDs
function generateId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Default max retries
const DEFAULT_MAX_RETRIES = 3;

// Initial state
const initialState: SyncQueueState = {
  items: [],
  isProcessing: false,
  currentItemId: null,
  progress: 0,
  lastSyncAt: null,
  conflictStrategy: "client_wins",
};

/**
 * Zustand store for sync queue management
 * Persists queue to localStorage for offline resilience
 */
export const useSyncQueueStore = create<SyncQueueStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addOperation: (operation) => {
        const id = generateId();
        const item: SyncQueueItem = {
          id,
          type: operation.type,
          entityType: operation.entityType,
          entityId: operation.entityId,
          entityName: operation.entityName,
          payload: operation.payload,
          createdAt: new Date(),
          retryCount: 0,
          maxRetries: DEFAULT_MAX_RETRIES,
          status: "pending",
          priority: operation.type === "delete" ? 0 : 1, // Deletes have higher priority
          serverVersion: operation.serverVersion,
        };

        set((state) => ({
          items: [...state.items, item],
        }));

        return id;
      },

      removeOperation: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateStatus: (id, status, error) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  error,
                  lastAttemptAt: new Date(),
                  completedAt: status === "completed" ? new Date() : item.completedAt,
                  retryCount: status === "failed" ? item.retryCount + 1 : item.retryCount,
                }
              : item
          ),
        }));
      },

      processQueue: async () => {
        const state = get();
        if (state.isProcessing) return;

        // Get pending items sorted by priority
        const pendingItems = state.items
          .filter((item) => item.status === "pending" || item.status === "failed")
          .filter((item) => item.retryCount < item.maxRetries)
          .sort((a, b) => a.priority - b.priority);

        if (pendingItems.length === 0) return;

        set({ isProcessing: true, progress: 0 });

        let processed = 0;
        const total = pendingItems.length;

        for (const item of pendingItems) {
          set({ currentItemId: item.id });
          
          // Update status to syncing
          get().updateStatus(item.id, "syncing");

          try {
            // Simulate API call - in real implementation, this would call the actual API
            await simulateSyncOperation(item);
            
            // Mark as completed
            get().updateStatus(item.id, "completed");
          } catch (error) {
            // Mark as failed
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            get().updateStatus(item.id, "failed", errorMessage);
          }

          processed++;
          set({ progress: Math.round((processed / total) * 100) });
        }

        set({
          isProcessing: false,
          currentItemId: null,
          progress: 100,
          lastSyncAt: new Date(),
        });
      },

      retryOperation: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status: "pending" as SyncStatus, error: undefined }
              : item
          ),
        }));
      },

      retryAllFailed: () => {
        set((state) => ({
          items: state.items.map((item) =>
            item.status === "failed" && item.retryCount < item.maxRetries
              ? { ...item, status: "pending" as SyncStatus, error: undefined }
              : item
          ),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          items: state.items.filter((item) => item.status !== "completed"),
        }));
      },

      clearAll: () => {
        set({ items: [] });
      },

      resolveConflict: (id, resolution, mergedData) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "pending" as SyncStatus,
                  payload: mergedData || item.payload,
                  error: undefined,
                }
              : item
          ),
        }));
      },

      setConflictStrategy: (strategy) => {
        set({ conflictStrategy: strategy });
      },

      setProcessing: (processing) => {
        set({ isProcessing: processing });
      },

      setProgress: (progress) => {
        set({ progress });
      },

      setLastSyncAt: (date) => {
        set({ lastSyncAt: date });
      },
    }),
    {
      name: "indigo-sync-queue-storage",
      // Custom serialization to handle Date objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert date strings back to Date objects
          if (parsed.state?.items) {
            parsed.state.items = parsed.state.items.map(
              (item: SyncQueueItem & { 
                createdAt: string; 
                lastAttemptAt?: string;
                completedAt?: string;
              }) => ({
                ...item,
                createdAt: new Date(item.createdAt),
                lastAttemptAt: item.lastAttemptAt ? new Date(item.lastAttemptAt) : undefined,
                completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
              })
            );
          }
          if (parsed.state?.lastSyncAt) {
            parsed.state.lastSyncAt = new Date(parsed.state.lastSyncAt);
          }
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

/**
 * Simulate a sync operation (replace with actual API calls)
 */
async function simulateSyncOperation(item: SyncQueueItem): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Simulate occasional failures (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("Network error: Failed to sync");
  }
}

/**
 * Hook for managing the sync queue
 * Provides filtered views and actions for offline sync operations
 *
 * @example
 * ```tsx
 * const {
 *   pendingItems,
 *   pendingCount,
 *   isSyncing,
 *   addOperation,
 *   processQueue,
 * } = useSyncQueue();
 *
 * // Add an operation when offline
 * addOperation({
 *   type: 'update',
 *   entityType: 'product',
 *   entityId: '123',
 *   entityName: 'Blue T-Shirt',
 *   payload: { price: 29.99 },
 * });
 *
 * // Process queue when back online
 * useEffect(() => {
 *   if (isOnline && pendingCount > 0) {
 *     processQueue();
 *   }
 * }, [isOnline, pendingCount]);
 * ```
 */
export function useSyncQueue(): UseSyncQueueReturn {
  // Get store state and actions
  const items = useSyncQueueStore((s) => s.items);
  const isProcessing = useSyncQueueStore((s) => s.isProcessing);
  const progress = useSyncQueueStore((s) => s.progress);
  const lastSyncAt = useSyncQueueStore((s) => s.lastSyncAt);
  const addOperation = useSyncQueueStore((s) => s.addOperation);
  const removeOperation = useSyncQueueStore((s) => s.removeOperation);
  const processQueue = useSyncQueueStore((s) => s.processQueue);
  const retryOperation = useSyncQueueStore((s) => s.retryOperation);
  const retryAllFailed = useSyncQueueStore((s) => s.retryAllFailed);
  const clearCompleted = useSyncQueueStore((s) => s.clearCompleted);
  const clearAll = useSyncQueueStore((s) => s.clearAll);

  // Filtered views
  const pendingItems = useMemo(
    () => items.filter((item) => item.status === "pending" || item.status === "syncing"),
    [items]
  );

  const failedItems = useMemo(
    () => items.filter((item) => item.status === "failed"),
    [items]
  );

  const completedItems = useMemo(
    () => items.filter((item) => item.status === "completed"),
    [items]
  );

  // Counts
  const pendingCount = pendingItems.length;
  const failedCount = failedItems.length;

  // Booleans
  const hasPending = pendingCount > 0;
  const hasFailed = failedCount > 0;

  return {
    pendingItems,
    failedItems,
    completedItems,
    allItems: items,
    pendingCount,
    failedCount,
    isSyncing: isProcessing,
    syncProgress: progress,
    lastSyncAt,
    addOperation,
    removeOperation,
    processQueue,
    retryOperation,
    retryAllFailed,
    clearCompleted,
    clearAll,
    hasPending,
    hasFailed,
  };
}

/**
 * Hook to get just the pending count (optimized for badge display)
 */
export function usePendingSyncCount(): number {
  return useSyncQueueStore((s) => 
    s.items.filter((item) => item.status === "pending" || item.status === "syncing").length
  );
}

/**
 * Hook to check if sync is in progress
 */
export function useIsSyncing(): boolean {
  return useSyncQueueStore((s) => s.isProcessing);
}

export type { UseSyncQueueReturn };
