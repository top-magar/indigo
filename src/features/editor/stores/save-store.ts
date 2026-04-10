import { create } from "zustand"
import { saveDraftAction, saveThemeAction } from "../actions/actions"

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
  _lastKnownUpdatedAt: string | null
  _forceNextSave: boolean
  _generation: number

  // Actions
  init: (tenantId: string, pageId: string | null, serializeRef: React.RefObject<(() => string) | null>, themeRef: React.RefObject<Record<string, unknown>>) => void
  updatePageId: (pageId: string | null) => void
  markDirty: () => void
  forceNextSave: () => void
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
  _lastKnownUpdatedAt: null,
  _forceNextSave: false,
  _generation: 0,

  init: (tenantId, pageId, serializeRef, themeRef) => {
    const gen = get()._generation + 1
    set({ _tenantId: tenantId, _pageId: pageId, _serializeRef: serializeRef, _themeRef: themeRef, dirty: false, lastSaved: null, error: null, _generation: gen })
  },

  updatePageId: (pageId) => set({ _pageId: pageId }),

  markDirty: () => { if (!get().dirty) set({ dirty: true }) },

  forceNextSave: () => set({ _forceNextSave: true, error: null }),

  save: async () => {
    const s = get()
    if (s.saving || !s._pageId) return
    const serialize = s._serializeRef.current
    if (!serialize) return
    const gen = s._generation

    set({ saving: true, error: null, dirty: false, lastSaved: new Date() })
    const prevLastSaved = s.lastSaved
    try {
      const json = serialize()
      const theme = s._themeRef.current
      const force = s._forceNextSave
      const [saveResult] = await Promise.all([
        saveDraftAction(s._tenantId, json, s._pageId ?? undefined, s._lastKnownUpdatedAt, force),
        Object.keys(theme).length > 0
          ? saveThemeAction(s._tenantId, theme, s._pageId ?? undefined).catch(() => {})
          : Promise.resolve(),
      ])
      // Abort if page switched during save
      if (get()._generation !== gen) return
      if (saveResult.success) {
        set({ saving: false, lastSaved: new Date(), _retryDelay: 5000, _consecutiveFailures: 0, _forceNextSave: false, _lastKnownUpdatedAt: saveResult.updatedAt })
      } else {
        const isConflict = saveResult.error === "conflict"
        set({
          saving: false, dirty: true, error: saveResult.error || "Save failed", lastSaved: prevLastSaved,
          _consecutiveFailures: isConflict ? s._consecutiveFailures : s._consecutiveFailures + 1,
          _retryDelay: isConflict ? s._retryDelay : Math.min(s._retryDelay * 2, 60000),
          _forceNextSave: false,
        })
      }
    } catch (e) {
      if (get()._generation !== gen) return
      const failures = get()._consecutiveFailures + 1
      set({ saving: false, dirty: true, error: (e as Error).message, lastSaved: prevLastSaved, _consecutiveFailures: failures, _retryDelay: Math.min(get()._retryDelay * 2, 60000), _forceNextSave: false })
    }
  },

  saveBeacon: () => {
    const s = get()
    const serialize = s._serializeRef.current
    if (!serialize || !s._pageId) return
    const json = serialize()
    navigator.sendBeacon?.("/api/editor/save", JSON.stringify({
      tenantId: s._tenantId, pageId: s._pageId, json, theme: s._themeRef.current, expectedUpdatedAt: s._lastKnownUpdatedAt,
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
      _retryDelay: 5000, _consecutiveFailures: 0, _lastKnownUpdatedAt: null, _forceNextSave: false, _generation: 0,
    })
  },
}))
