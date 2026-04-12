import type { ComponentType } from "react"
import type { LucideIcon } from "lucide-react"

export interface FieldDef {
  name: string
  label: string
  type: "text" | "textarea" | "number" | "color" | "select" | "toggle" | "image" | "list" | "product" | "collection" | "richtext" | "link" | "icon" | "date" | "range"
  options?: { value: string; label: string }[]
  /** For "list" type: defines the fields per list item */
  listFields?: { key: string; label: string; type: "text" | "number" }[]
  /** For "range" type */
  min?: number
  max?: number
  /** Help text shown below the field */
  description?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockComponent = ComponentType<any>

export interface BlockRegistration {
  component: BlockComponent
  fields: FieldDef[]
  defaultProps: Record<string, unknown>
  icon: LucideIcon
  category: string
}

const registry = new Map<string, BlockRegistration>()

/**
 * Register a block. Validates that every field has a corresponding defaultProp
 * to prevent silent drift between field definitions and defaults.
 */
export function registerBlock(name: string, reg: BlockRegistration): void {
  if (process.env.NODE_ENV === "development") {
    const fieldNames = new Set(reg.fields.map((f) => f.name))
    const propNames = new Set(Object.keys(reg.defaultProps))
    const missingDefaults = [...fieldNames].filter((n) => !propNames.has(n))
    if (missingDefaults.length > 0) {
      console.warn(`[editor-v2] Block "${name}" has fields without defaultProps: ${missingDefaults.join(", ")}`)
    }
  }
  registry.set(name, reg)
}

export function getBlock(name: string): BlockRegistration | undefined {
  return registry.get(name)
}

export function getAllBlocks(): Map<string, BlockRegistration> {
  return registry
}
