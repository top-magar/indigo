"use client"

import { useEffect } from "react"
import { useViewportZoom } from "./use-viewport-zoom"
import { useEditorPanels } from "./use-editor-panels"
import { usePageManager } from "./use-page-manager"
import { useEditorTheme } from "./use-editor-theme"
import { useSaveStore } from "./save-store"
import { useCommandStore } from "./command-store"

interface UseEditorStateProps {
  tenantId: string
  craftJson: string | null
  themeOverrides: Record<string, unknown> | null
  pageId: string | null
}

/**
 * Thin wrapper that composes all focused hooks.
 * @deprecated Components should migrate to individual context providers.
 */
export function useEditorState({ tenantId, craftJson, themeOverrides, pageId }: UseEditorStateProps) {
  const vz = useViewportZoom()
  const panels = useEditorPanels()
  const pages = usePageManager({ tenantId, initialPageId: pageId, initialCraftJson: craftJson })
  const theme = useEditorTheme(themeOverrides)

  // Initialize save-store and autosave
  useEffect(() => {
    useSaveStore.getState().init(tenantId, pages.currentPageId, pages.serializeRef, theme.themeRef)
    useSaveStore.getState().startAutosave()

    // Command interpreter — applies data commands using current theme setter
    useCommandStore.getState().setInterpreter((action, data) => {
      if (data.type === "theme:change") {
        const current = theme.themeRef.current
        theme.setLiveTheme(action === "apply"
          ? { ...current, [data.key]: data.next }
          : { ...current, [data.key]: data.prev })
      } else if (data.type === "theme:preset") {
        theme.setLiveTheme(action === "apply" ? data.next : data.prev)
      }
    })

    const onBeforeUnload = () => useSaveStore.getState().saveBeacon()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      useSaveStore.getState().destroy()
      useCommandStore.getState().destroy()
    }
  }, [tenantId, pages.currentPageId, pages.serializeRef, theme.themeRef])

  return {
    viewport: vz.viewport, handleViewportChange: vz.handleViewportChange,
    zoom: vz.zoom, setZoom: vz.setZoom,
    leftTab: panels.leftTab, setLeftTab: panels.setLeftTab,
    rightOpen: panels.rightOpen, toggleRightPanel: panels.toggleRightPanel,
    previewMode: panels.previewMode, setPreviewMode: panels.setPreviewMode,
    showGridlines: panels.showGridlines, setShowGridlines: panels.setShowGridlines,
    currentPageId: pages.currentPageId, currentCraftJson: pages.currentCraftJson,
    editorKey: pages.editorKey, switching: pages.switching,
    serializeRef: pages.serializeRef,
    handlePageChange: pages.handlePageChange, handleVersionRestore: pages.handleVersionRestore,
    liveTheme: theme.liveTheme, setLiveTheme: theme.setLiveTheme,
  }
}
