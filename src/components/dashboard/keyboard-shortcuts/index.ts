// Components
export { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal";

// Types
export type {
  Shortcut,
  ShortcutCategory,
  KeyboardShortcutsConfig,
  KeyboardShortcutsModalProps,
  UseKeyboardShortcutsOptions,
  ShortcutHandler,
  ShortcutRegistration,
  UseKeyboardShortcutsReturn,
  HugeIcon,
} from "./types";

// Configuration
export {
  defaultShortcutsConfig,
  navigationShortcuts,
  actionShortcuts,
  viewShortcuts,
  searchShortcuts,
  getAllShortcuts,
  findShortcutById,
  getShortcutsByCategory,
} from "./shortcuts-config";
