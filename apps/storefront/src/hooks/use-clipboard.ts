"use client";

import { useState, useCallback } from "react";

interface UseClipboardOptions {
  /** Duration to show copied state (ms) */
  timeout?: number;
  /** Callback on successful copy */
  onSuccess?: (text: string) => void;
  /** Callback on copy error */
  onError?: (error: Error) => void;
}

interface UseClipboardReturn {
  /** Whether text was recently copied */
  copied: boolean;
  /** Copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Reset copied state */
  reset: () => void;
}

/**
 * Hook for copying text to clipboard with feedback
 * Inspired by Saleor's useClipboard pattern
 * 
 * @example
 * ```tsx
 * const { copy, copied } = useClipboard({ timeout: 2000 });
 * 
 * return (
 *   <Button onClick={() => copy(orderNumber)}>
 *     {copied ? <CheckIcon /> : <CopyIcon />}
 *     {copied ? "Copied!" : "Copy Order #"}
 *   </Button>
 * );
 * ```
 */
export function useClipboard(
  options?: UseClipboardOptions
): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const timeout = options?.timeout ?? 2000;

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        console.warn("Clipboard API not available");
        const error = new Error("Clipboard API not available");
        options?.onError?.(error);
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        options?.onSuccess?.(text);

        // Reset after timeout
        setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        const error = err instanceof Error ? err : new Error("Copy failed");
        options?.onError?.(error);
        return false;
      }
    },
    [timeout, options]
  );

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return {
    copied,
    copy,
    reset,
  };
}

export type { UseClipboardReturn, UseClipboardOptions };
