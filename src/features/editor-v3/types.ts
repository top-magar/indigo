import type { ComponentType, ReactNode } from "react"

// ── ID ─────────────────────────────────────────────────────────────────────────

export type InstanceId = string
export type PropId = string
export type StyleSourceId = string
export type BreakpointId = string
export type PageId = string
export type AssetId = string

// ── Site Config ────────────────────────────────────────────────────────────────

export interface SiteConfig {
  headerInstanceId: InstanceId | null
  footerInstanceId: InstanceId | null
}

// ── Instance Tree ──────────────────────────────────────────────────────────────

export type InstanceChild =
  | { type: "id"; value: InstanceId }
  | { type: "text"; value: string }
  | { type: "expression"; value: string }

export interface Instance {
  id: InstanceId
  component: string
  tag?: string
  label?: string
  children: InstanceChild[]
}

// ── Props ──────────────────────────────────────────────────────────────────────

export type Prop =
  | { id: PropId; instanceId: InstanceId; name: string; type: "string"; value: string }
  | { id: PropId; instanceId: InstanceId; name: string; type: "number"; value: number }
  | { id: PropId; instanceId: InstanceId; name: string; type: "boolean"; value: boolean }
  | { id: PropId; instanceId: InstanceId; name: string; type: "asset"; value: AssetId }
  | { id: PropId; instanceId: InstanceId; name: string; type: "page"; value: PageId }
  | { id: PropId; instanceId: InstanceId; name: string; type: "json"; value: unknown }

// ── Typed CSS Values ───────────────────────────────────────────────────────────

export type CssUnit = "px" | "rem" | "em" | "%" | "vw" | "vh" | "fr" | "ch" | "dvh" | "svh" | "lvh"

export type StyleValue =
  | { type: "unit"; value: number; unit: CssUnit }
  | { type: "keyword"; value: string }
  | { type: "rgb"; r: number; g: number; b: number; a: number }
  | { type: "unparsed"; value: string }
  | { type: "var"; value: string; fallback?: StyleValue }

// ── Styles (3-layer) ───────────────────────────────────────────────────────────

export interface StyleSource {
  id: StyleSourceId
  type: "local" | "token"
  name?: string
}

export interface StyleSourceSelection {
  instanceId: InstanceId
  values: StyleSourceId[]
}

export interface StyleDeclaration {
  styleSourceId: StyleSourceId
  breakpointId: BreakpointId
  state?: string
  property: string
  value: StyleValue
}

export type StyleDeclKey = string

export function getStyleDeclKey(d: Omit<StyleDeclaration, "value">): StyleDeclKey {
  return `${d.styleSourceId}:${d.breakpointId}:${d.property}:${d.state ?? ""}`
}

// ── Breakpoints ────────────────────────────────────────────────────────────────

export interface Breakpoint {
  id: BreakpointId
  label: string
  minWidth?: number
}

// ── Pages ──────────────────────────────────────────────────────────────────────

export interface Page {
  id: PageId
  name: string
  path: string
  rootInstanceId: InstanceId
  title?: string
  description?: string
  ogImage?: string
}

// ── Assets ─────────────────────────────────────────────────────────────────────

export interface Asset {
  id: AssetId
  name: string
  type: "image" | "font" | "other"
  src: string
  width?: number
  height?: number
}

// ── Component Meta ─────────────────────────────────────────────────────────────

export type ContentCategory = "container" | "content" | "form" | "form-field" | "slot" | "none"

export interface ContentModel {
  /** What category this component belongs to (determines what parents accept it) */
  category: ContentCategory
  /** What categories/component names this component accepts as children */
  children: ReadonlyArray<ContentCategory | string>
}

export interface PropSchema {
  name: string
  label: string
  type: "string" | "number" | "boolean" | "asset" | "page" | "json"
  defaultValue?: unknown
  options?: ReadonlyArray<{ value: string; label: string }>
  description?: string
  /** Render as textarea instead of single-line input */
  multiline?: boolean
}

export interface PresetStyleDecl {
  property: string
  value: StyleValue
  state?: string
}

export interface ComponentMeta {
  label: string
  category: string
  icon: string
  contentModel: ContentModel
  propsSchema: ReadonlyArray<PropSchema>
  presetStyle?: Record<string, PresetStyleDecl[]>
  tag?: string
}

// ── Registry ───────────────────────────────────────────────────────────────────

export interface ComponentRegistration {
  component: ComponentType<Record<string, unknown> & { children?: ReactNode }>
  meta: ComponentMeta
}

// ── Store ──────────────────────────────────────────────────────────────────────

export interface EditorSelection {
  selectedInstanceId: InstanceId | null
  hoveredInstanceId: InstanceId | null
  currentBreakpointId: BreakpointId
  currentPageId: PageId | null
}
