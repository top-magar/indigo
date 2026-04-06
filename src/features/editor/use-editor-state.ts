"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { saveDraftAction, loadPageAction } from "./actions"
import type { TabId } from "./components/left-panel"

interface UseEditorStateProps {
  tenantId: string
  craftJson: string | null
  themeOverrides: Record<string, unknown> | null
  pageId: string | null
}

export function useEditorState({ tenantId, craftJson, themeOverrides, pageId: initialPageId }: UseEditorStateProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [currentPageId, setCurrentPageId] = useState(initialPageId)
  const [editorKey, setEditorKey] = useState(0)
  const [currentCraftJson, setCurrentCraftJson] = useState(craftJson)
  const [zoom, setZoom] = useState(1)
  const [previewMode, setPreviewMode] = useState(false)
  const [leftTab, setLeftTab] = useState<TabId | null>(null)
  const [rightOpen, setRightOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [showGridlines, setShowGridlines] = useState(false)
  const [liveTheme, setLiveTheme] = useState<Record<string, unknown>>(themeOverrides ?? {})
  const serializeRef = useRef<(() => string) | null>(null)

  const handleViewportChange = useCallback((v: "desktop" | "tablet" | "mobile") => setViewport(v), [])

  const handlePageChange = useCallback(async (pageId: string, _json: string | null) => {
    setSwitching(true)
    if (serializeRef.current && currentPageId) {
      const json = serializeRef.current()
      await saveDraftAction(tenantId, json, currentPageId)
    }
    const result = await loadPageAction(tenantId, pageId)
    setCurrentPageId(pageId)
    setCurrentCraftJson(result.success ? result.craftJson : null)
    setEditorKey((k) => k + 1)
    setRightOpen(true)
    setSwitching(false)
  }, [tenantId, currentPageId])

  const handleVersionRestore = useCallback(async () => {
    if (!currentPageId) return
    const result = await loadPageAction(tenantId, currentPageId)
    setCurrentCraftJson(result.success ? result.craftJson : null)
    setEditorKey((k) => k + 1)
  }, [tenantId, currentPageId])

  const toggleRightPanel = useCallback(() => setRightOpen((v) => !v), [])

  // Save on tab close / navigate away
  useEffect(() => {
    const onBeforeUnload = () => {
      if (serializeRef.current && currentPageId) {
        const json = serializeRef.current()
        navigator.sendBeacon?.("/api/editor/save", JSON.stringify({ tenantId, pageId: currentPageId, json }))
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [tenantId, currentPageId])

  return {
    viewport, handleViewportChange,
    currentPageId, handlePageChange,
    editorKey, currentCraftJson,
    zoom, setZoom,
    previewMode, setPreviewMode,
    leftTab, setLeftTab,
    rightOpen, toggleRightPanel,
    switching,
    showGridlines, setShowGridlines,
    liveTheme, setLiveTheme,
    serializeRef,
    handleVersionRestore,
  }
}
