import type { StateCreator } from "zustand"
import type { StyleSource, StyleSourceSelection, StyleDeclaration, StyleValue, StyleSourceId, InstanceId, BreakpointId, StyleDeclKey } from "../types"
import { getStyleDeclKey } from "../types"
import { generateId } from "../id"

export interface StylesSlice {
  styleSources: Map<StyleSourceId, StyleSource>
  styleSourceSelections: Map<InstanceId, StyleSourceSelection>
  styleDeclarations: Map<StyleDeclKey, StyleDeclaration>

  createLocalStyleSource: (instanceId: InstanceId) => StyleSourceId
  createTokenStyleSource: (name: string) => StyleSourceId
  applyStyleSource: (instanceId: InstanceId, styleSourceId: StyleSourceId) => void
  setStyleDeclaration: (styleSourceId: StyleSourceId, breakpointId: BreakpointId, property: string, value: StyleValue, state?: string) => void
  deleteStyleDeclaration: (styleSourceId: StyleSourceId, breakpointId: BreakpointId, property: string, state?: string) => void
  deleteInstanceStyles: (instanceId: InstanceId) => void
}

export const createStylesSlice: StateCreator<StylesSlice, [["zustand/immer", never]], [], StylesSlice> = (set) => ({
  styleSources: new Map(),
  styleSourceSelections: new Map(),
  styleDeclarations: new Map(),

  createLocalStyleSource: (instanceId) => {
    const id = generateId()
    set((s) => {
      s.styleSources.set(id, { id, type: "local" })
      const existing = s.styleSourceSelections.get(instanceId)
      if (existing) {
        existing.values.push(id)
      } else {
        s.styleSourceSelections.set(instanceId, { instanceId, values: [id] })
      }
    })
    return id
  },

  createTokenStyleSource: (name) => {
    const id = generateId()
    set((s) => { s.styleSources.set(id, { id, type: "token", name }) })
    return id
  },

  applyStyleSource: (instanceId, styleSourceId) => {
    set((s) => {
      const existing = s.styleSourceSelections.get(instanceId)
      if (existing) {
        if (!existing.values.includes(styleSourceId)) existing.values.push(styleSourceId)
      } else {
        s.styleSourceSelections.set(instanceId, { instanceId, values: [styleSourceId] })
      }
    })
  },

  setStyleDeclaration: (styleSourceId, breakpointId, property, value, state) => {
    set((s) => {
      const decl: StyleDeclaration = { styleSourceId, breakpointId, property, value, state }
      s.styleDeclarations.set(getStyleDeclKey(decl), decl)
    })
  },

  deleteStyleDeclaration: (styleSourceId, breakpointId, property, state) => {
    set((s) => {
      const key = getStyleDeclKey({ styleSourceId, breakpointId, property, state })
      s.styleDeclarations.delete(key)
    })
  },

  deleteInstanceStyles: (instanceId) => {
    set((s) => {
      const selection = s.styleSourceSelections.get(instanceId)
      if (!selection) return
      // Delete local style sources and their declarations
      for (const ssId of selection.values) {
        const source = s.styleSources.get(ssId)
        if (source?.type === "local") {
          // Remove all declarations for this source
          for (const [key, decl] of s.styleDeclarations) {
            if (decl.styleSourceId === ssId) s.styleDeclarations.delete(key)
          }
          s.styleSources.delete(ssId)
        }
      }
      s.styleSourceSelections.delete(instanceId)
    })
  },
})
