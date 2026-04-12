import type { StateCreator } from "zustand"
import type { Page, PageId, InstanceId } from "../types"
import { generateId } from "../id"

export interface PagesSlice {
  pages: Map<PageId, Page>
  addPage: (name: string, path: string, rootInstanceId: InstanceId) => PageId
  removePage: (id: PageId) => void
  updatePage: (id: PageId, patch: Partial<Omit<Page, "id">>) => void
}

export const createPagesSlice: StateCreator<PagesSlice, [["zustand/immer", never]], [], PagesSlice> = (set) => ({
  pages: new Map(),

  addPage: (name, path, rootInstanceId) => {
    const id = generateId()
    set((s) => { s.pages.set(id, { id, name, path, rootInstanceId }) })
    return id
  },

  removePage: (id) => {
    set((s) => { s.pages.delete(id) })
  },

  updatePage: (id, patch) => {
    set((s) => {
      const page = s.pages.get(id)
      if (page) Object.assign(page, patch)
    })
  },
})
