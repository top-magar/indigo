"use client";

import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CommandItem,
  CommandGroup,
  CommandPaletteState,
  CommandPaletteActions,
  CommandPaletteStore,
  CommandPaletteConfig,
  UseCommandPaletteReturn,
} from "@/components/dashboard/command-palette/types";

// Default configuration
const DEFAULT_CONFIG: CommandPaletteConfig = {
  maxRecentCommands: 5,
  placeholder: "Type a command or search...",
  showRecent: true,
};

// Default groups with priorities
const DEFAULT_GROUPS: CommandGroup[] = [
  { id: "recent", label: "Recent", priority: 0 },
  { id: "navigation", label: "Navigation", priority: 10 },
  { id: "actions", label: "Actions", priority: 20 },
  { id: "settings", label: "Settings", priority: 30 },
];

// Initial state
const initialState: CommandPaletteState = {
  isOpen: false,
  search: "",
  commands: [],
  groups: DEFAULT_GROUPS,
  recentCommandIds: [],
  config: DEFAULT_CONFIG,
};

/**
 * Zustand store for command palette state management
 * Persists recent commands to localStorage
 */
export const useCommandPaletteStore = create<CommandPaletteStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Open/close actions
      open: () => set({ isOpen: true, search: "" }),
      close: () => set({ isOpen: false, search: "" }),
      toggle: () => {
        const { isOpen } = get();
        set({ isOpen: !isOpen, search: "" });
      },
      setOpen: (open: boolean) => set({ isOpen: open, search: open ? "" : get().search }),

      // Search
      setSearch: (search: string) => set({ search }),

      // Command registration
      registerCommand: (command: CommandItem) => {
        const { commands } = get();
        // Avoid duplicates
        if (commands.some((c) => c.id === command.id)) {
          // Update existing command
          set({
            commands: commands.map((c) => (c.id === command.id ? command : c)),
          });
        } else {
          set({ commands: [...commands, command] });
        }
      },

      registerCommands: (newCommands: CommandItem[]) => {
        const { commands } = get();
        const existingIds = new Set(commands.map((c) => c.id));
        const commandsToAdd = newCommands.filter((c) => !existingIds.has(c.id));
        const commandsToUpdate = newCommands.filter((c) => existingIds.has(c.id));

        let updatedCommands = [...commands];

        // Update existing commands
        if (commandsToUpdate.length > 0) {
          updatedCommands = updatedCommands.map((c) => {
            const update = commandsToUpdate.find((u) => u.id === c.id);
            return update || c;
          });
        }

        // Add new commands
        set({ commands: [...updatedCommands, ...commandsToAdd] });
      },

      unregisterCommand: (id: string) => {
        const { commands, recentCommandIds } = get();
        set({
          commands: commands.filter((c) => c.id !== id),
          recentCommandIds: recentCommandIds.filter((rid) => rid !== id),
        });
      },

      unregisterCommands: (ids: string[]) => {
        const { commands, recentCommandIds } = get();
        const idSet = new Set(ids);
        set({
          commands: commands.filter((c) => !idSet.has(c.id)),
          recentCommandIds: recentCommandIds.filter((rid) => !idSet.has(rid)),
        });
      },

      // Group registration
      registerGroup: (group: CommandGroup) => {
        const { groups } = get();
        if (groups.some((g) => g.id === group.id)) {
          // Update existing group
          set({
            groups: groups.map((g) => (g.id === group.id ? group : g)),
          });
        } else {
          set({ groups: [...groups, group] });
        }
      },

      unregisterGroup: (id: string) => {
        const { groups } = get();
        set({ groups: groups.filter((g) => g.id !== id) });
      },

      // Execute command
      executeCommand: (id: string) => {
        const { commands, recentCommandIds, config } = get();
        const command = commands.find((c) => c.id === id);

        if (command && !command.disabled) {
          // Execute the action
          command.action();

          // Update recent commands
          const maxRecent = config.maxRecentCommands ?? 5;
          const newRecent = [id, ...recentCommandIds.filter((rid) => rid !== id)].slice(
            0,
            maxRecent
          );

          set({
            isOpen: false,
            search: "",
            recentCommandIds: newRecent,
          });
        }
      },

      // Clear actions
      clearCommands: () => set({ commands: [], recentCommandIds: [] }),
      clearRecent: () => set({ recentCommandIds: [] }),

      // Config
      setConfig: (config: Partial<CommandPaletteConfig>) => {
        const { config: currentConfig } = get();
        set({ config: { ...currentConfig, ...config } });
      },
    }),
    {
      name: "command-palette-storage",
      // Only persist recent commands
      partialize: (state) => ({
        recentCommandIds: state.recentCommandIds,
      }),
    }
  )
);

/**
 * Filter commands based on search query
 * Matches against label, description, and keywords
 */
function filterCommands(commands: CommandItem[], search: string): CommandItem[] {
  if (!search.trim()) {
    return commands;
  }

  const query = search.toLowerCase().trim();
  const queryWords = query.split(/\s+/);

  return commands.filter((command) => {
    const searchableText = [
      command.label,
      command.description,
      ...(command.keywords || []),
      command.group,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // All query words must match somewhere in the searchable text
    return queryWords.every((word) => searchableText.includes(word));
  });
}

/**
 * Group commands by their group property
 */
function groupCommands(
  commands: CommandItem[],
  groups: CommandGroup[]
): Map<string, CommandItem[]> {
  const grouped = new Map<string, CommandItem[]>();

  // Sort groups by priority
  const sortedGroups = [...groups].sort(
    (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
  );

  // Initialize groups in order
  for (const group of sortedGroups) {
    grouped.set(group.id, []);
  }

  // Add "Other" group for ungrouped commands
  grouped.set("other", []);

  // Distribute commands to groups
  for (const command of commands) {
    const groupId = command.group || "other";
    const groupCommands = grouped.get(groupId);
    if (groupCommands) {
      groupCommands.push(command);
    } else {
      // Group doesn't exist, add to "other"
      grouped.get("other")?.push(command);
    }
  }

  // Remove empty groups
  for (const [key, value] of grouped) {
    if (value.length === 0) {
      grouped.delete(key);
    }
  }

  return grouped;
}

/**
 * Hook for using the command palette
 * Handles keyboard shortcuts and provides filtered/grouped commands
 *
 * @example
 * ```tsx
 * const {
 *   isOpen,
 *   setOpen,
 *   commands,
 *   search,
 *   setSearch,
 *   executeCommand,
 *   filteredCommands,
 *   groupedCommands,
 * } = useCommandPalette();
 *
 * // Register commands on mount
 * useEffect(() => {
 *   registerCommands([
 *     {
 *       id: 'go-products',
 *       label: 'Go to Products',
 *       group: 'navigation',
 *       action: () => router.push('/dashboard/products'),
 *     },
 *   ]);
 * }, []);
 * ```
 */
export function useCommandPalette(): UseCommandPaletteReturn {
  // Get store state and actions
  const isOpen = useCommandPaletteStore((s) => s.isOpen);
  const search = useCommandPaletteStore((s) => s.search);
  const commands = useCommandPaletteStore((s) => s.commands);
  const groups = useCommandPaletteStore((s) => s.groups);
  const recentCommandIds = useCommandPaletteStore((s) => s.recentCommandIds);

  const open = useCommandPaletteStore((s) => s.open);
  const close = useCommandPaletteStore((s) => s.close);
  const toggle = useCommandPaletteStore((s) => s.toggle);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);
  const setSearch = useCommandPaletteStore((s) => s.setSearch);
  const registerCommand = useCommandPaletteStore((s) => s.registerCommand);
  const registerCommands = useCommandPaletteStore((s) => s.registerCommands);
  const unregisterCommand = useCommandPaletteStore((s) => s.unregisterCommand);
  const unregisterCommands = useCommandPaletteStore((s) => s.unregisterCommands);
  const registerGroup = useCommandPaletteStore((s) => s.registerGroup);
  const unregisterGroup = useCommandPaletteStore((s) => s.unregisterGroup);
  const executeCommand = useCommandPaletteStore((s) => s.executeCommand);
  const clearRecent = useCommandPaletteStore((s) => s.clearRecent);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }

      // Escape to close
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle, close, isOpen]);

  // Filtered commands based on search
  const filteredCommands = useMemo(
    () => filterCommands(commands, search),
    [commands, search]
  );

  // Grouped commands
  const groupedCommands = useMemo(
    () => groupCommands(filteredCommands, groups),
    [filteredCommands, groups]
  );

  // Sorted groups
  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100)),
    [groups]
  );

  // Recent commands
  const recentCommands = useMemo(() => {
    if (!search) {
      return recentCommandIds
        .map((id) => commands.find((c) => c.id === id))
        .filter((c): c is CommandItem => c !== undefined);
    }
    return [];
  }, [recentCommandIds, commands, search]);

  return {
    isOpen,
    setOpen,
    open,
    close,
    toggle,
    search,
    setSearch,
    commands,
    filteredCommands,
    groupedCommands,
    groups: sortedGroups,
    recentCommands,
    executeCommand,
    registerCommand,
    registerCommands,
    unregisterCommand,
    unregisterCommands,
    registerGroup,
    unregisterGroup,
    clearRecent,
  };
}

/**
 * Hook for registering commands that automatically unregister on unmount
 * Useful for page-specific commands
 *
 * @example
 * ```tsx
 * // In a page component
 * useRegisterCommands([
 *   {
 *     id: 'create-product',
 *     label: 'Create Product',
 *     group: 'actions',
 *     action: () => setShowCreateDialog(true),
 *   },
 * ]);
 * ```
 */
export function useRegisterCommands(commands: CommandItem[]): void {
  const registerCommands = useCommandPaletteStore((s) => s.registerCommands);
  const unregisterCommands = useCommandPaletteStore((s) => s.unregisterCommands);

  useEffect(() => {
    if (commands.length > 0) {
      registerCommands(commands);

      return () => {
        unregisterCommands(commands.map((c) => c.id));
      };
    }
  }, [commands, registerCommands, unregisterCommands]);
}

/**
 * Hook for registering a single command that automatically unregisters on unmount
 *
 * @example
 * ```tsx
 * useRegisterCommand({
 *   id: 'toggle-sidebar',
 *   label: 'Toggle Sidebar',
 *   shortcut: ['⌘', 'B'],
 *   action: () => setSidebarOpen((prev) => !prev),
 * });
 * ```
 */
export function useRegisterCommand(command: CommandItem): void {
  const registerCommand = useCommandPaletteStore((s) => s.registerCommand);
  const unregisterCommand = useCommandPaletteStore((s) => s.unregisterCommand);

  useEffect(() => {
    registerCommand(command);

    return () => {
      unregisterCommand(command.id);
    };
  }, [command, registerCommand, unregisterCommand]);
}

export type { UseCommandPaletteReturn };
