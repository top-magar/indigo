"use client"

import { create } from "zustand"

/** Style props that can be copied between blocks */
const STYLE_KEYS = [
  "backgroundColor", "textColor", "accentColor",
  "paddingTop", "paddingBottom",
  "borderRadius",
] as const

type StyleClipboard = Partial<Record<string, unknown>>

interface StyleClipboardStore {
  clipboard: StyleClipboard | null
  copy: (props: Record<string, unknown>) => void
  paste: (setProp: (cb: (p: Record<string, unknown>) => void) => void) => void
  hasClipboard: boolean
}

export const useStyleClipboard = create<StyleClipboardStore>((set, get) => ({
  clipboard: null,
  hasClipboard: false,

  copy: (props) => {
    const copied: StyleClipboard = {}
    for (const key of STYLE_KEYS) {
      if (key in props && props[key] !== undefined && props[key] !== "") {
        copied[key] = props[key]
      }
    }
    set({ clipboard: copied, hasClipboard: Object.keys(copied).length > 0 })
  },

  paste: (setProp) => {
    const { clipboard } = get()
    if (!clipboard) return
    setProp((p) => {
      for (const [key, val] of Object.entries(clipboard)) {
        if (key in p) p[key] = val
      }
    })
  },
}))
