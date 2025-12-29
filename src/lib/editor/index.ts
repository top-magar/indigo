// Editor Module - Public exports

export * from "./types"
export * from "./store"
export * from "./communication"
export * from "./block-constants"
export { useEditorPreview } from "./hooks/use-editor-preview"
export { usePreviewMode } from "./hooks/use-preview-mode"
export { 
  useInlineEdit,
  getBlockEditableFields,
  getNextBlockFirstField,
  getPrevBlockLastField,
  type InlineEditState,
  type UseInlineEditReturn,
} from "./hooks/use-inline-edit"
export { useAutosave, type UseAutosaveOptions, type UseAutosaveReturn } from "./hooks/use-autosave"
export { AutosaveService, createAutosaveService, type AutosaveConfig, type AutosaveState } from "./autosave"
export { useBlockClipboard, type UseBlockClipboardReturn } from "./hooks/use-block-clipboard"
export { 
  createClipboardManager, 
  getClipboardManager, 
  serializeBlock,
  type ClipboardManager, 
  type ClipboardBlock 
} from "./clipboard"

// Block Presets
export {
  BUILT_IN_PRESETS,
  getAllPresets,
  getPresetsByCategory,
  getCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  instantiatePreset,
  type BlockPreset,
} from "./presets"
