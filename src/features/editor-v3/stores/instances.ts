import type { StateCreator } from "zustand"
import type { Instance, InstanceId } from "../types"
import { generateId } from "../id"

export interface InstancesSlice {
  instances: Map<InstanceId, Instance>
  addInstance: (parentId: InstanceId | null, position: number, component: string, tag?: string) => InstanceId
  duplicateInstance: (id: InstanceId) => InstanceId | null
  removeInstance: (id: InstanceId) => void
  moveInstance: (id: InstanceId, newParentId: InstanceId, position: number) => void
  setInstanceLabel: (id: InstanceId, label: string) => void
  addTextChild: (parentId: InstanceId, text: string) => void
  setTextChild: (parentId: InstanceId, index: number, text: string) => void
}

export const createInstancesSlice: StateCreator<InstancesSlice, [["zustand/immer", never]], [], InstancesSlice> = (set, get) => ({
  instances: new Map(),

  addInstance: (parentId, position, component, tag) => {
    const id = generateId()
    set((s) => {
      s.instances.set(id, { id, component, tag, children: [] })
      if (parentId) {
        const parent = s.instances.get(parentId)
        if (parent) parent.children.splice(position, 0, { type: "id", value: id })
      }
    })
    return id
  },

  duplicateInstance: (id) => {
    const state = get()
    const inst = state.instances.get(id)
    if (!inst) return null
    // Find parent
    let parentId: InstanceId | null = null
    let position = 0
    for (const [pid, parent] of state.instances) {
      const idx = parent.children.findIndex((c) => c.type === "id" && c.value === id)
      if (idx !== -1) { parentId = pid; position = idx + 1; break }
    }
    if (!parentId) return null

    // Deep clone instances only (props/styles handled by caller if needed)
    const cloneTree = (srcId: InstanceId): InstanceId => {
      const src = state.instances.get(srcId)
      if (!src) return srcId
      const newId = generateId()
      const children = src.children.map((c) => {
        if (c.type === "id") return { type: "id" as const, value: cloneTree(c.value) }
        return { ...c }
      })
      set((s) => { s.instances.set(newId, { ...src, id: newId, children }) })
      return newId
    }
    const newRootId = cloneTree(id)

    // Insert into parent
    set((s) => {
      const parent = s.instances.get(parentId)
      if (parent) parent.children.splice(position, 0, { type: "id", value: newRootId })
    })
    return newRootId
  },

  removeInstance: (id) => {
    set((s) => {
      // Collect all descendant IDs
      const toRemove: InstanceId[] = []
      const collect = (instanceId: InstanceId) => {
        toRemove.push(instanceId)
        const inst = s.instances.get(instanceId)
        if (!inst) return
        for (const child of inst.children) {
          if (child.type === "id") collect(child.value)
        }
      }
      collect(id)

      // Remove from parent's children
      for (const [, inst] of s.instances) {
        inst.children = inst.children.filter((c) => !(c.type === "id" && c.value === id))
      }

      // Delete all collected instances
      for (const rid of toRemove) s.instances.delete(rid)
    })
  },

  moveInstance: (id, newParentId, position) => {
    set((s) => {
      // Remove from current parent
      for (const [, inst] of s.instances) {
        const idx = inst.children.findIndex((c) => c.type === "id" && c.value === id)
        if (idx !== -1) { inst.children.splice(idx, 1); break }
      }
      // Insert into new parent
      const newParent = s.instances.get(newParentId)
      if (newParent) newParent.children.splice(position, 0, { type: "id", value: id })
    })
  },

  setInstanceLabel: (id, label) => {
    set((s) => {
      const inst = s.instances.get(id)
      if (inst) inst.label = label
    })
  },

  addTextChild: (parentId, text) => {
    set((s) => {
      const parent = s.instances.get(parentId)
      if (parent) parent.children.push({ type: "text", value: text })
    })
  },

  setTextChild: (parentId, index, text) => {
    set((s) => {
      const parent = s.instances.get(parentId)
      if (parent && parent.children[index]?.type === "text") {
        parent.children[index] = { type: "text", value: text }
      }
    })
  },
})
