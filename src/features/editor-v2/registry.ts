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

export function registerBlock(name: string, reg: BlockRegistration): void {
  registry.set(name, reg)
}

export function getBlock(name: string): BlockRegistration | undefined {
  return registry.get(name)
}

export function getAllBlocks(): Map<string, BlockRegistration> {
  return registry
}
