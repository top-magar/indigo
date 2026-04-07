"use client"

import { useState, useCallback, createContext, useContext, type ReactNode } from "react"
import type { TabId } from "./components/left-panel"

interface EditorPanelsValue {
  leftTab: TabId | null
  setLeftTab: (tab: TabId | null) => void
  rightOpen: boolean
  toggleRightPanel: () => void
  previewMode: boolean
  setPreviewMode: (v: boolean) => void
  showGridlines: boolean
  setShowGridlines: (v: boolean) => void
}

const EditorPanelsContext = createContext<EditorPanelsValue | null>(null)

export function useEditorPanelsContext(): EditorPanelsValue {
  const ctx = useContext(EditorPanelsContext)
  if (!ctx) throw new Error("useEditorPanelsContext must be used within EditorPanelsProvider")
  return ctx
}

export function EditorPanelsProvider({ children }: { children: ReactNode }) {
  const value = useEditorPanels()
  return <EditorPanelsContext value={value}>{children}</EditorPanelsContext>
}

export function useEditorPanels() {
  const [leftTab, setLeftTab] = useState<TabId | null>(null)
  const [rightOpen, setRightOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [showGridlines, setShowGridlines] = useState(false)

  const toggleRightPanel = useCallback(() => setRightOpen((v) => !v), [])

  return { leftTab, setLeftTab, rightOpen, toggleRightPanel, previewMode, setPreviewMode, showGridlines, setShowGridlines }
}
