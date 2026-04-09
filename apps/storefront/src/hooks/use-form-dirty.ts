"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseFormDirtyOptions<T> {
  /** Initial form data */
  initialData: T;
  /** Callback when form becomes dirty */
  onDirtyChange?: (isDirty: boolean) => void;
  /** Show browser confirmation on navigation when dirty */
  confirmOnLeave?: boolean;
  /** Custom confirmation message */
  confirmMessage?: string;
}

interface UseFormDirtyReturn<T> {
  /** Current form data */
  data: T;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Update a single field */
  setField: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Update multiple fields */
  setFields: (updates: Partial<T>) => void;
  /** Reset form to initial data */
  reset: () => void;
  /** Reset form to new data (updates initial reference) */
  resetTo: (newData: T) => void;
  /** Mark form as clean (after save) */
  markClean: () => void;
  /** Get changed fields only */
  getChangedFields: () => Partial<T>;
}

/**
 * Hook for tracking form dirty state with change detection
 * Inspired by Saleor's form patterns
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   isDirty,
 *   setField,
 *   reset,
 *   markClean,
 *   getChangedFields,
 * } = useFormDirty({
 *   initialData: product,
 *   confirmOnLeave: true,
 * });
 * 
 * const handleSave = async () => {
 *   const changes = getChangedFields();
 *   await updateProduct(product.id, changes);
 *   markClean();
 * };
 * 
 * return (
 *   <form>
 *     <Input 
 *       value={data.name} 
 *       onChange={(e) => setField('name', e.target.value)} 
 *     />
 *     
 *     {isDirty && (
 *       <Savebar>
 *         <Button onClick={reset}>Discard</Button>
 *         <Button onClick={handleSave}>Save</Button>
 *       </Savebar>
 *     )}
 *   </form>
 * );
 * ```
 */
export function useFormDirty<T extends Record<string, unknown>>(
  options: UseFormDirtyOptions<T>
): UseFormDirtyReturn<T> {
  const { initialData, onDirtyChange, confirmOnLeave, confirmMessage } = options;
  
  const [data, setData] = useState<T>(initialData);
  const initialRef = useRef<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);

  // Deep comparison for dirty check
  const checkDirty = useCallback((current: T, initial: T): boolean => {
    const currentKeys = Object.keys(current);
    const initialKeys = Object.keys(initial);

    if (currentKeys.length !== initialKeys.length) return true;

    return currentKeys.some((key) => {
      const currentVal = current[key];
      const initialVal = initial[key];

      // Handle arrays
      if (Array.isArray(currentVal) && Array.isArray(initialVal)) {
        if (currentVal.length !== initialVal.length) return true;
        return currentVal.some((item, index) => {
          if (typeof item === "object" && item !== null) {
            return JSON.stringify(item) !== JSON.stringify(initialVal[index]);
          }
          return item !== initialVal[index];
        });
      }

      // Handle objects
      if (
        typeof currentVal === "object" &&
        currentVal !== null &&
        typeof initialVal === "object" &&
        initialVal !== null
      ) {
        return JSON.stringify(currentVal) !== JSON.stringify(initialVal);
      }

      return currentVal !== initialVal;
    });
  }, []);

  // Update dirty state when data changes
  useEffect(() => {
    const newIsDirty = checkDirty(data, initialRef.current);
    if (newIsDirty !== isDirty) {
      setIsDirty(newIsDirty);
      onDirtyChange?.(newIsDirty);
    }
  }, [data, isDirty, checkDirty, onDirtyChange]);

  // Browser confirmation on leave
  useEffect(() => {
    if (!confirmOnLeave || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = confirmMessage || "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, confirmOnLeave, confirmMessage]);

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFields = useCallback((updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setData(initialRef.current);
  }, []);

  const resetTo = useCallback((newData: T) => {
    initialRef.current = newData;
    setData(newData);
    setIsDirty(false);
  }, []);

  const markClean = useCallback(() => {
    initialRef.current = data;
    setIsDirty(false);
  }, [data]);

  const getChangedFields = useCallback((): Partial<T> => {
    const changes: Partial<T> = {};
    const initial = initialRef.current;

    Object.keys(data).forEach((key) => {
      const k = key as keyof T;
      const currentVal = data[k];
      const initialVal = initial[k];

      // Simple comparison for primitives
      if (typeof currentVal !== "object" || currentVal === null) {
        if (currentVal !== initialVal) {
          changes[k] = currentVal;
        }
        return;
      }

      // Deep comparison for objects/arrays
      if (JSON.stringify(currentVal) !== JSON.stringify(initialVal)) {
        changes[k] = currentVal;
      }
    });

    return changes;
  }, [data]);

  return {
    data,
    isDirty,
    setField,
    setFields,
    reset,
    resetTo,
    markClean,
    getChangedFields,
  };
}

export type { UseFormDirtyReturn, UseFormDirtyOptions };
