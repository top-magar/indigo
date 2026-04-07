"use client"

import { Editor, Frame, Element, useEditor } from "@craftjs/core"
import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionTree } from "./section-tree"
import { AddSectionPanel } from "./add-section-panel"
import { LeftPanel } from "./left-panel"
import { AssetsPanel } from "./assets-panel"
import { SiteStylesPanel } from "./site-styles-panel"
import { PagesPanel } from "./pages-panel"
import { SelectionBreadcrumb } from "./selection-breadcrumb"
import { FloatingToolbar } from "./floating-toolbar"
import { TopBar } from "./top-bar"
import { RightPanel } from "./right-panel"
import { RenderNode } from "./render-node"
import { Container } from "../blocks/container"
import { resolver } from "../resolver"
import { BreakpointProvider } from "../breakpoint-context"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { EditorActiveProvider } from "../use-node-safe"
import { useEditorState } from "../use-editor-state"
import { themeToVars } from "../theme-to-vars"
import { defaultPageJson } from "../default-page"
import { cn } from "@/shared/utils"
import { EditorProvider } from "../editor-context"
import { ContextMenu } from "./context-menu"
import { CanvasOverlay } from "./canvas-overlay"
import { SpacingIndicator } from "./spacing-indicator"
import { CommandPalette } from "./command-palette"
import { ContentGridlines } from "./content-gridlines"
import { ColumnGridOverlay } from "./column-grid-overlay"
import { EmptyCanvasState } from "./empty-canvas-state"
import { useCanvasDeselect } from "../use-canvas-deselect"
import { usePinchZoom } from "../use-pinch-zoom"
import { OverlayStoreProvider, useOverlayStoreInstance } from "../overlay-store"
import "../editor-theme.css"

const viewportWidths: Record<string, string> = {
  desktop: "1280px",
  tablet: "768px",
  mobile: "375px",
}

interface EditorShellProps {
  tenantId: string
  storeSlug: string
  craftJson: string | null
  themeOverrides: Record<string, unknown> | null
  seoInitial: { title: string; description: string; ogImage: string }
  pageId: string | null
}

export function EditorShell({ tenantId, storeSlug, craftJson, themeOverrides, seoInitial, pageId }: EditorShellProps) {
  const state = useEditorState({ tenantId, craftJson, themeOverrides, pageId })
  const overlayStore = useOverlayStoreInstance()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [showColGrid, setShowColGrid] = useState(false)

  usePinchZoom(state.zoom, state.setZoom)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((v) => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === "g" && !e.shiftKey) { e.preventDefault(); setShowColGrid((v) => !v) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <BreakpointProvider value={state.viewport === "mobile" ? "mobile" : state.viewport === "tablet" ? "tablet" : "desktop"}>
      <Editor key={state.editorKey} resolver={resolver} onRender={RenderNode}>
        <CanvasClickHandler />
        <SerializeCapture serializeRef={state.serializeRef} />
        <EditorActiveProvider>
        <OverlayStoreProvider value={overlayStore}>
        <EditorProvider tenantId={tenantId} storeSlug={storeSlug} pageId={state.currentPageId} seoInitial={seoInitial}>
        <div className="editor-shell flex h-screen flex-col">
          <TopBar
            viewport={state.viewport}
            onViewportChange={state.handleViewportChange}
            zoom={state.zoom}
            onZoomChange={state.setZoom}
            previewMode={state.previewMode}
            onPreviewModeChange={state.setPreviewMode}
            showGridlines={state.showGridlines}
            onShowGridlinesChange={state.setShowGridlines}
            onVersionRestore={state.handleVersionRestore}
          />

          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* Left Panel */}
            {!state.previewMode && (
            <div className="editor-panel shrink-0 border-r flex border-border bg-background relative z-10">
              <LeftPanel activeTab={state.leftTab} onTabChange={state.setLeftTab}>
                {{
                  add: <AddSectionPanel />,
                  layers: (
                    <div className="flex flex-col h-full bg-background">
                      <SectionTree />
                      <div className="border-t p-3 border-border">
                        <Button variant="outline" className="w-full gap-2" onClick={() => state.setLeftTab("add")}>
                          <Plus className="h-4 w-4" /> Add Section
                        </Button>
                      </div>
                    </div>
                  ),
                  pages: <PagesPanel currentPageId={state.currentPageId} onPageChange={state.handlePageChange} />,
                  theme: <SiteStylesPanel initial={state.liveTheme} onThemeChange={state.setLiveTheme} />,
                  assets: <AssetsPanel />,
                }}
              </LeftPanel>
            </div>
            )}

            {/* Canvas + Breadcrumb */}
            <div className="flex flex-1 flex-col overflow-hidden" style={{ minHeight: 0 }}>
              <div
                data-editor-canvas
                className="editor-canvas relative flex-1"
                style={{
                  overflow: 'auto', minHeight: 0,
                  backgroundImage: "radial-gradient(circle, var(--editor-dot) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  padding: 24,
                }}
              >
                {state.switching && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)' }}>
                    <div className="text-[13px] font-medium text-muted-foreground">Loading page…</div>
                  </div>
                )}
                <div
                  className={cn(
                    "mx-auto flex flex-col",
                    state.viewport === "mobile" && "rounded-[40px] border-[6px] border-neutral-800 shadow-xl max-h-full",
                    state.viewport === "tablet" && "rounded-[20px] border-[6px] border-neutral-800/80 shadow-xl max-h-full",
                  )}
                  style={{ zoom: state.zoom }}
                >
                  {/* Device notch / status bar */}
                  {state.viewport === "mobile" && (
                    <div className="h-7 bg-neutral-800 flex items-center justify-center shrink-0 rounded-t-[34px]">
                      <div className="w-20 h-4 bg-neutral-900 rounded-full" />
                    </div>
                  )}
                  {state.viewport === "tablet" && (
                    <div className="h-5 bg-neutral-800/80 rounded-t-[14px] shrink-0" />
                  )}
                <div
                  className={cn(
                    "bg-white",
                    state.viewport === "desktop" && "mx-auto shadow-sm ring-1 ring-black/[0.04]",
                  )}
                  style={{
                    width: viewportWidths[state.viewport],
                    maxWidth: '100%',
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    backgroundColor: 'var(--store-bg, #ffffff)',
                    color: 'var(--store-text, #111827)',
                    fontFamily: 'var(--store-font-body, Inter)',
                    fontSize: `calc(16px * var(--store-body-scale, 100) / 100)`,
                    ...themeToVars(state.liveTheme as Record<string, unknown> ?? {}),
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                  {!!(state.liveTheme.headingFont || state.liveTheme.bodyFont) && <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${[state.liveTheme.headingFont as string, state.liveTheme.bodyFont as string].filter((f): f is string => !!f && f !== "System UI").map(f => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`} />}
                  <style>{`
                    [data-craft-node-id] h1,[data-craft-node-id] h2,[data-craft-node-id] h3,[data-craft-node-id] h4 {
                      letter-spacing: var(--store-heading-tracking, 0em);
                      font-size: calc(1em * var(--store-heading-scale, 100) / 100);
                    }
                    [data-craft-node-id] { line-height: var(--store-body-leading, 1.6); }
                    [data-craft-node-id] > [data-craft-node-id] {
                      margin-bottom: var(--store-section-gap-v, 48px);
                      padding-left: var(--store-section-gap-h, 24px);
                      padding-right: var(--store-section-gap-h, 24px);
                    }
                    [data-craft-node-id] [data-craft-node-id] > div { max-width: var(--store-max-width, none); margin-left: auto; margin-right: auto; }
                  `}</style>
                  {!!state.liveTheme.customCss && <style>{state.liveTheme.customCss as string}</style>}
                  <Frame json={state.currentCraftJson ?? defaultPageJson()}>
                    <Element canvas is={Container as React.ElementType} />
                  </Frame>
                  <EmptyCanvasState onAddSection={() => state.setLeftTab("add")} />
                </div>
                  {/* Device bottom bezel */}
                  {state.viewport === "mobile" && <div className="h-4 bg-neutral-800 shrink-0 rounded-b-[34px]" />}
                  {state.viewport === "tablet" && <div className="h-4 bg-neutral-800/80 shrink-0 rounded-b-[14px]" />}
                </div>
                <FloatingToolbar />
                <CanvasOverlay />
                <ContentGridlines visible={state.showGridlines} />
                <ColumnGridOverlay visible={showColGrid} />
                <SpacingIndicator />
              </div>
              <SelectionBreadcrumb />
            </div>

            {/* Right Panel */}
            {!state.previewMode && (
              <RightPanel
                open={state.rightOpen}
                onToggle={state.toggleRightPanel}
              />
            )}
          </div>

          <KeyboardShortcuts zoom={state.zoom} onZoomChange={state.setZoom} onAddSection={() => state.setLeftTab("add")} />
          <ContextMenu />
          <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onAddSection={() => state.setLeftTab("add")} onOpenTheme={() => state.setLeftTab("theme")} />
        </div>
        </EditorProvider>
        </OverlayStoreProvider>
        </EditorActiveProvider>
      </Editor>
    </BreakpointProvider>
  )
}

function CanvasClickHandler() {
  const handleDeselect = useCanvasDeselect()
  useEffect(() => {
    const canvas = document.querySelector("[data-editor-canvas]")
    if (!canvas) return
    const handler = (e: Event) => {
      if ((e.target as HTMLElement).closest("[data-craft-node-id]")) return
      handleDeselect(e as unknown as React.MouseEvent)
    }
    canvas.addEventListener("click", handler)
    return () => canvas.removeEventListener("click", handler)
  }, [handleDeselect])
  return null
}

function SerializeCapture({ serializeRef }: { serializeRef: React.MutableRefObject<(() => string) | null> }) {
  const { query } = useEditor()
  useEffect(() => { serializeRef.current = () => query.serialize() }, [query, serializeRef])
  return null
}
