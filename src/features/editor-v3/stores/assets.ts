import type { StateCreator } from "zustand"
import type { Asset, AssetId } from "../types"
import { generateId } from "../id"

export interface AssetsSlice {
  assets: Map<AssetId, Asset>
  addAsset: (name: string, type: Asset["type"], src: string, width?: number, height?: number) => AssetId
  removeAsset: (id: AssetId) => void
}

export const createAssetsSlice: StateCreator<AssetsSlice, [["zustand/immer", never]], [], AssetsSlice> = (set) => ({
  assets: new Map(),

  addAsset: (name, type, src, width, height) => {
    const id = generateId()
    set((s) => { s.assets.set(id, { id, name, type, src, width, height }) })
    return id
  },

  removeAsset: (id) => {
    set((s) => { s.assets.delete(id) })
  },
})
