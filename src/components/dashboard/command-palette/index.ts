// Command Palette UI Component
export {
  CommandPalette,
  CommandIcons,
  type CommandPaletteCommand,
  type CommandPaletteGroup,
  type CommandPaletteProps,
} from "./command-palette";

// Command Palette Provider and Hooks
export {
  CommandPaletteProvider,
  useCommandPalette,
  useRegisterCommands,
  type CommandPaletteProviderProps,
} from "./command-palette-provider";

// Types (for hook integration)
export type {
  CommandItem,
  CommandGroup,
  CommandPaletteConfig,
  CommandPaletteState,
  CommandPaletteActions,
  CommandPaletteStore,
  UseCommandPaletteReturn,
} from "./types";
