/**
 * Shared Autosave Module
 * 
 * Consolidated autosave functionality used by the Visual Editor and other components.
 * Provides both class-based service and React hook implementations.
 */

// Types
export type {
  AutosaveStatus,
  AutosaveConfig,
  AutosaveState,
  AutosaveCallbacks,
} from "./types"

export { DEFAULT_AUTOSAVE_CONFIG } from "./types"

// Service (class-based)
export { AutosaveService, createAutosaveService } from "./autosave-service"

// Hook (React)
export { useAutosave, formatSaveStatus } from "./use-autosave"
export type { UseAutosaveOptions, UseAutosaveReturn } from "./use-autosave"
