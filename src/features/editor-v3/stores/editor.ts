import type { StateCreator } from "zustand"
import type { InstanceId, BreakpointId, PageId } from "../types"
import { generateId } from "../id"

export interface UserComponent {
  id: string
  name: string
  rootInstanceId: InstanceId
  /** Snapshot of the subtree data at save time */
  snapshot: string
}

export interface EditorSlice {
  selectedInstanceId: InstanceId | null
  selectedInstanceIds: Set<InstanceId>
  hoveredInstanceId: InstanceId | null
  currentBreakpointId: BreakpointId
  currentPageId: PageId | null
  zoom: number
  userComponents: Map<string, UserComponent>

  select: (id: InstanceId | null) => void
  toggleSelect: (id: InstanceId) => void
  selectAll: (ids: InstanceId[]) => void
  hover: (id: InstanceId | null) => void
  setBreakpoint: (id: BreakpointId) => void
  setPage: (id: PageId) => void
  setZoom: (zoom: number) => void
  saveUserComponent: (name: string, rootInstanceId: InstanceId) => void
  removeUserComponent: (id: string) => void
}

export const createEditorSlice: StateCreator<EditorSlice, [["zustand/immer", never]], [], EditorSlice> = (set, get) => ({
  selectedInstanceId: null,
  selectedInstanceIds: new Set(),
  hoveredInstanceId: null,
  currentBreakpointId: "bp-base",
  currentPageId: null,
  zoom: 100,
  userComponents: new Map(),

  select: (id) => set((draft) => {
    draft.selectedInstanceId = id
    draft.selectedInstanceIds = new Set(id ? [id] : [])
  }),
  toggleSelect: (id) => set((draft) => {
    if (draft.selectedInstanceIds.has(id)) {
      draft.selectedInstanceIds.delete(id)
      draft.selectedInstanceId = draft.selectedInstanceIds.size > 0 ? [...draft.selectedInstanceIds][0] : null
    } else {
      draft.selectedInstanceIds.add(id)
      draft.selectedInstanceId = id
    }
  }),
  selectAll: (ids) => set((draft) => {
    draft.selectedInstanceIds = new Set(ids)
    draft.selectedInstanceId = ids.length > 0 ? ids[0] : null
  }),
  hover: (id) => set({ hoveredInstanceId: id }),
  setBreakpoint: (id) => set({ currentBreakpointId: id }),
  setPage: (id) => set({ currentPageId: id }),
  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(400, zoom)) }),

  saveUserComponent: (name, rootInstanceId) => {
    const id = generateId()
    // Collect all instance IDs in the subtree
    const s = get() as unknown as Record<string, unknown>
    const instances = s.instances as Map<string, unknown>
    const props = s.props as Map<string, unknown>
    const styleSources = s.styleSources as Map<string, unknown>
    const styleSourceSelections = s.styleSourceSelections as Map<string, unknown>
    const styleDeclarations = s.styleDeclarations as Map<string, unknown>

    const ids = new Set<string>()
    const collect = (iid: string) => {
      ids.add(iid)
      const inst = instances.get(iid) as { children: Array<{ type: string; value: string }> } | undefined
      if (inst) for (const c of inst.children) { if (c.type === "id") collect(c.value) }
    }
    collect(rootInstanceId)

    // Snapshot relevant data
    const snap = {
      instances: [...instances].filter(([k]) => ids.has(k)),
      props: [...props].filter(([, v]) => ids.has((v as { instanceId: string }).instanceId)),
      styleSources: [...styleSources].filter(([k]) => {
        for (const [iid] of [...styleSourceSelections].filter(([i]) => ids.has(i))) {
          const sel = styleSourceSelections.get(iid) as { values: string[] } | undefined
          if (sel?.values.includes(k)) return true
        }
        return false
      }),
      styleSourceSelections: [...styleSourceSelections].filter(([k]) => ids.has(k)),
      styleDeclarations: [...styleDeclarations].filter(([, d]) => {
        const decl = d as { styleSourceId: string }
        for (const [iid] of [...styleSourceSelections].filter(([i]) => ids.has(i))) {
          const sel = styleSourceSelections.get(iid) as { values: string[] } | undefined
          if (sel?.values.includes(decl.styleSourceId)) return true
        }
        return false
      }),
      rootId: rootInstanceId,
    }

    set((draft) => {
      draft.userComponents.set(id, { id, name, rootInstanceId, snapshot: JSON.stringify(snap) })
    })
  },

  removeUserComponent: (id) => {
    set((draft) => { draft.userComponents.delete(id) })
  },
})
