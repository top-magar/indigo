import type { ComponentType } from "react";

/**
 * Represents a single command item in the command palette
 */
export interface CommandItem {
  /** Unique identifier for the command */
  id: string;
  /** Display label for the command */
  label: string;
  /** Optional description shown below the label */
  description?: string;
  /** Optional icon component to display */
  icon?: ComponentType<{ className?: string }>;
  /** Keyboard shortcut keys, e.g., ["⌘", "N"] */
  shortcut?: string[];
  /** Additional keywords for search matching */
  keywords?: string[];
  /** Action to execute when command is selected */
  action: () => void;
  /** Group this command belongs to, e.g., "Navigation", "Actions", "Recent" */
  group?: string;
  /** Whether the command is currently disabled */
  disabled?: boolean;
}

/**
 * Represents a group of commands in the palette
 */
export interface CommandGroup {
  /** Unique identifier for the group */
  id: string;
  /** Display label for the group */
  label: string;
  /** Priority for sorting groups (lower = higher priority) */
  priority?: number;
}

/**
 * Configuration options for the command palette
 */
export interface CommandPaletteConfig {
  /** Maximum number of recent commands to track */
  maxRecentCommands?: number;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether to show recent commands section */
  showRecent?: boolean;
}

/**
 * State shape for the command palette store
 */
export interface CommandPaletteState {
  /** Whether the command palette is open */
  isOpen: boolean;
  /** Current search query */
  search: string;
  /** Registered commands */
  commands: CommandItem[];
  /** Registered command groups */
  groups: CommandGroup[];
  /** Recently executed command IDs */
  recentCommandIds: string[];
  /** Configuration options */
  config: CommandPaletteConfig;
}

/**
 * Actions available on the command palette store
 */
export interface CommandPaletteActions {
  /** Open the command palette */
  open: () => void;
  /** Close the command palette */
  close: () => void;
  /** Toggle the command palette open/closed */
  toggle: () => void;
  /** Set the open state directly */
  setOpen: (open: boolean) => void;
  /** Set the search query */
  setSearch: (search: string) => void;
  /** Register a new command */
  registerCommand: (command: CommandItem) => void;
  /** Register multiple commands at once */
  registerCommands: (commands: CommandItem[]) => void;
  /** Unregister a command by ID */
  unregisterCommand: (id: string) => void;
  /** Unregister multiple commands by IDs */
  unregisterCommands: (ids: string[]) => void;
  /** Register a command group */
  registerGroup: (group: CommandGroup) => void;
  /** Unregister a command group by ID */
  unregisterGroup: (id: string) => void;
  /** Execute a command by ID */
  executeCommand: (id: string) => void;
  /** Clear all registered commands */
  clearCommands: () => void;
  /** Clear recent commands history */
  clearRecent: () => void;
  /** Update configuration */
  setConfig: (config: Partial<CommandPaletteConfig>) => void;
}

/**
 * Complete command palette store type
 */
export type CommandPaletteStore = CommandPaletteState & CommandPaletteActions;

/**
 * Return type for the useCommandPalette hook
 */
export interface UseCommandPaletteReturn {
  /** Whether the command palette is open */
  isOpen: boolean;
  /** Set the open state */
  setOpen: (open: boolean) => void;
  /** Open the command palette */
  open: () => void;
  /** Close the command palette */
  close: () => void;
  /** Toggle the command palette */
  toggle: () => void;
  /** Current search query */
  search: string;
  /** Set the search query */
  setSearch: (search: string) => void;
  /** All registered commands */
  commands: CommandItem[];
  /** Filtered commands based on search query */
  filteredCommands: CommandItem[];
  /** Commands grouped by their group property */
  groupedCommands: Map<string, CommandItem[]>;
  /** Registered command groups (sorted by priority) */
  groups: CommandGroup[];
  /** Recent commands */
  recentCommands: CommandItem[];
  /** Execute a command */
  executeCommand: (id: string) => void;
  /** Register a command */
  registerCommand: (command: CommandItem) => void;
  /** Register multiple commands */
  registerCommands: (commands: CommandItem[]) => void;
  /** Unregister a command */
  unregisterCommand: (id: string) => void;
  /** Unregister multiple commands */
  unregisterCommands: (ids: string[]) => void;
  /** Register a command group */
  registerGroup: (group: CommandGroup) => void;
  /** Unregister a command group */
  unregisterGroup: (id: string) => void;
  /** Clear recent commands */
  clearRecent: () => void;
}
