import type { Home01Icon } from "@hugeicons/core-free-icons";

/**
 * Icon type from Hugeicons
 */
export type HugeIcon = typeof Home01Icon;

/**
 * Represents a single keyboard shortcut
 */
export interface Shortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Display label describing the action */
  label: string;
  /** Keyboard keys to trigger the shortcut (e.g., ["g", "h"] for sequence, ["mod", "k"] for combo) */
  keys: string[];
  /** Optional description for additional context */
  description?: string;
  /** Optional icon component */
  icon?: HugeIcon;
  /** Whether this is a key sequence (g then h) vs combo (mod+k) */
  isSequence?: boolean;
  /** Whether the shortcut is currently enabled */
  enabled?: boolean;
}

/**
 * Represents a category of shortcuts
 */
export interface ShortcutCategory {
  /** Unique identifier for the category */
  id: string;
  /** Display label for the category */
  label: string;
  /** Shortcuts in this category */
  shortcuts: Shortcut[];
  /** Priority for sorting categories (lower = higher priority) */
  priority?: number;
  /** Optional icon for the category */
  icon?: HugeIcon;
}

/**
 * Configuration for keyboard shortcuts
 */
export interface KeyboardShortcutsConfig {
  /** All shortcut categories */
  categories: ShortcutCategory[];
  /** Whether shortcuts are globally enabled */
  enabled?: boolean;
  /** Timeout for key sequences in milliseconds */
  sequenceTimeout?: number;
}

/**
 * Props for the KeyboardShortcutsModal component
 */
export interface KeyboardShortcutsModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Shortcut categories to display */
  categories: ShortcutCategory[];
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Options for the useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled */
  enabled?: boolean;
  /** Timeout for key sequences in milliseconds (default: 1000) */
  sequenceTimeout?: number;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Whether to stop event propagation */
  stopPropagation?: boolean;
}

/**
 * Handler function for a keyboard shortcut
 */
export type ShortcutHandler = (event: KeyboardEvent) => void;

/**
 * Shortcut registration for the hook
 */
export interface ShortcutRegistration {
  /** Unique identifier */
  id: string;
  /** Keys that trigger the shortcut */
  keys: string[];
  /** Handler function */
  handler: ShortcutHandler;
  /** Whether this is a key sequence */
  isSequence?: boolean;
  /** Whether to allow in input fields */
  allowInInput?: boolean;
}

/**
 * Return type for useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsReturn {
  /** Register a shortcut */
  register: (shortcut: ShortcutRegistration) => void;
  /** Unregister a shortcut by ID */
  unregister: (id: string) => void;
  /** Enable all shortcuts */
  enable: () => void;
  /** Disable all shortcuts */
  disable: () => void;
  /** Whether shortcuts are currently enabled */
  isEnabled: boolean;
  /** Currently registered shortcut IDs (empty array, use getRegisteredIds for current list) */
  registeredIds: string[];
  /** Get currently registered shortcut IDs */
  getRegisteredIds: () => string[];
}
