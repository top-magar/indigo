import { createContext, useContext, useRef, useCallback, useSyncExternalStore } from "react"

export interface GuideLine {
  axis: "x" | "y"
  position: number
}

export interface SpacingLine {
  x1: number; y1: number; x2: number; y2: number
  label: string
}

export interface DropZone {
  y: number
  width: number
  left: number
}

export interface OverlayState {
  guides: GuideLine[]
  spacing: SpacingLine[]
  dropZones: DropZone[]
}

const EMPTY: OverlayState = { guides: [], spacing: [], dropZones: [] }

function createOverlayStore() {
  let state = EMPTY
  const listeners = new Set<() => void>()

  return {
    getState: () => state,
    subscribe: (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb) },
    setGuides: (guides: GuideLine[]) => { state = { ...state, guides }; listeners.forEach((l) => l()) },
    setSpacing: (spacing: SpacingLine[]) => { state = { ...state, spacing }; listeners.forEach((l) => l()) },
    setDropZones: (dropZones: DropZone[]) => { state = { ...state, dropZones }; listeners.forEach((l) => l()) },
    clear: () => { state = EMPTY; listeners.forEach((l) => l()) },
  }
}

type Store = ReturnType<typeof createOverlayStore>

const OverlayStoreContext = createContext<Store | null>(null)

export const OverlayStoreProvider = OverlayStoreContext.Provider

export function useOverlayStoreInstance() {
  const ref = useRef<Store | null>(null)
  if (!ref.current) ref.current = createOverlayStore()
  return ref.current
}

export function useOverlayStore() {
  const store = useContext(OverlayStoreContext)
  if (!store) throw new Error("useOverlayStore must be used within OverlayStoreProvider")
  return store
}

export function useOverlayState(): OverlayState {
  const store = useOverlayStore()
  return useSyncExternalStore(store.subscribe, store.getState, store.getState)
}
