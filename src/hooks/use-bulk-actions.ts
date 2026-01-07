"use client";

import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
import type { BulkActionResult, BulkActionContext } from "@/components/dashboard/bulk-actions/bulk-action-types";

interface Node {
  id: string;
}

interface UseBulkActionsOptions {
  /** Initial selected IDs */
  initial?: string[];
  /** Reset selection when pagination changes (pass page/pageSize key) */
  paginationKey?: string;
  /** Callback when selection changes */
  onSelectionChange?: (ids: string[]) => void;
  /** Entity type for bulk operations */
  entityType?: BulkActionContext;
  /** Callback to refresh data after bulk operations */
  onRefresh?: () => void | Promise<void>;
}

interface UseBulkActionsReturn {
  /** Currently selected item IDs */
  selected: Set<string>;
  /** Array of selected IDs for easier iteration */
  selectedArray: string[];
  /** Number of selected items */
  selectedCount: number;
  /** Check if an item is selected */
  isSelected: (id: string) => boolean;
  /** Toggle selection of a single item */
  toggle: (id: string) => void;
  /** Add an item to selection */
  add: (id: string) => void;
  /** Remove an item from selection */
  remove: (id: string) => void;
  /** Toggle all items - selects all if not all selected, clears if all selected */
  toggleAll: (items: Node[]) => void;
  /** Select specific items */
  set: (ids: string[]) => void;
  /** Clear all selections */
  reset: () => void;
  /** Check if all items are selected */
  isAllSelected: (items: Node[]) => boolean;
  /** Check if some but not all items are selected */
  isIndeterminate: (items: Node[]) => boolean;
  /** Register a callback to clear external datagrid selection */
  setClearCallback: (callback: () => void) => void;
  /** Whether a bulk operation is in progress */
  isLoading: boolean;
  /** Execute a bulk action with loading state and toast notifications */
  executeBulkAction: <T extends BulkActionResult>(
    action: () => Promise<T>,
    options?: {
      loadingMessage?: string;
      successMessage?: string | ((result: T) => string);
      errorMessage?: string | ((error: Error) => string);
      resetOnSuccess?: boolean;
    }
  ) => Promise<T | null>;
}

/**
 * Hook for managing bulk selection actions in lists/tables
 * Inspired by Saleor's useBulkActions pattern
 * 
 * Features:
 * - Automatic reset on pagination change
 * - External clear callback support (for datagrids)
 * - Selection change notifications
 * 
 * @example
 * ```tsx
 * const { selected, toggle, toggleAll, reset, isSelected } = useBulkActions();
 * 
 * // With options
 * const { selected, toggle, reset } = useBulkActions({
 *   initial: ['id1', 'id2'],
 *   paginationKey: `${page}-${pageSize}`,
 *   onSelectionChange: (ids) => console.log('Selected:', ids),
 * });
 * 
 * // In table header
 * <Checkbox 
 *   checked={isAllSelected(items)} 
 *   indeterminate={isIndeterminate(items)}
 *   onCheckedChange={() => toggleAll(items)} 
 * />
 * 
 * // In table row
 * <Checkbox 
 *   checked={isSelected(item.id)} 
 *   onCheckedChange={() => toggle(item.id)} 
 * />
 * 
 * // Bulk actions
 * {selectedCount > 0 && (
 *   <BulkActionsBar count={selectedCount} onClear={reset} />
 * )}
 * ```
 */
export function useBulkActions(
  options?: UseBulkActionsOptions | string[]
): UseBulkActionsReturn {
  // Support both old API (string[]) and new API (options object)
  const normalizedOptions: UseBulkActionsOptions =
    Array.isArray(options)
      ? { initial: options }
      : options ?? {};

  const { initial = [], paginationKey, onSelectionChange, onRefresh } = normalizedOptions;

  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [isPending, startTransition] = useTransition();
  const [isExecuting, setIsExecuting] = useState(false);
  const clearCallbackRef = useRef<(() => void) | null>(null);
  const isFirstRender = useRef(true);
  
  const isLoading = isPending || isExecuting;

  // Clear selection when pagination changes
  useEffect(() => {
    if (paginationKey !== undefined) {
      // Skip reset on first render
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      // Call external clear callback if registered
      if (clearCallbackRef.current) {
        clearCallbackRef.current();
      }
      setSelected(new Set());
    }
  }, [paginationKey]);

  // Notify on selection change
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selected));
    }
  }, [selected, onSelectionChange]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const add = useCallback((id: string) => {
    setSelected((prev) => new Set(prev).add(id));
  }, []);

  const remove = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((items: Node[]) => {
    setSelected((prev) => {
      const allIds = items.map((item) => item.id);
      if (prev.size === allIds.length) {
        return new Set();
      }
      return new Set(allIds);
    });
  }, []);

  const set = useCallback((ids: string[]) => {
    setSelected(new Set(ids));
  }, []);

  const reset = useCallback(() => {
    // Call external clear callback if registered
    if (clearCallbackRef.current) {
      clearCallbackRef.current();
    }
    setSelected(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selected.has(id),
    [selected]
  );

  const isAllSelected = useCallback(
    (items: Node[]) => items.length > 0 && selected.size === items.length,
    [selected]
  );

  const isIndeterminate = useCallback(
    (items: Node[]) => selected.size > 0 && selected.size < items.length,
    [selected]
  );

  const setClearCallback = useCallback((callback: () => void) => {
    clearCallbackRef.current = callback;
  }, []);

  /**
   * Execute a bulk action with loading state and toast notifications
   */
  const executeBulkAction = useCallback(async <T extends BulkActionResult>(
    action: () => Promise<T>,
    actionOptions?: {
      loadingMessage?: string;
      successMessage?: string | ((result: T) => string);
      errorMessage?: string | ((error: Error) => string);
      resetOnSuccess?: boolean;
    }
  ): Promise<T | null> => {
    const {
      loadingMessage = "Processing...",
      successMessage,
      errorMessage = "Operation failed",
      resetOnSuccess = true,
    } = actionOptions ?? {};

    setIsExecuting(true);
    const toastId = toast.loading(loadingMessage);

    try {
      const result = await action();

      if (result.success) {
        const message = typeof successMessage === "function" 
          ? successMessage(result) 
          : successMessage ?? result.message ?? "Operation completed successfully";
        
        toast.success(message, { id: toastId });
        
        if (resetOnSuccess) {
          reset();
        }
        
        // Refresh data if callback provided
        if (onRefresh) {
          startTransition(() => {
            Promise.resolve(onRefresh()).catch(console.error);
          });
        }
      } else {
        const failedMessage = result.message ?? "Some items failed to process";
        
        if (result.successCount > 0) {
          // Partial success
          toast.warning(failedMessage, { id: toastId });
        } else {
          // Complete failure
          toast.error(failedMessage, { id: toastId });
        }
      }

      return result;
    } catch (error) {
      const message = typeof errorMessage === "function" 
        ? errorMessage(error as Error) 
        : errorMessage;
      
      toast.error(message, { id: toastId });
      console.error("Bulk action error:", error);
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [onRefresh, reset]);

  return {
    selected,
    selectedArray: Array.from(selected),
    selectedCount: selected.size,
    isSelected,
    toggle,
    add,
    remove,
    toggleAll,
    set,
    reset,
    isAllSelected,
    isIndeterminate,
    setClearCallback,
    isLoading,
    executeBulkAction,
  };
}

export type { UseBulkActionsReturn, UseBulkActionsOptions };
