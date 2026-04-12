// Side-effect: register all built-in components
import "./components/register-all"

// Store
export { useEditorV3Store } from "./stores/store"
export type { EditorV3Store } from "./stores/store"

// Indexes
export { buildParentIndex, buildPropsIndex, buildResolvedStyles, useParentIndex, usePropsIndex, useResolvedStyles } from "./stores/indexes"

// Registry
export { registerComponent, getComponent, getMeta, getAllMetas } from "./registry/registry"
export { canAcceptChild, validateTree } from "./registry/content-model"

// Renderer
export { Renderer } from "./renderer/renderer"

// ID
export { generateId } from "./id"

// Types
export type {
  Instance, InstanceChild, InstanceId,
  Prop, PropId,
  StyleValue, CssUnit, StyleSource, StyleSourceSelection, StyleDeclaration, StyleSourceId, StyleDeclKey,
  Breakpoint, BreakpointId,
  Page, PageId,
  Asset, AssetId,
  ComponentMeta, ContentModel, ContentCategory, PropSchema, PresetStyleDecl,
  ComponentRegistration, EditorSelection,
} from "./types"
