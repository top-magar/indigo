// Editor Hooks - Centralized exports

export { useLayersPanel, type ViewDensity, type UseLayersPanelOptions, type UseLayersPanelReturn } from './use-layers-panel'

export {
  useResponsivePanel,
  type PanelState,
  type UseResponsivePanelOptions,
  type UseResponsivePanelReturn,
  EXPANDED_WIDTH,
  COLLAPSED_WIDTH,
  PRESET_WIDTHS,
  FLOATING_Z_INDEX_BASE,
} from './use-responsive-panel'

export {
  useKeyboardNavigation,
  type UseKeyboardNavigationOptions,
  type UseKeyboardNavigationReturn,
} from './use-keyboard-navigation'

export { useAutosave, type UseAutosaveOptions, type UseAutosaveReturn } from './use-autosave'

export { useBlockClipboard, type UseBlockClipboardReturn } from './use-block-clipboard'

export { useBlockResize, type UseBlockResizeOptions, type UseBlockResizeReturn } from './use-block-resize'

export { useEditorPreview } from './use-editor-preview'

export { useGlobalStylesSync } from './use-global-styles-sync'

export { useInlineEdit, type UseInlineEditReturn } from './use-inline-edit'

export { usePreviewMode } from './use-preview-mode'
