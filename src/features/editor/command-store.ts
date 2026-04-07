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
  _interpreter: Interpreter | null

  setInterpreter: (fn: Interpreter) => void
  execute: (data: CommandData, description: string) => void
  undo: () => boolean
  redo: () => boolean
  canUndo: () => boolean
  canRedo: () => boolean
  lastActionTime: () => number
  destroy: () => void
}

const MAX_HISTORY = 50

export const useCommandStore = create<CommandState>((set, get) => ({
  history: [],
  pointer: -1,
  _interpreter: null,

  setInterpreter: (fn) => set({ _interpreter: fn }),

  execute: (data, description) => {
    const interp = get()._interpreter
    if (!interp) return
    interp("apply", data)
    const cmd: Command = { data, description, timestamp: Date.now() }
    set((s) => {
      const history = [...s.history.slice(0, s.pointer + 1), cmd].slice(-MAX_HISTORY)
      return { history, pointer: history.length - 1 }
    })
  },

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
  lastActionTime: () => {
    const s = get()
    if (s.pointer < 0) return 0
    return s.history[s.pointer].timestamp
  },

  destroy: () => set({ history: [], pointer: -1, _interpreter: null }),
}))
