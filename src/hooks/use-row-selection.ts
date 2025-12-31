"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseRowSelectionOptions {
  /** Reset selection when pagination changes */
  paginationKey?: string;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
}

interface UseRowSelectionReturn {
  /** Currently selected row IDs */
  selectedRowIds: string[];
  /** Set of selected IDs for O(1) lookup */
  selectedSet: Set<string>;
  /** Number of selected rows */
  selectedCount: number;
  /** Set selected row IDs */
  setSelectedRowIds: (ids: string[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Toggle a single row */
  toggleRow: (id: string) => void;
  /** Check if a row is selected */
  isRowSelected: (id: string) => boolean;
  /** Select all rows from a list */
  selectAll: (ids: string[]) => void;
  /** Register a callback to clear external datagrid selection */
  setClearCallback: (callback: () => void) => void;
}

/**
 * Hook for managing row selection in data tables/grids
 * Inspired by Saleor's useRowSelection pattern
 * 
 * Features:
 * - Automatic reset on pagination change
 * - External clear callback support (for datagrids)
 * - Selection change notifications
 * 
 * @example
 * ```tsx
 * const {
 *   selectedRowIds,
 *   toggleRow,
 *   isRowSelected,
 *   selectAll,
 *   clearSelection,
 *   selectedCount,
 * } = useRowSelection({
 *   paginationKey: `${page}-${pageSize}`,
 *   onSelectionChange: (ids) => console.log('Selected:', ids),
 * });
 * 
 * // In table
 * <TableRow>
 *   <TableCell>
 *     <Checkbox 
 *       checked={isRowSelected(row.id)} 
 *       onCheckedChange={() => toggleRow(row.id)} 
 *     />
 *   </TableCell>
 * </TableRow>
 * 
 * // Bulk actions
 * {selectedCount > 0 && (
 *   <div>
 *     {selectedCount} selected
 *     <Button onClick={clearSelection}>Clear</Button>
 *   </div>
 * )}
 * ```
 */
export function useRowSelection(
  options?: UseRowSelectionOptions
): UseRowSelectionReturn {
  const [selectedRowIds, setSelectedRowIdsState] = useState<string[]>([]);
  const clearCallbackRef = useRef<(() => void) | null>(null);

  // Create a Set for O(1) lookups
  const selectedSet = new Set(selectedRowIds);

  // Clear selection when pagination changes
  useEffect(() => {
    if (options?.paginationKey) {
      clearSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.paginationKey]);

  // Notify on selection change
  useEffect(() => {
    if (options?.onSelectionChange) {
      options.onSelectionChange(selectedRowIds);
    }
  }, [selectedRowIds, options]);

  const setSelectedRowIds = useCallback((ids: string[]) => {
    setSelectedRowIdsState(ids);
  }, []);

  const clearSelection = useCallback(() => {
    // Call external clear callback if registered
    if (clearCallbackRef.current) {
      clearCallbackRef.current();
    }
    setSelectedRowIdsState([]);
  }, []);

  const toggleRow = useCallback((id: string) => {
    setSelectedRowIdsState((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id);
      }
      return [...prev, id];
    });
  }, []);

  const isRowSelected = useCallback(
    (id: string) => selectedSet.has(id),
    [selectedSet]
  );

  const selectAll = useCallback((ids: string[]) => {
    setSelectedRowIdsState(ids);
  }, []);

  const setClearCallback = useCallback((callback: () => void) => {
    clearCallbackRef.current = callback;
  }, []);

  return {
    selectedRowIds,
    selectedSet,
    selectedCount: selectedRowIds.length,
    setSelectedRowIds,
    clearSelection,
    toggleRow,
    isRowSelected,
    selectAll,
    setClearCallback,
  };
}

export type { UseRowSelectionReturn, UseRowSelectionOptions };
