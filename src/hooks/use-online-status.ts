"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UseOnlineStatusReturn } from "@/components/dashboard/offline/offline-types";

/**
 * Hook to track online/offline status with debouncing
 * 
 * Features:
 * - Tracks navigator.onLine state
 * - Listens to online/offline events
 * - Debounces rapid changes to prevent flickering
 * - Tracks if device was recently offline (for showing sync indicators)
 * 
 * @param debounceMs - Debounce delay in milliseconds (default: 1000)
 * 
 * @example
 * ```tsx
 * const { isOnline, wasOffline, resetWasOffline } = useOnlineStatus();
 * 
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 * 
 * if (wasOffline) {
 *   return <SyncingIndicator onComplete={resetWasOffline} />;
 * }
 * ```
 */
export function useOnlineStatus(debounceMs: number = 1000): UseOnlineStatusReturn {
  // Initialize with navigator.onLine if available (SSR safe)
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true; // Assume online during SSR
  });
  
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastStatusChange, setLastStatusChange] = useState<Date | null>(null);
  
  // Refs for debouncing
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingStatusRef = useRef<boolean | null>(null);

  // Debounced status update
  const updateStatus = useCallback((online: boolean) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Store the pending status
    pendingStatusRef.current = online;

    // Debounce the update
    timeoutRef.current = setTimeout(() => {
      const newStatus = pendingStatusRef.current;
      if (newStatus === null) return;

      setIsOnline((prevOnline) => {
        // Only update if status actually changed
        if (prevOnline !== newStatus) {
          setLastStatusChange(new Date());
          
          // Track if we went offline
          if (!newStatus) {
            setWasOffline(true);
          }
        }
        return newStatus;
      });

      pendingStatusRef.current = null;
    }, debounceMs);
  }, [debounceMs]);

  // Reset wasOffline flag
  const resetWasOffline = useCallback(() => {
    setWasOffline(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      updateStatus(true);
    };

    const handleOffline = () => {
      updateStatus(false);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [updateStatus]);

  return {
    isOnline,
    wasOffline,
    lastStatusChange,
    resetWasOffline,
  };
}

/**
 * Simplified hook that just returns online status
 * Useful for simple conditional rendering
 */
export function useIsOnline(): boolean {
  const { isOnline } = useOnlineStatus();
  return isOnline;
}

export type { UseOnlineStatusReturn };
