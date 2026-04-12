import type { ComponentType, ReactNode } from "react"
import type { ComponentMeta } from "../types"

type AnyComponent = ComponentType<Record<string, unknown>> | ComponentType<Record<string, unknown> & { children?: ReactNode }>

const components = new Map<string, AnyComponent>()
const metas = new Map<string, ComponentMeta>()

export function registerComponent(name: string, component: AnyComponent, meta: ComponentMeta): void {
  if (components.has(name)) {
    throw new Error(`[editor-v3] Component "${name}" already registered`)
  }
  components.set(name, component)
  metas.set(name, meta)
}

export function getComponent(name: string): AnyComponent | undefined {
  return components.get(name)
}

export function getMeta(name: string): ComponentMeta | undefined {
  return metas.get(name)
}

export function getAllMetas(): Map<string, ComponentMeta> {
  return metas
}
