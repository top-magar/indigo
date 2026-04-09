"use client";

import { useState, useCallback } from "react";

interface UseListActionsReturn<T> {
  /** Current list of items */
  listElements: T[];
  /** Add an item to the list */
  add: (item: T) => void;
  /** Remove an item from the list */
  remove: (item: T) => void;
  /** Toggle an item in the list */
  toggle: (item: T) => void;
  /** Check if an item is in the list */
  isSelected: (item: T) => boolean;
  /** Set the entire list */
  set: (items: T[]) => void;
  /** Reset the list to initial state */
  reset: () => void;
  /** Move an item within the list */
  move: (fromIndex: number, toIndex: number) => void;
  /** Update an item at a specific index */
  update: (index: number, item: T) => void;
}

/**
 * Hook for managing list operations (add, remove, toggle, reorder)
 * Inspired by Saleor's useListActions pattern
 * 
 * @example
 * ```tsx
 * const {
 *   listElements,
 *   add,
 *   remove,
 *   toggle,
 *   isSelected,
 *   move,
 * } = useListActions<string>([]);
 * 
 * // Add items
 * <Button onClick={() => add(newItem)}>Add</Button>
 * 
 * // Toggle selection
 * <Checkbox 
 *   checked={isSelected(item)} 
 *   onCheckedChange={() => toggle(item)} 
 * />
 * 
 * // Drag and drop reorder
 * <DndContext onDragEnd={({ active, over }) => {
 *   if (over) move(active.index, over.index);
 * }}>
 *   {listElements.map(item => ...)}
 * </DndContext>
 * ```
 */
export function useListActions<T>(
  initial: T[] = [],
  compareFn?: (a: T, b: T) => boolean
): UseListActionsReturn<T> {
  const [listElements, setListElements] = useState<T[]>(initial);

  // Default comparison function
  const compare = compareFn || ((a: T, b: T) => a === b);

  const add = useCallback((item: T) => {
    setListElements((prev) => [...prev, item]);
  }, []);

  const remove = useCallback(
    (item: T) => {
      setListElements((prev) => prev.filter((el) => !compare(el, item)));
    },
    [compare]
  );

  const toggle = useCallback(
    (item: T) => {
      setListElements((prev) => {
        const exists = prev.some((el) => compare(el, item));
        if (exists) {
          return prev.filter((el) => !compare(el, item));
        }
        return [...prev, item];
      });
    },
    [compare]
  );

  const isSelected = useCallback(
    (item: T) => listElements.some((el) => compare(el, item)),
    [listElements, compare]
  );

  const set = useCallback((items: T[]) => {
    setListElements(items);
  }, []);

  const reset = useCallback(() => {
    setListElements(initial);
  }, [initial]);

  const move = useCallback((fromIndex: number, toIndex: number) => {
    setListElements((prev) => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const update = useCallback((index: number, item: T) => {
    setListElements((prev) => {
      const result = [...prev];
      result[index] = item;
      return result;
    });
  }, []);

  return {
    listElements,
    add,
    remove,
    toggle,
    isSelected,
    set,
    reset,
    move,
    update,
  };
}

export type { UseListActionsReturn };
