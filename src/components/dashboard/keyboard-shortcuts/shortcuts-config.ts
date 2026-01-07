import {
  Home01Icon,
  ShoppingCart01Icon,
  Package01Icon,
  UserMultipleIcon,
  Settings01Icon,
  Add01Icon,
  Delete01Icon,
  PencilEdit01Icon,
  Search01Icon,
  Cancel01Icon,
  AnalyticsUpIcon,
  Layers01Icon,
  ArrowRight01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import type { KeyboardShortcutsConfig, ShortcutCategory } from "./types";

/**
 * Navigation shortcuts - Use "g" prefix for "go to" actions
 */
export const navigationShortcuts: ShortcutCategory = {
  id: "navigation",
  label: "Navigation",
  icon: ArrowRight01Icon,
  priority: 1,
  shortcuts: [
    {
      id: "nav-home",
      label: "Go to Home",
      keys: ["g", "h"],
      isSequence: true,
      icon: Home01Icon,
    },
    {
      id: "nav-orders",
      label: "Go to Orders",
      keys: ["g", "o"],
      isSequence: true,
      icon: ShoppingCart01Icon,
    },
    {
      id: "nav-products",
      label: "Go to Products",
      keys: ["g", "p"],
      isSequence: true,
      icon: Package01Icon,
    },
    {
      id: "nav-customers",
      label: "Go to Customers",
      keys: ["g", "c"],
      isSequence: true,
      icon: UserMultipleIcon,
    },
    {
      id: "nav-analytics",
      label: "Go to Analytics",
      keys: ["g", "a"],
      isSequence: true,
      icon: AnalyticsUpIcon,
    },
    {
      id: "nav-inventory",
      label: "Go to Inventory",
      keys: ["g", "i"],
      isSequence: true,
      icon: Layers01Icon,
    },
    {
      id: "nav-settings",
      label: "Go to Settings",
      keys: ["g", "s"],
      isSequence: true,
      icon: Settings01Icon,
    },
  ],
};

/**
 * Action shortcuts - Common CRUD operations
 */
export const actionShortcuts: ShortcutCategory = {
  id: "actions",
  label: "Actions",
  icon: Add01Icon,
  priority: 2,
  shortcuts: [
    {
      id: "action-new",
      label: "New item",
      keys: ["n"],
      description: "Create a new item in the current view",
      icon: Add01Icon,
    },
    {
      id: "action-edit",
      label: "Edit selected",
      keys: ["e"],
      description: "Edit the selected item",
      icon: PencilEdit01Icon,
    },
    {
      id: "action-delete",
      label: "Delete selected",
      keys: ["d"],
      description: "Delete the selected item(s)",
      icon: Delete01Icon,
    },
    {
      id: "action-duplicate",
      label: "Duplicate",
      keys: ["mod", "d"],
      description: "Duplicate the selected item",
      icon: Add01Icon,
    },
    {
      id: "action-save",
      label: "Save changes",
      keys: ["mod", "s"],
      description: "Save current changes",
    },
  ],
};

/**
 * View shortcuts - Tab and view switching
 */
export const viewShortcuts: ShortcutCategory = {
  id: "views",
  label: "Views",
  icon: ViewIcon,
  priority: 3,
  shortcuts: [
    {
      id: "view-tab-1",
      label: "Switch to tab 1",
      keys: ["1"],
      description: "First tab or view",
    },
    {
      id: "view-tab-2",
      label: "Switch to tab 2",
      keys: ["2"],
      description: "Second tab or view",
    },
    {
      id: "view-tab-3",
      label: "Switch to tab 3",
      keys: ["3"],
      description: "Third tab or view",
    },
    {
      id: "view-tab-4",
      label: "Switch to tab 4",
      keys: ["4"],
      description: "Fourth tab or view",
    },
    {
      id: "view-tab-5",
      label: "Switch to tab 5",
      keys: ["5"],
      description: "Fifth tab or view",
    },
  ],
};

/**
 * Search shortcuts
 */
export const searchShortcuts: ShortcutCategory = {
  id: "search",
  label: "Search",
  icon: Search01Icon,
  priority: 4,
  shortcuts: [
    {
      id: "search-focus",
      label: "Focus search",
      keys: ["/"],
      description: "Jump to search input",
      icon: Search01Icon,
    },
    {
      id: "search-command",
      label: "Command palette",
      keys: ["mod", "k"],
      description: "Open command palette",
    },
    {
      id: "search-close",
      label: "Close / Cancel",
      keys: ["Escape"],
      description: "Close modal or cancel action",
      icon: Cancel01Icon,
    },
  ],
};

/**
 * Default keyboard shortcuts configuration for the dashboard
 */
export const defaultShortcutsConfig: KeyboardShortcutsConfig = {
  categories: [
    navigationShortcuts,
    actionShortcuts,
    viewShortcuts,
    searchShortcuts,
  ],
  enabled: true,
  sequenceTimeout: 1000,
};

/**
 * Get all shortcuts as a flat array
 */
export function getAllShortcuts(config: KeyboardShortcutsConfig = defaultShortcutsConfig) {
  return config.categories.flatMap((category) => category.shortcuts);
}

/**
 * Find a shortcut by ID
 */
export function findShortcutById(
  id: string,
  config: KeyboardShortcutsConfig = defaultShortcutsConfig
) {
  for (const category of config.categories) {
    const shortcut = category.shortcuts.find((s) => s.id === id);
    if (shortcut) return shortcut;
  }
  return undefined;
}

/**
 * Get shortcuts by category ID
 */
export function getShortcutsByCategory(
  categoryId: string,
  config: KeyboardShortcutsConfig = defaultShortcutsConfig
) {
  const category = config.categories.find((c) => c.id === categoryId);
  return category?.shortcuts ?? [];
}
