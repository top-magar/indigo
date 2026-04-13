import type { StateCreator } from "zustand"
import type { Breakpoint, BreakpointId } from "../types"
import { generateId } from "../id"

export interface BreakpointsSlice {
  breakpoints: Map<BreakpointId, Breakpoint>
  addBreakpoint: (label: string, minWidth?: number) => BreakpointId
  removeBreakpoint: (id: BreakpointId) => void
}

const createDefaults = (): Map<BreakpointId, Breakpoint> => {
  const base: Breakpoint = { id: "bp-base", label: "Desktop", minWidth: undefined }
  const large: Breakpoint = { id: "bp-large", label: "Large", minWidth: 1440 }
  const laptop: Breakpoint = { id: "bp-laptop", label: "Laptop", minWidth: 1280 }
  const tablet: Breakpoint = { id: "bp-tablet", label: "Tablet", minWidth: 768 }
  const mobileLand: Breakpoint = { id: "bp-mobile-land", label: "Mobile L", minWidth: 480 }
  const mobile: Breakpoint = { id: "bp-mobile", label: "Mobile", minWidth: 0 }
  return new Map([
    ["bp-base", base], ["bp-large", large], ["bp-laptop", laptop],
    ["bp-tablet", tablet], ["bp-mobile-land", mobileLand], ["bp-mobile", mobile],
  ])
}

export const createBreakpointsSlice: StateCreator<BreakpointsSlice, [["zustand/immer", never]], [], BreakpointsSlice> = (set) => ({
  breakpoints: createDefaults(),

  addBreakpoint: (label, minWidth) => {
    const id = generateId()
    set((s) => { s.breakpoints.set(id, { id, label, minWidth }) })
    return id
  },

  removeBreakpoint: (id) => {
    set((s) => { s.breakpoints.delete(id) })
  },
})
