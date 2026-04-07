import { create } from "zustand"
import { saveDraftAction, saveThemeAction } from "./actions"

interface SaveState {
  dirty: boolean
  saving: boolean
  lastSaved: Date | null
  error: string | null

  // Non-reactive config (set once on init)
  _tenantId: string
  _pageId: string | null
  _serializeRef: React.RefObject<(() => string) | null>
  _themeRef: React.RefObject<Record<string, unknown>>
  _autosaveTimer: ReturnType<typeof setInterval> | null

  // Actions
  init: (tenantId: string, pageId: string | null, serializeRef: React.RefObject<(() => string) | null>, themeRef: React.RefObject<Record<string, unknown>>) => void
  updatePageId: (pageId: string | null) => void
  markDirty: () => void
  save: () => Promise<void>
  saveBeacon: () => void
  startAutosave: () => void
  stopAutosave: () => void
  destroy: () => void
}

export const useSaveStore = create<SaveState>((set, get) => ({
  dirty: false,
  saving: false,
  lastSaved: null,
  error: null,

  _tenantId: "",
  _pageId: null,
  _serializeRef: { current: null },
  _themeRef: { current: {} },
  _autosaveTimer: null,

  init: (tenantId, pageId, serializeRef, themeRef) => {
    set({ _tenantId: tenantId, _pageId: pageId, _serializeRef: serializeRef, _themeRef: themeRef, dirty: false, lastSaved: null, error: null })
  },

  updatePageId: (pageId) => set({ _pageId: pageId }),

  markDirty: () => { if (!get().dirty) set({ dirty: true }) },

  save: async () => {
    const s = get()
    if (s.saving || !s._pageId) return
    const serialize = s._serializeRef.current
    if (!serialize) return

    set({ saving: true, error: null })
    try {
      const json = serialize()
      const theme = s._themeRef.current
      const [saveResult] = await Promise.all([
        saveDraftAction(s._tenantId, json, s._pageId),
        Object.keys(theme).length > 0
          ? saveThemeAction(s._tenantId, theme, s._pageId).catch(() => {})
          : Promise.resolve(),
      ])
      if (saveResult.success) {
        set({ dirty: false, saving: false, lastSaved: new Date() })
      } else {
        set({ saving: false, error: saveResult.error || "Save failed" })
      }
    } catch (e) {
      set({ saving: false, error: (e as Error).message })
    }
  },

  saveBeacon: () => {
    const s = get()
    const serialize = s._serializeRef.current
    if (!serialize || !s._pageId) return
    const json = serialize()
    navigator.sendBeacon?.("/api/editor/save", JSON.stringify({
      tenantId: s._tenantId, pageId: s._pageId, json, theme: s._themeRef.current,
    }))
  },

  startAutosave: () => {
    const s = get()
    if (s._autosaveTimer) return
    const timer = setInterval(() => { if (get().dirty) get().save() }, 5000)
    set({ _autosaveTimer: timer })
  },

  stopAutosave: () => {
    const timer = get()._autosaveTimer
    if (timer) { clearInterval(timer); set({ _autosaveTimer: null }) }
  },

  destroy: () => {
    const timer = get()._autosaveTimer
    if (timer) clearInterval(timer)
    set({
      dirty: false, saving: false, lastSaved: null, error: null,
      _tenantId: "", _pageId: null, _serializeRef: { current: null },
      _themeRef: { current: {} }, _autosaveTimer: null,
    })
  },
}))
