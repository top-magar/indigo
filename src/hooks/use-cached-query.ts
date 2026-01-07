"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================================
// Types
// ============================================================================

export interface CacheOptions {
  /** Time in milliseconds before data is considered stale (default: 5 minutes) */
  staleTime?: number;
  /** Time in milliseconds before cached data is garbage collected (default: 30 minutes) */
  cacheTime?: number;
  /** Refetch data when window regains focus */
  refetchOnFocus?: boolean;
  /** Refetch data at specified interval in milliseconds */
  refetchInterval?: number | null;
  /** Number of retry attempts on error (default: 3) */
  retryCount?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Enable localStorage persistence */
  persist?: boolean;
  /** Called when data is successfully fetched */
  onSuccess?: (data: unknown) => void;
  /** Called when fetch fails */
  onError?: (error: Error) => void;
}

export interface CachedQueryResult<T> {
  /** The cached or fetched data */
  data: T | null;
  /** Whether the initial fetch is in progress */
  isLoading: boolean;
  /** Whether the data is stale and being revalidated */
  isStale: boolean;
  /** Whether a background refetch is in progress */
  isFetching: boolean;
  /** Error from the last fetch attempt */
  error: Error | null;
  /** Manually trigger a refetch */
  refetch: () => Promise<void>;
  /** Invalidate the cache for this key */
  invalidate: () => void;
  /** Last successful fetch timestamp */
  lastUpdated: number | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000;
const CACHE_PREFIX = "widget_cache_";

// ============================================================================
// In-Memory Cache
// ============================================================================

const memoryCache = new Map<string, CacheEntry<unknown>>();
const subscribers = new Map<string, Set<() => void>>();

function notifySubscribers(key: string) {
  const subs = subscribers.get(key);
  if (subs) {
    subs.forEach((callback) => callback());
  }
}

function subscribe(key: string, callback: () => void) {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  subscribers.get(key)!.add(callback);
  return () => {
    subscribers.get(key)?.delete(callback);
  };
}

// ============================================================================
// LocalStorage Helpers
// ============================================================================

function getStorageKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

function getFromStorage<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(getStorageKey(key));
    if (!stored) return null;
    
    const entry = JSON.parse(stored) as CacheEntry<T>;
    
    // Check if cache has expired
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(getStorageKey(key));
      return null;
    }
    
    return entry;
  } catch {
    return null;
  }
}

function setToStorage<T>(key: string, entry: CacheEntry<T>): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded or other storage errors
    console.warn("Failed to persist cache to localStorage:", error);
  }
}

function removeFromStorage(key: string): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(getStorageKey(key));
  } catch {
    // Ignore errors
  }
}

// ============================================================================
// Cache Management Functions
// ============================================================================

export function getCacheEntry<T>(key: string, persist: boolean = true): CacheEntry<T> | null {
  // Check memory cache first
  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memoryEntry) {
    if (Date.now() > memoryEntry.expiresAt) {
      memoryCache.delete(key);
    } else {
      return memoryEntry;
    }
  }
  
  // Fall back to localStorage if persistence is enabled
  if (persist) {
    const storageEntry = getFromStorage<T>(key);
    if (storageEntry) {
      // Restore to memory cache
      memoryCache.set(key, storageEntry);
      return storageEntry;
    }
  }
  
  return null;
}

export function setCacheEntry<T>(
  key: string,
  data: T,
  cacheTime: number,
  persist: boolean = true
): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + cacheTime,
  };
  
  memoryCache.set(key, entry);
  
  if (persist) {
    setToStorage(key, entry);
  }
  
  notifySubscribers(key);
}

export function invalidateCacheEntry(key: string): void {
  memoryCache.delete(key);
  removeFromStorage(key);
  notifySubscribers(key);
}

export function invalidateCacheByPrefix(prefix: string): void {
  // Clear memory cache
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
      notifySubscribers(key);
    }
  }
  
  // Clear localStorage
  if (typeof window !== "undefined") {
    const storagePrefix = getStorageKey(prefix);
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey?.startsWith(storagePrefix)) {
        keysToRemove.push(storageKey);
      }
    }
    
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}

export function clearAllCache(): void {
  memoryCache.clear();
  
  if (typeof window !== "undefined") {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
  
  // Notify all subscribers
  for (const key of subscribers.keys()) {
    notifySubscribers(key);
  }
}

// ============================================================================
// Main Hook
// ============================================================================

export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): CachedQueryResult<T> {
  const {
    staleTime = DEFAULT_STALE_TIME,
    cacheTime = DEFAULT_CACHE_TIME,
    refetchOnFocus = true,
    refetchInterval = null,
    retryCount = DEFAULT_RETRY_COUNT,
    retryDelay = DEFAULT_RETRY_DELAY,
    persist = true,
    onSuccess,
    onError,
  } = options;

  // Get initial cached data
  const cachedEntry = getCacheEntry<T>(key, persist);
  const isStaleInitially = cachedEntry 
    ? Date.now() - cachedEntry.timestamp > staleTime 
    : false;

  const [data, setData] = useState<T | null>(cachedEntry?.data ?? null);
  const [isLoading, setIsLoading] = useState(!cachedEntry);
  const [isStale, setIsStale] = useState(isStaleInitially);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(
    cachedEntry?.timestamp ?? null
  );

  const fetcherRef = useRef(fetcher);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Fetch data with retry logic
  const fetchData = useCallback(
    async (isBackgroundFetch: boolean = false) => {
      if (!isBackgroundFetch) {
        setIsLoading(true);
      }
      setIsFetching(true);
      setError(null);

      const attemptFetch = async (attempt: number): Promise<T> => {
        try {
          const result = await fetcherRef.current();
          return result;
        } catch (err) {
          if (attempt < retryCount) {
            // Wait before retrying with exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * Math.pow(2, attempt))
            );
            return attemptFetch(attempt + 1);
          }
          throw err;
        }
      };

      try {
        const result = await attemptFetch(0);
        
        if (!isMountedRef.current) return;

        // Update cache
        setCacheEntry(key, result, cacheTime, persist);
        
        // Update state
        setData(result);
        setIsStale(false);
        setLastUpdated(Date.now());
        setError(null);
        retryCountRef.current = 0;
        
        onSuccess?.(result);
      } catch (err) {
        if (!isMountedRef.current) return;
        
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        
        // Keep stale data if available
        if (!data && cachedEntry?.data) {
          setData(cachedEntry.data);
          setIsStale(true);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    },
    [key, cacheTime, persist, retryCount, retryDelay, onSuccess, onError, data, cachedEntry?.data]
  );

  // Refetch function exposed to consumers
  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  // Invalidate function
  const invalidate = useCallback(() => {
    invalidateCacheEntry(key);
    setData(null);
    setIsStale(true);
    setLastUpdated(null);
    fetchData(false);
  }, [key, fetchData]);

  // Initial fetch or stale revalidation
  useEffect(() => {
    isMountedRef.current = true;

    // Check if we need to fetch
    const entry = getCacheEntry<T>(key, persist);
    
    if (!entry) {
      // No cache, fetch immediately
      fetchData(false);
    } else {
      // Update state with cached data
      setData(entry.data);
      setLastUpdated(entry.timestamp);
      
      // Check if stale
      const isDataStale = Date.now() - entry.timestamp > staleTime;
      setIsStale(isDataStale);
      setIsLoading(false);
      
      // Stale-while-revalidate: fetch in background if stale
      if (isDataStale) {
        fetchData(true);
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [key, persist, staleTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to cache updates from other components
  useEffect(() => {
    const unsubscribe = subscribe(key, () => {
      const entry = getCacheEntry<T>(key, persist);
      if (entry) {
        setData(entry.data);
        setLastUpdated(entry.timestamp);
        setIsStale(Date.now() - entry.timestamp > staleTime);
      }
    });

    return unsubscribe;
  }, [key, persist, staleTime]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus || typeof window === "undefined") return;

    const handleFocus = () => {
      const entry = getCacheEntry<T>(key, persist);
      if (!entry || Date.now() - entry.timestamp > staleTime) {
        fetchData(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [key, persist, staleTime, refetchOnFocus, fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval) return;

    const intervalId = setInterval(() => {
      fetchData(true);
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [refetchInterval, fetchData]);

  return {
    data,
    isLoading,
    isStale,
    isFetching,
    error,
    refetch,
    invalidate,
    lastUpdated,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to check if data is stale based on timestamp
 * Uses useSyncExternalStore pattern for proper React 18+ compatibility
 */
export function useIsStale(timestamp: number | null, staleTime: number = DEFAULT_STALE_TIME): boolean {
  const getSnapshot = useCallback(() => {
    if (!timestamp) return true;
    return Date.now() - timestamp > staleTime;
  }, [timestamp, staleTime]);

  const subscribe = useCallback((callback: () => void) => {
    const intervalId = setInterval(callback, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Use useSyncExternalStore for proper subscription handling
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Hook to prefetch data into cache
 */
export function usePrefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  cacheTime: number = DEFAULT_CACHE_TIME
): () => Promise<void> {
  return useCallback(async () => {
    const existing = getCacheEntry<T>(key);
    if (existing) return;

    try {
      const data = await fetcher();
      setCacheEntry(key, data, cacheTime);
    } catch {
      // Silently fail prefetch
    }
  }, [key, fetcher, cacheTime]);
}
