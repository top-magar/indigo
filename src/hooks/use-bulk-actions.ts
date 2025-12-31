"use client";

import { useState, useCallback } from "react";

interface Node {
  id: string;
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
}

/**
 * Hook for managing bulk selection actions in lists/tables
 * Inspired by Saleor's useBulkActions pattern
 * 
 * @example
 * ```tsx
 * const { selected, toggle, toggleAll, reset, isSelected } = useBulkActions();
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
export function useBulkActions(initial: string[] = []): UseBulkActionsReturn {
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));

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
  };
}

export type { UseBulkActionsReturn };
