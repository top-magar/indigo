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
  _retryDelay: number
  _consecutiveFailures: number

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
  _retryDelay: 5000,
  _consecutiveFailures: 0,

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

    set({ saving: true, error: null, dirty: false, lastSaved: new Date() })
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
        set({ saving: false, _retryDelay: 5000, _consecutiveFailures: 0 })
      } else {
        const failures = get()._consecutiveFailures + 1
        set({ saving: false, dirty: true, error: saveResult.error || "Save failed", _consecutiveFailures: failures, _retryDelay: Math.min(get()._retryDelay * 2, 60000) })
      }
    } catch (e) {
      const failures = get()._consecutiveFailures + 1
      set({ saving: false, dirty: true, error: (e as Error).message, _consecutiveFailures: failures, _retryDelay: Math.min(get()._retryDelay * 2, 60000) })
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
    const tick = () => {
      if (get().dirty) get().save()
      // Reschedule with current delay (may have changed due to backoff)
      const timer = setTimeout(tick, get()._retryDelay)
      set({ _autosaveTimer: timer as unknown as ReturnType<typeof setInterval> })
    }
    const timer = setTimeout(tick, s._retryDelay)
    set({ _autosaveTimer: timer as unknown as ReturnType<typeof setInterval> })
  },

  stopAutosave: () => {
    const timer = get()._autosaveTimer
    if (timer) { clearTimeout(timer as unknown as ReturnType<typeof setTimeout>); set({ _autosaveTimer: null }) }
  },

  destroy: () => {
    const timer = get()._autosaveTimer
    if (timer) clearTimeout(timer as unknown as ReturnType<typeof setTimeout>)
    set({
      dirty: false, saving: false, lastSaved: null, error: null,
      _tenantId: "", _pageId: null, _serializeRef: { current: null },
      _themeRef: { current: {} }, _autosaveTimer: null,
      _retryDelay: 5000, _consecutiveFailures: 0,
    })
  },
}))
