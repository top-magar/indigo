import { create } from "zustand"

interface SidebarState {
  tab: string
  insertIndex: number | null
  setTab: (tab: string) => void
  openAddPanel: (insertIndex?: number) => void
}

export const useSidebarState = create<SidebarState>((set) => ({
  tab: "sections",
  insertIndex: null,
  setTab: (tab) => set({ tab }),
  openAddPanel: (insertIndex) => set({ tab: "add", insertIndex: insertIndex ?? null }),
}))
