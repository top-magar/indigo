import type { StateCreator } from "zustand"
import type { InstanceId, SiteConfig } from "../types"

export interface SiteSlice {
  site: SiteConfig
  setSiteHeader: (id: InstanceId | null) => void
  setSiteFooter: (id: InstanceId | null) => void
}

export const createSiteSlice: StateCreator<SiteSlice, [["zustand/immer", never]], [], SiteSlice> = (set) => ({
  site: { headerInstanceId: null, footerInstanceId: null },
  setSiteHeader: (id) => set((s) => { s.site.headerInstanceId = id }),
  setSiteFooter: (id) => set((s) => { s.site.footerInstanceId = id }),
})
