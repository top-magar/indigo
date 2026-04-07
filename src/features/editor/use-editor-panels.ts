"use client"

import { useState, useCallback } from "react"
import type { TabId } from "./components/left-panel"

export function useEditorPanels() {
  const [leftTab, setLeftTab] = useState<TabId | null>(null)
  const [rightOpen, setRightOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [showGridlines, setShowGridlines] = useState(false)

  const toggleRightPanel = useCallback(() => setRightOpen((v) => !v), [])

  return { leftTab, setLeftTab, rightOpen, toggleRightPanel, previewMode, setPreviewMode, showGridlines, setShowGridlines }
}
