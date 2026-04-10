import type { ComponentType } from "react"
import type { LucideIcon } from "lucide-react"

export interface FieldDef {
  name: string
  label: string
  type: "text" | "textarea" | "number" | "color" | "select" | "toggle" | "image"
  options?: { value: string; label: string }[]
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
