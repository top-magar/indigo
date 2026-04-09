"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook that returns a debounced value
 * 
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 * 
 * useEffect(() => {
 *   // This runs 300ms after the user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced callback function
 * 
 * @example
 * ```tsx
 * const debouncedSearch = useDebouncedCallback(
 *   (query: string) => fetchResults(query),
 *   300
 * );
 * 
 * return (
 *   <Input onChange={(e) => debouncedSearch(e.target.value)} />
 * );
 * ```
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

interface UseDebouncedStateReturn<T> {
  /** Current value (updates immediately) */
  value: T;
  /** Debounced value (updates after delay) */
  debouncedValue: T;
  /** Set the value */
  setValue: (value: T) => void;
  /** Whether the debounced value is pending */
  isPending: boolean;
}

/**
 * Hook that provides both immediate and debounced state
 * Useful for search inputs where you want immediate UI feedback
 * but debounced API calls
 * 
 * @example
 * ```tsx
 * const { value, debouncedValue, setValue, isPending } = useDebouncedState('', 300);
 * 
 * useEffect(() => {
 *   fetchResults(debouncedValue);
 * }, [debouncedValue]);
 * 
 * return (
 *   <div>
 *     <Input value={value} onChange={(e) => setValue(e.target.value)} />
 *     {isPending && <Spinner />}
 *   </div>
 * );
 * ```
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): UseDebouncedStateReturn<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return {
    value,
    debouncedValue,
    setValue,
    isPending,
  };
}

export type { UseDebouncedStateReturn };
