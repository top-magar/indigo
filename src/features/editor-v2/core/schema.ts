/**
 * Block Schema System — Single source of truth for every block.
 * Uses TypeScript generics so prop types are inferred at compile time.
 * The inspector, block panel, Quick Edit, presets, and future AI
 * all derive from this schema — zero hand-written settings code.
 */

import type { ComponentType } from "react"

// ─── Field Definitions ───────────────────────────────────────

export interface TextFieldDef {
  readonly type: "text"
  readonly label: string
  readonly default: string
  readonly group?: string
  readonly content?: boolean
  readonly placeholder?: string
  readonly multiline?: boolean
}

export interface NumberFieldDef {
  readonly type: "number"
  readonly label: string
  readonly default: number
  readonly group?: string
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly unit?: string
}

export interface SpacingFieldDef {
  readonly type: "spacing"
  readonly label: string
  readonly default: number
  readonly group?: string
  readonly min?: number
  readonly max?: number
}

export interface ColorFieldDef {
  readonly type: "color"
  readonly label: string
  readonly default: string
  readonly group?: string
  readonly gradient?: boolean
}

export interface EnumFieldDef<T extends string = string> {
  readonly type: "enum"
  readonly label: string
  readonly default: T
  readonly options: readonly { readonly value: T; readonly label: string }[]
  readonly group?: string
}

export interface BooleanFieldDef {
  readonly type: "boolean"
  readonly label: string
  readonly default: boolean
  readonly group?: string
}

export interface ImageFieldDef {
  readonly type: "image"
  readonly label: string
  readonly default: string
  readonly group?: string
  readonly content?: boolean
}

export type FieldDef =
  | TextFieldDef
  | NumberFieldDef
  | SpacingFieldDef
  | ColorFieldDef
  | EnumFieldDef
  | BooleanFieldDef
  | ImageFieldDef

/** Map from field name to field definition */
export type FieldMap = Readonly<Record<string, FieldDef>>

// ─── Type Inference ──────────────────────────────────────────

/** Infer the runtime prop type from a FieldDef */
type InferFieldType<F extends FieldDef> =
  F extends TextFieldDef ? string :
  F extends NumberFieldDef ? number :
  F extends SpacingFieldDef ? number :
  F extends ColorFieldDef ? string :
  F extends EnumFieldDef<infer T> ? T :
  F extends BooleanFieldDef ? boolean :
  F extends ImageFieldDef ? string :
  never

/** Infer the full props type from a FieldMap */
export type InferProps<M extends FieldMap> = {
  [K in keyof M]: InferFieldType<M[K]>
}

// ─── Block Schema ────────────────────────────────────────────

export interface BlockPreset<M extends FieldMap> {
  readonly label: string
  readonly props: Partial<InferProps<M>>
}

export interface BlockSchema<M extends FieldMap = FieldMap> {
  readonly name: string
  readonly category: string
  readonly icon: string
  readonly description?: string
  readonly fields: M
  readonly presets?: readonly BlockPreset<M>[]
  readonly render: ComponentType<InferProps<M>>
  /** Whether this block can contain children */
  readonly isContainer?: boolean
}

// ─── defineBlock ─────────────────────────────────────────────

/** Define a block with full type inference. This is the only API block authors use. */
export function defineBlock<M extends FieldMap>(schema: BlockSchema<M>): BlockSchema<M> {
  return schema
}

/** Extract default props from a schema's field definitions */
export function getDefaults<M extends FieldMap>(fields: M): InferProps<M> {
  const defaults: Record<string, unknown> = {}
  for (const [key, field] of Object.entries(fields)) {
    defaults[key] = field.default
  }
  return defaults as InferProps<M>
}

/** Get fields marked as content (for Quick Edit tab) */
export function getContentFields<M extends FieldMap>(fields: M): Array<[string, FieldDef]> {
  return Object.entries(fields).filter(([, f]) => "content" in f && f.content)
}

/** Get fields grouped by their group property */
export function getFieldsByGroup<M extends FieldMap>(fields: M): Map<string, Array<[string, FieldDef]>> {
  const groups = new Map<string, Array<[string, FieldDef]>>()
  for (const [key, field] of Object.entries(fields)) {
    const group = field.group ?? "General"
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push([key, field])
  }
  return groups
}
