// Editor Components — Public API
// Only exports components that are actually imported outside editor/components/

// Layout
export { EditorHeader } from "./editor-header"
export { LayersPanel } from "./layers-panel"
export { SettingsPanel } from "./settings-panel"

// Preview
export { InlinePreview } from "./inline-preview"
export type { InlinePreviewProps } from "./inline-preview"
export { InlinePreviewErrorBoundary } from "./inline-preview-error-boundary"
export { LivePreview } from "./live-preview"
export { FocusPreview } from "./focus-preview"

// Panels
export { GlobalStylesPanel } from "./global-styles-panel"
export { GlobalStylesInjector } from "./global-styles-injector"
export { SEOPanel, type PanelPageSEO } from "./seo-panel"
export { CommandPalette } from "./command-palette"

// Types (used by hooks)
export type { ResizeDirection, ResizeConstraints } from "./resize-handles"
