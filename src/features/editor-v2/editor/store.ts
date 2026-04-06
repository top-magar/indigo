"use client"

import { create } from "zustand"
import type { Document } from "../core/document"
import { createDocument, getNode } from "../core/document"
import type { Operation } from "../core/operations"
import { applyOperation } from "../core/operations"
import { toJSON, fromJSON, toCraftJSON, fromCraftJSON, type SerializedDocument } from "../core/serializer"
import type { ThemeTokens } from "../core/tokens"

type Viewport = "desktop" | "tablet" | "mobile"

interface EditorState {
  // Persistence
  tenantId: string | null
  pageId: string | null
  dirty: boolean
  saving: boolean
  lastSaved: number | null
  // Document
  document: Document
  theme: Partial<ThemeTokens>
  // UI
  selectedId: string | null
  hoveredId: string | null
  viewport: Viewport
  zoom: number
  leftPanel: "blocks" | "layers" | "styles" | null
  rightPanel: boolean
  showGridlines: boolean
  // Undo
  undoStack: Document[]
  redoStack: Document[]
  // Actions
  init: (tenantId: string, pageId: string | null, theme?: Partial<ThemeTokens>) => void
  select: (id: string | null) => void
  hover: (id: string | null) => void
  setViewport: (v: Viewport) => void
  setZoom: (z: number) => void
  setLeftPanel: (p: "blocks" | "layers" | "styles" | null) => void
  toggleRightPanel: () => void
  toggleGridlines: () => void
  setTheme: (t: Partial<ThemeTokens>) => void
  apply: (op: Operation) => void
  undo: () => void
  redo: () => void
  loadDocument: (doc: Document) => void
  loadFromJSON: (json: string) => void
  loadFromCraftJSON: (json: string) => void
  getSerializedJSON: () => string
  getCraftJSON: () => string
  markSaved: () => void
  setSaving: (s: boolean) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tenantId: null,
  pageId: null,
  dirty: false,
  saving: false,
  lastSaved: null,
  document: createDocument(),
  theme: {},
  selectedId: null,
  hoveredId: null,
  viewport: "desktop",
  zoom: 1,
  leftPanel: "blocks",
  rightPanel: false,
  showGridlines: false,
  undoStack: [],
  redoStack: [],

  init: (tenantId, pageId, theme) => set({ tenantId, pageId, theme: theme ?? {}, dirty: false }),
  select: (id) => set({ selectedId: id, rightPanel: id !== null }),
  hover: (id) => set({ hoveredId: id }),
  setViewport: (viewport) => set({ viewport }),
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
  setLeftPanel: (leftPanel) => set({ leftPanel }),
  toggleRightPanel: () => set((s) => ({ rightPanel: !s.rightPanel })),
  toggleGridlines: () => set((s) => ({ showGridlines: !s.showGridlines })),
  setTheme: (theme) => set({ theme, dirty: true }),

  apply: (op) => {
    const { document: prev, undoStack } = get()
    const next = applyOperation(prev, op)
    set({ document: next, undoStack: [...undoStack.slice(-49), prev], redoStack: [], dirty: true })
    if (op.type === "add_node" && op.nodeId) set({ selectedId: op.nodeId, rightPanel: true })
  },

  undo: () => {
    const { undoStack, document: current, redoStack } = get()
    if (undoStack.length === 0) return
    set({ document: undoStack[undoStack.length - 1], undoStack: undoStack.slice(0, -1), redoStack: [...redoStack, current], selectedId: null, dirty: true })
  },

  redo: () => {
    const { redoStack, document: current, undoStack } = get()
    if (redoStack.length === 0) return
    set({ document: redoStack[redoStack.length - 1], redoStack: redoStack.slice(0, -1), undoStack: [...undoStack, current], selectedId: null, dirty: true })
  },

  loadDocument: (document) => set({ document, undoStack: [], redoStack: [], selectedId: null, dirty: false }),

  loadFromJSON: (json) => {
    const data = JSON.parse(json) as SerializedDocument
    set({ document: fromJSON(data), undoStack: [], redoStack: [], selectedId: null, dirty: false })
  },

  loadFromCraftJSON: (json) => {
    const craft = JSON.parse(json)
    set({ document: fromCraftJSON(craft), undoStack: [], redoStack: [], selectedId: null, dirty: false })
  },

  getSerializedJSON: () => JSON.stringify(toJSON(get().document)),
  getCraftJSON: () => JSON.stringify(toCraftJSON(get().document)),
  markSaved: () => set({ dirty: false, lastSaved: Date.now() }),
  setSaving: (saving) => set({ saving }),
}))
