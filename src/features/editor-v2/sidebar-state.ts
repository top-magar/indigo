import { create } from "zustand"

type SidebarTab = "add" | "layers" | "theme" | "pages" | "settings"

interface SidebarState {
  tab: SidebarTab
  insertIndex: number | null
  setTab: (tab: string) => void
  openAddPanel: (insertIndex?: number) => void
}

export const useSidebarState = create<SidebarState>((set) => ({
  tab: "layers",
  insertIndex: null,
  setTab: (tab) => set({ tab: tab as SidebarTab }),
  openAddPanel: (insertIndex) => set({ tab: "add", insertIndex: insertIndex ?? null }),
}))
