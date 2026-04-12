import type { StateCreator } from "zustand"
import type { Prop, PropId, InstanceId } from "../types"
import { generateId } from "../id"

export interface PropsSlice {
  props: Map<PropId, Prop>
  setProp: (instanceId: InstanceId, name: string, type: Prop["type"], value: Prop["value"]) => PropId
  deleteProp: (id: PropId) => void
  deleteInstanceProps: (instanceId: InstanceId) => void
}

export const createPropsSlice: StateCreator<PropsSlice, [["zustand/immer", never]], [], PropsSlice> = (set) => ({
  props: new Map(),

  setProp: (instanceId, name, type, value) => {
    let propId = ""
    set((s) => {
      // Upsert: find existing prop with same instanceId + name
      for (const [id, prop] of s.props) {
        if (prop.instanceId === instanceId && prop.name === name) {
          // Update in place — cast needed because discriminated union
          ;(s.props.get(id) as Prop).type = type as never
          ;(s.props.get(id) as Prop).value = value as never
          propId = id
          return
        }
      }
      // Insert new
      propId = generateId()
      s.props.set(propId, { id: propId, instanceId, name, type, value } as Prop)
    })
    return propId
  },

  deleteProp: (id) => {
    set((s) => { s.props.delete(id) })
  },

  deleteInstanceProps: (instanceId) => {
    set((s) => {
      for (const [id, prop] of s.props) {
        if (prop.instanceId === instanceId) s.props.delete(id)
      }
    })
  },
})
