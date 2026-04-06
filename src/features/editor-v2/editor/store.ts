"use client"

/**
 * Editor Store — Zustand store for all editor state.
 * Document tree + UI state + undo/redo via operations.
 */

import { create } from "zustand"
import type { Document } from "../core/document"
import { createDocument, getNode } from "../core/document"
import type { Operation } from "../core/operations"
import { applyOperation } from "../core/operations"

type Viewport = "desktop" | "tablet" | "mobile"

interface EditorState {
  // Document
  document: Document
  // UI
  selectedId: string | null
  hoveredId: string | null
  viewport: Viewport
  zoom: number
  leftPanel: "blocks" | "layers" | null
  rightPanel: boolean
  showGridlines: boolean
  // Undo
  undoStack: Document[]
  redoStack: Document[]
  // Actions
  select: (id: string | null) => void
  hover: (id: string | null) => void
  setViewport: (v: Viewport) => void
  setZoom: (z: number) => void
  setLeftPanel: (p: "blocks" | "layers" | null) => void
  toggleRightPanel: () => void
  toggleGridlines: () => void
  apply: (op: Operation) => void
  undo: () => void
  redo: () => void
  loadDocument: (doc: Document) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  document: createDocument(),
  selectedId: null,
  hoveredId: null,
  viewport: "desktop",
  zoom: 1,
  leftPanel: "blocks",
  rightPanel: false,
  showGridlines: false,
  undoStack: [],
  redoStack: [],

  select: (id) => set({ selectedId: id, rightPanel: id !== null }),
  hover: (id) => set({ hoveredId: id }),
  setViewport: (viewport) => set({ viewport }),
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
  setLeftPanel: (leftPanel) => set({ leftPanel }),
  toggleRightPanel: () => set((s) => ({ rightPanel: !s.rightPanel })),
  toggleGridlines: () => set((s) => ({ showGridlines: !s.showGridlines })),

  apply: (op) => {
    const { document: prev, undoStack } = get()
    const next = applyOperation(prev, op)
    set({ document: next, undoStack: [...undoStack.slice(-49), prev], redoStack: [] })
    // Auto-select newly added nodes
    if (op.type === "add_node" && op.nodeId) set({ selectedId: op.nodeId, rightPanel: true })
  },

  undo: () => {
    const { undoStack, document: current, redoStack } = get()
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    set({ document: prev, undoStack: undoStack.slice(0, -1), redoStack: [...redoStack, current], selectedId: null })
  },

  redo: () => {
    const { redoStack, document: current, undoStack } = get()
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    set({ document: next, redoStack: redoStack.slice(0, -1), undoStack: [...undoStack, current], selectedId: null })
  },

  loadDocument: (document) => set({ document, undoStack: [], redoStack: [], selectedId: null }),
}))
