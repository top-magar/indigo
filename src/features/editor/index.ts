/**
 * Editor Feature
 * 
 * Visual storefront editor functionality including layout engine,
 * blocks, animations, and templates.
 */

// Core editor exports
export * from "./types"
export * from "./store"
export * from "./communication"
export * from "./block-constants"
export * from "./presets"
export * from "./guides"

// Autosave - explicit exports to avoid conflict with types.ts AutosaveStatus
export {
  AutosaveService,
  createAutosaveService,
  type AutosaveConfig,
  type AutosaveState,
  type AutosaveCallbacks,
} from "./autosave"

// Clipboard
export * from "./clipboard"

// Hooks
export * from "./hooks"

// Fields (Auto-Field System)
export * from "./fields"

// Layout System
export * from "./layout"

// Global Styles - explicit exports to avoid conflict with store.ts selectIsDirty
export {
  useGlobalStylesStore,
  selectGlobalStyles,
  selectActivePreset,
  selectTypography,
  selectColors,
  // Rename selectIsDirty to avoid conflict
  selectIsDirty as selectGlobalStylesIsDirty,
} from "./global-styles/store"
export * from "./global-styles/types"
export * from "./global-styles/presets"
export { generateCSSVariables } from "./global-styles/css-generator"

// Animations
export * from "./animations"

// SEO
export * from "./seo"

// AI (disabled by default)
export * from "./ai/types"

// Templates
export * from "./templates/types"
export {
  getBlockTemplates,
  getSectionTemplates,
  saveBlockTemplate,
  deleteBlockTemplate,
  filterTemplates,
  incrementUsageCount,
  searchTemplates,
  type TemplateFilters,
  type BlockTemplateMetadata,
  type BlockConfig,
} from "./templates/template-service"

// Block Presets (from presets-dir to avoid conflict with presets.ts)
export {
  BLOCK_PRESETS,
  getAllPresets as getAllBlockPresets,
  getPresetsByCategory as getBlockPresetsByCategory,
  getPresetById,
  applyPreset,
  PRESET_CATEGORIES,
  type PresetBlockConfig,
  type BlockPreset as BlockPresetConfig,
  type PresetCategory,
} from "./presets-dir/block-presets"
