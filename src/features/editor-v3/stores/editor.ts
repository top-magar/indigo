import type { StateCreator } from "zustand"
import type { InstanceId, BreakpointId, PageId } from "../types"

export interface EditorSlice {
  selectedInstanceId: InstanceId | null
  hoveredInstanceId: InstanceId | null
  currentBreakpointId: BreakpointId
  currentPageId: PageId | null

  select: (id: InstanceId | null) => void
  hover: (id: InstanceId | null) => void
  setBreakpoint: (id: BreakpointId) => void
  setPage: (id: PageId) => void
}

export const createEditorSlice: StateCreator<EditorSlice, [["zustand/immer", never]], [], EditorSlice> = (set) => ({
  selectedInstanceId: null,
  hoveredInstanceId: null,
  currentBreakpointId: "bp-base",
  currentPageId: null,

  select: (id) => set({ selectedInstanceId: id }),
  hover: (id) => set({ hoveredInstanceId: id }),
  setBreakpoint: (id) => set({ currentBreakpointId: id }),
  setPage: (id) => set({ currentPageId: id }),
})
