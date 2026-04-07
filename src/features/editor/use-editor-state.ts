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
  const themeRef = useRef(liveTheme)
  themeRef.current = liveTheme

  const handleViewportChange = useCallback((v: "desktop" | "tablet" | "mobile") => { setViewport(v); setAutoZoom(true) }, [])

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
        navigator.sendBeacon?.("/api/editor/save", JSON.stringify({ tenantId, pageId: currentPageId, json, theme: themeRef.current }))
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [tenantId, currentPageId])

  // Auto-fit zoom when viewport exceeds available canvas space
  const [autoZoom, setAutoZoom] = useState(true)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  useEffect(() => {
    if (!autoZoom) return
    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    if (!canvas) return
    const viewportPx = { desktop: 1280, tablet: 768, mobile: 375 }[viewport]
    const observe = () => {
      const available = canvas.clientWidth - 48
      if (available < viewportPx) {
        setZoom(Math.max(0.5, Math.floor((available / viewportPx) * 20) / 20))
      } else if (zoomRef.current < 1) {
        setZoom(1)
      }
    }
    const ro = new ResizeObserver(observe)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [viewport, autoZoom]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleZoomChange = useCallback((z: number) => { setAutoZoom(false); setZoom(z) }, [])

  return {
    viewport, handleViewportChange,
    currentPageId, handlePageChange,
    editorKey, currentCraftJson,
    zoom, setZoom: handleZoomChange,
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
