"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ShortcutRegistration,
  UseKeyboardShortcutsOptions,
  UseKeyboardShortcutsReturn,
} from "@/components/dashboard/keyboard-shortcuts/types";

/**
 * Check if the current focus is in an input-like element
 */
function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isInput = tagName === "input" || tagName === "textarea" || tagName === "select";
  const isContentEditable = activeElement.getAttribute("contenteditable") === "true";

  return isInput || isContentEditable;
}

/**
 * Normalize a key for comparison
 */
function normalizeKey(key: string): string {
  const keyLower = key.toLowerCase();

  // Handle modifier key aliases
  if (keyLower === "mod" || keyLower === "meta" || keyLower === "cmd" || keyLower === "command") {
    return "meta";
  }
  if (keyLower === "ctrl" || keyLower === "control") {
    return "control";
  }
  if (keyLower === "alt" || keyLower === "option") {
    return "alt";
  }
  if (keyLower === "shift") {
    return "shift";
  }

  return keyLower;
}

/**
 * Check if a key event matches a key combo (e.g., mod+k)
 */
function matchesKeyCombo(event: KeyboardEvent, keys: string[]): boolean {
  const normalizedKeys = keys.map(normalizeKey);
  const pressedKey = event.key.toLowerCase();

  // Separate modifiers from regular keys
  const modifiers = normalizedKeys.filter((k) =>
    ["meta", "control", "alt", "shift"].includes(k)
  );
  const regularKeys = normalizedKeys.filter(
    (k) => !["meta", "control", "alt", "shift"].includes(k)
  );

  // Check modifiers
  const hasCorrectModifiers =
    modifiers.includes("meta") === event.metaKey &&
    modifiers.includes("control") === event.ctrlKey &&
    modifiers.includes("alt") === event.altKey &&
    modifiers.includes("shift") === event.shiftKey;

  // For "mod" key, accept either meta (Mac) or ctrl (Windows/Linux)
  const hasModKey = normalizedKeys.includes("meta");
  const modKeyPressed = event.metaKey || event.ctrlKey;

  // Check regular key
  const regularKeyMatches =
    regularKeys.length === 0 || regularKeys.includes(pressedKey);

  if (hasModKey) {
    // For mod key shortcuts, check if either meta or ctrl is pressed
    return modKeyPressed && regularKeyMatches && !event.altKey && !event.shiftKey;
  }

  return hasCorrectModifiers && regularKeyMatches;
}

/**
 * Hook for registering and handling keyboard shortcuts
 *
 * Supports:
 * - Key combos (mod+k, ctrl+shift+p)
 * - Key sequences (g then h, like GitHub)
 * - Automatic input field detection
 * - Enable/disable functionality
 *
 * @example
 * ```tsx
 * const { register, unregister, enable, disable, isEnabled } = useKeyboardShortcuts();
 *
 * useEffect(() => {
 *   register({
 *     id: 'go-home',
 *     keys: ['g', 'h'],
 *     isSequence: true,
 *     handler: () => router.push('/dashboard'),
 *   });
 *
 *   register({
 *     id: 'save',
 *     keys: ['mod', 's'],
 *     handler: (e) => {
 *       e.preventDefault();
 *       handleSave();
 *     },
 *   });
 *
 *   return () => {
 *     unregister('go-home');
 *     unregister('save');
 *   };
 * }, []);
 * ```
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const {
    enabled: initialEnabled = true,
    sequenceTimeout = 1000,
    preventDefault = true,
    stopPropagation = false,
  } = options;

  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const shortcutsRef = useRef<Map<string, ShortcutRegistration>>(new Map());
  const sequenceBufferRef = useRef<string[]>([]);
  const sequenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear sequence buffer after timeout
  const clearSequenceBuffer = useCallback(() => {
    sequenceBufferRef.current = [];
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
  }, []);

  // Reset sequence timeout
  const resetSequenceTimeout = useCallback(() => {
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
    }
    sequenceTimeoutRef.current = setTimeout(clearSequenceBuffer, sequenceTimeout);
  }, [clearSequenceBuffer, sequenceTimeout]);

  // Handle keydown events
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if in input field (unless shortcut explicitly allows it)
      const inInput = isInputFocused();

      // Get all registered shortcuts
      const shortcuts = Array.from(shortcutsRef.current.values());

      // Check for key combos first (non-sequence shortcuts)
      for (const shortcut of shortcuts) {
        if (shortcut.isSequence) continue;
        if (inInput && !shortcut.allowInInput) continue;

        if (matchesKeyCombo(event, shortcut.keys)) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          shortcut.handler(event);
          clearSequenceBuffer();
          return;
        }
      }

      // Handle key sequences
      const key = event.key.toLowerCase();

      // Skip modifier-only key presses for sequences
      if (["meta", "control", "alt", "shift"].includes(key)) {
        return;
      }

      // Skip if any modifier is pressed (sequences don't use modifiers)
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      // Add key to sequence buffer
      sequenceBufferRef.current.push(key);
      resetSequenceTimeout();

      // Check for matching sequences
      const currentSequence = sequenceBufferRef.current;

      for (const shortcut of shortcuts) {
        if (!shortcut.isSequence) continue;
        if (inInput && !shortcut.allowInInput) continue;

        const shortcutKeys = shortcut.keys.map((k) => k.toLowerCase());

        // Check if current sequence matches
        if (
          shortcutKeys.length === currentSequence.length &&
          shortcutKeys.every((k, i) => k === currentSequence[i])
        ) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          shortcut.handler(event);
          clearSequenceBuffer();
          return;
        }

        // Check if current sequence is a prefix of this shortcut
        const isPrefix =
          currentSequence.length < shortcutKeys.length &&
          currentSequence.every((k, i) => k === shortcutKeys[i]);

        if (isPrefix) {
          // Prevent default for prefix keys to avoid typing in inputs
          if (preventDefault) event.preventDefault();
        }
      }

      // Clear buffer if no shortcut starts with current sequence
      const hasMatchingPrefix = shortcuts.some((shortcut) => {
        if (!shortcut.isSequence) return false;
        const shortcutKeys = shortcut.keys.map((k) => k.toLowerCase());
        return currentSequence.every((k, i) => k === shortcutKeys[i]);
      });

      if (!hasMatchingPrefix) {
        clearSequenceBuffer();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearSequenceBuffer();
    };
  }, [isEnabled, preventDefault, stopPropagation, clearSequenceBuffer, resetSequenceTimeout]);

  // Register a shortcut
  const register = useCallback((shortcut: ShortcutRegistration) => {
    shortcutsRef.current.set(shortcut.id, shortcut);
  }, []);

  // Unregister a shortcut
  const unregister = useCallback((id: string) => {
    shortcutsRef.current.delete(id);
  }, []);

  // Enable shortcuts
  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  // Disable shortcuts
  const disable = useCallback(() => {
    setIsEnabled(false);
    clearSequenceBuffer();
  }, [clearSequenceBuffer]);

  // Get registered IDs - use a callback to avoid ref access during render
  const getRegisteredIds = useCallback(() => {
    return Array.from(shortcutsRef.current.keys());
  }, []);

  return {
    register,
    unregister,
    enable,
    disable,
    isEnabled,
    registeredIds: [], // Return empty array, use getRegisteredIds() when needed
    getRegisteredIds,
  };
}

/**
 * Hook to open keyboard shortcuts help modal with "?" key
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useKeyboardShortcutsHelp();
 *
 * return <KeyboardShortcutsModal open={open} onOpenChange={setOpen} />;
 * ```
 */
export function useKeyboardShortcutsHelp(): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger on "?" key when not in input
      if (event.key === "?" && !isInputFocused()) {
        event.preventDefault();
        setOpen(true);
      }

      // Close on Escape
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return [open, setOpen];
}

export type { ShortcutRegistration, UseKeyboardShortcutsOptions, UseKeyboardShortcutsReturn };
