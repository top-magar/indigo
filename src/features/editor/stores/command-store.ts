import { create } from "zustand"

/** Serializable command data — no closures, no stale refs */
export type CommandData =
  | { type: "theme:change"; key: string; prev: unknown; next: unknown }
  | { type: "theme:preset"; prev: Record<string, unknown>; next: Record<string, unknown> }

export interface Command {
  data: CommandData
  description: string
  timestamp: number
}

type Interpreter = (action: "apply" | "revert", data: CommandData) => void

interface CommandState {
  history: Command[]
  pointer: number
  timeline: Array<"craft" | "command">
  _redoTimeline: Array<"craft" | "command">
  _interpreter: Interpreter | null

  setInterpreter: (fn: Interpreter) => void
  execute: (data: CommandData, description: string) => void
  /** Record that a Craft.js action happened (call when canUndo transitions) */
  recordCraftAction: () => void
  undo: () => boolean
  redo: () => boolean
  canUndo: () => boolean
  canRedo: () => boolean
  /** Pop the last timeline entry and return its source (pushes to redo timeline) */
  popTimeline: () => "craft" | "command" | null
  /** Pop from redo timeline for correct redo ordering */
  popRedoTimeline: () => "craft" | "command" | null
  /** Push back a timeline entry (for redo) */
  pushTimeline: (source: "craft" | "command") => void
  lastActionTime: () => number
  destroy: () => void
}

const MAX_HISTORY = 50

export const useCommandStore = create<CommandState>((set, get) => ({
  history: [],
  pointer: -1,
  timeline: [],
  _redoTimeline: [],
  _interpreter: null,

  setInterpreter: (fn) => set({ _interpreter: fn }),

  execute: (data, description) => {
    const interp = get()._interpreter
    if (!interp) return
    interp("apply", data)
    const cmd: Command = { data, description, timestamp: Date.now() }
    set((s) => {
      const history = [...s.history.slice(0, s.pointer + 1), cmd].slice(-MAX_HISTORY)
      return { history, pointer: history.length - 1, timeline: [...s.timeline, "command"], _redoTimeline: [] }
    })
  },

  recordCraftAction: () => set((s) => ({ timeline: [...s.timeline, "craft"], _redoTimeline: [] })),

  undo: () => {
    const s = get()
    if (s.pointer < 0 || !s._interpreter) return false
    s._interpreter("revert", s.history[s.pointer].data)
    set({ pointer: s.pointer - 1 })
    return true
  },

  redo: () => {
    const s = get()
    if (s.pointer >= s.history.length - 1 || !s._interpreter) return false
    const next = s.history[s.pointer + 1]
    s._interpreter("apply", next.data)
    set({ pointer: s.pointer + 1 })
    return true
  },

  canUndo: () => get().pointer >= 0,
  canRedo: () => get().pointer < get().history.length - 1,

  popTimeline: () => {
    const tl = get().timeline
    if (tl.length === 0) return null
    const last = tl[tl.length - 1]
    set((s) => ({ timeline: tl.slice(0, -1), _redoTimeline: [...s._redoTimeline, last] }))
    return last
  },

  popRedoTimeline: () => {
    const rt = get()._redoTimeline
    if (rt.length === 0) return null
    const last = rt[rt.length - 1]
    set((s) => ({ _redoTimeline: rt.slice(0, -1), timeline: [...s.timeline, last] }))
    return last
  },

  pushTimeline: (source) => set((s) => ({ timeline: [...s.timeline, source] })),

  lastActionTime: () => {
    const s = get()
    if (s.pointer < 0) return 0
    return s.history[s.pointer].timestamp
  },

  destroy: () => set({ history: [], pointer: -1, timeline: [], _redoTimeline: [], _interpreter: null }),
}))
