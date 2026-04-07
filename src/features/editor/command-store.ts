import { create } from "zustand"

export interface Command {
  type: string
  description: string
  execute: () => void
  undo: () => void
  timestamp: number
}

interface CommandState {
  history: Command[]
  pointer: number // points to the last executed command (-1 = nothing)

  /** Execute a command and push it onto the stack */
  execute: (cmd: Omit<Command, "timestamp">) => void
  /** Undo the most recent command. Returns true if something was undone. */
  undo: () => boolean
  /** Redo the most recently undone command. Returns true if something was redone. */
  redo: () => boolean
  canUndo: () => boolean
  canRedo: () => boolean
  /** Timestamp of the last executed/undone command (for unified ⌘Z) */
  lastActionTime: () => number
  destroy: () => void
}

const MAX_HISTORY = 50

export const useCommandStore = create<CommandState>((set, get) => ({
  history: [],
  pointer: -1,

  execute: (cmd) => {
    const full: Command = { ...cmd, timestamp: Date.now() }
    full.execute()
    set((s) => {
      // Discard any redo stack beyond pointer
      const history = [...s.history.slice(0, s.pointer + 1), full].slice(-MAX_HISTORY)
      return { history, pointer: history.length - 1 }
    })
  },

  undo: () => {
    const s = get()
    if (s.pointer < 0) return false
    s.history[s.pointer].undo()
    set({ pointer: s.pointer - 1 })
    return true
  },

  redo: () => {
    const s = get()
    if (s.pointer >= s.history.length - 1) return false
    const next = s.history[s.pointer + 1]
    next.execute()
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

  destroy: () => set({ history: [], pointer: -1 }),
}))
