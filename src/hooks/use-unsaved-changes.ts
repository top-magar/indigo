"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Warns users before navigating away from a page with unsaved changes.
 * Handles both browser close/refresh (beforeunload) and Next.js client navigation.
 *
 * @param isDirty - Whether the form has unsaved changes
 * @param message - Optional custom message (browsers may ignore this)
 */
export function useUnsavedChanges(isDirty: boolean, message = "You have unsaved changes. Are you sure you want to leave?") {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Browser close/refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Next.js client-side navigation (App Router)
  useEffect(() => {
    if (!isDirty) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      // Same-page anchor or external link — skip
      if (anchor.target === "_blank") return;

      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty, message]);
}

/**
 * Tracks form dirty state by comparing current values to initial values.
 * Returns isDirty boolean and a reset function.
 */
export function useFormDirty<T>(current: T, initial: T) {
  const initialRef = useRef(initial);
  const isDirty = JSON.stringify(current) !== JSON.stringify(initialRef.current);

  const reset = useCallback((newInitial?: T) => {
    initialRef.current = newInitial ?? current;
  }, [current]);

  return { isDirty, reset };
}
