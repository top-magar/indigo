"use client"

import { Editor, Frame, Element, useEditor } from "@craftjs/core"
import { useEffect, useState, useRef, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionTree } from "../panels/section-tree"
import { LeftPanel } from "../panels/left-panel"
import { PanelErrorBoundary } from "../panels/panel-error-boundary"
import dynamic from "next/dynamic"
import { PanelSpinner } from "../panels/panel-spinner"

const AddSectionPanel = dynamic(() => import("../panels/add-section-panel").then((m) => m.AddSectionPanel), { ssr: false, loading: () => <PanelSpinner /> })
const AssetsPanel = dynamic(() => import("../panels/assets-panel").then((m) => m.AssetsPanel), { ssr: false, loading: () => <PanelSpinner /> })
const SiteStylesPanel = dynamic(() => import("../panels/site-styles-panel").then((m) => m.SiteStylesPanel), { ssr: false, loading: () => <PanelSpinner /> })
import { PagesPanel } from "../panels/pages-panel"
import { SelectionBreadcrumb } from "../canvas/selection-breadcrumb"
import { FloatingToolbar } from "../canvas/floating-toolbar"
import { TopBar } from "./top-bar"
import { RightPanel } from "../panels/right-panel"
import { RenderNode } from "../canvas/render-node"
import { Container } from "../blocks/container"
import { resolver } from "../resolver"
import { BreakpointProvider } from "../breakpoint-context"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { EditorActiveProvider } from "../hooks/use-node-safe"
import { themeToVars } from "../lib/theme-to-vars"
import { defaultPageJson } from "../lib/default-page"
import { cn } from "@/shared/utils"
import { EditorProvider } from "../editor-context"
import { ContextMenu } from "./context-menu"
import { CanvasOverlay } from "../canvas/canvas-overlay"
import { SpacingIndicator } from "../canvas/spacing-indicator"
import { CommandPalette } from "./command-palette"
import { ContentGridlines } from "../canvas/content-gridlines"
import { CanvasAdapterProvider, DirectCanvasAdapter } from "../lib/canvas-adapter"
import { ColumnGridOverlay } from "../canvas/column-grid-overlay"
import { editorOn, editorEmit, editorClearAll } from "../stores/editor-events"
import { EmptyCanvasState } from "../canvas/empty-canvas-state"
import { useCanvasDeselect } from "../hooks/use-canvas-deselect"
import { usePinchZoom } from "../hooks/use-pinch-zoom"
import { OverlayStoreProvider, useOverlayStoreInstance } from "../stores/overlay-store"
import { ThemeFontLoader } from "./theme-font-loader"
import { ThemeStyleInjector } from "./theme-style-injector"
import { EditorErrorBoundary } from "./editor-error-boundary"
import { DeviceFrame } from "../canvas/device-frame"
import { SaveConflictDialog } from "./save-conflict-dialog"
import { ViewportZoomProvider, useViewportZoomContext } from "../hooks/use-viewport-zoom"
import { EditorPanelsProvider, useEditorPanelsContext } from "../hooks/use-editor-panels"
import { PageManagerProvider, usePageManagerContext } from "../hooks/use-page-manager"
import { EditorThemeProvider, useEditorThemeContext } from "../hooks/use-editor-theme"
import { useSaveStore } from "../stores/save-store"
import { useCommandStore } from "../stores/command-store"
import "../editor-theme.css"

import { EditorPermissionsProvider, resolvePermissions } from "../hooks/use-editor-permissions"

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
  userRole?: string
}

export function EditorShell({ tenantId, storeSlug, craftJson, themeOverrides, seoInitial, pageId, userRole }: EditorShellProps) {
  const permissions = resolvePermissions(userRole ?? "owner")
  return (
    <EditorPermissionsProvider value={permissions}>
    <PageManagerProvider tenantId={tenantId} initialPageId={pageId} initialCraftJson={craftJson}>
      <EditorThemeProvider initial={themeOverrides}>
        <EditorPanelsProvider>
          <ViewportZoomProvider>
            <EditorShellInner tenantId={tenantId} storeSlug={storeSlug} seoInitial={seoInitial} />
          </ViewportZoomProvider>
        </EditorPanelsProvider>
      </EditorThemeProvider>
    </PageManagerProvider>
    </EditorPermissionsProvider>
  )
}

function EditorShellInner({ tenantId, storeSlug, seoInitial }: { tenantId: string; storeSlug: string; seoInitial: { title: string; description: string; ogImage: string } }) {
  const { viewport, zoom, setZoom } = useViewportZoomContext()
  const { leftTab, setLeftTab, rightOpen, toggleRightPanel, previewMode, showGridlines } = useEditorPanelsContext()
  const { currentPageId, currentCraftJson, editorKey, switching, serializeRef, handlePageChange } = usePageManagerContext()
  const { liveTheme, setLiveTheme, themeRef } = useEditorThemeContext()

  const overlayStore = useOverlayStoreInstance()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [showColGrid, setShowColGrid] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  usePinchZoom(zoom, setZoom)

  // Initialize save-store + command interpreter
  useEffect(() => {
    useSaveStore.getState().init(tenantId, currentPageId, serializeRef, themeRef)
    useSaveStore.getState().startAutosave()

    useCommandStore.getState().setInterpreter((action, data) => {
      if (data.type === "theme:change") {
        const current = themeRef.current
        setLiveTheme(action === "apply" ? { ...current, [data.key]: data.next } : { ...current, [data.key]: data.prev })
      } else if (data.type === "theme:preset") {
        setLiveTheme(action === "apply" ? data.next : data.prev)
      }
    })

    const onBeforeUnload = () => useSaveStore.getState().saveBeacon()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      useSaveStore.getState().destroy()
      useCommandStore.getState().destroy()
    }
  }, [tenantId, currentPageId, serializeRef, themeRef, setLiveTheme])

  // Toast on autosave errors
  useEffect(() => {
    let prevError: string | null = null
    return useSaveStore.subscribe((s) => {
      if (s.error && s.error !== prevError) { import("sonner").then(({ toast }) => toast.error(`Save failed: ${s.error}`)) }
      prevError = s.error
    })
  }, [])

  // Event bus listeners
  useEffect(() => {
    const unsubs = [
      editorOn("section:add", () => setLeftTab("add")),
      editorOn("panel:toggle", ({ panel, tab }) => {
        if (panel === "left" && tab) setLeftTab(tab as Parameters<typeof setLeftTab>[0])
        if (panel === "right") toggleRightPanel()
      }),
    ]
    return () => { unsubs.forEach((u) => u()); editorClearAll() }
  }, [setLeftTab, toggleRightPanel])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((v) => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === "g" && !e.shiftKey) { e.preventDefault(); setShowColGrid((v) => !v) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const theme = liveTheme as Record<string, unknown> ?? {}
  const themeVars = useMemo(() => themeToVars(theme), [theme])

  const canvasAdapter = useMemo(() => new DirectCanvasAdapter(), [])

  return (
    <BreakpointProvider value={viewport === "mobile" ? "mobile" : viewport === "tablet" ? "tablet" : "desktop"}>
    <CanvasAdapterProvider adapter={canvasAdapter}>
      <Editor key={editorKey} resolver={resolver} onRender={RenderNode}>
        <CanvasClickHandler canvasRef={canvasRef} />
        <SerializeBridge serializeRef={serializeRef} />
        <EditorActiveProvider>
        <OverlayStoreProvider value={overlayStore}>
        <EditorProvider tenantId={tenantId} storeSlug={storeSlug} pageId={currentPageId} seoInitial={seoInitial}>
        <div className="editor-shell flex h-screen flex-col">
          <TopBar />

          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {!previewMode && (
            <div className="editor-panel shrink-0 border-r flex border-border bg-background relative z-10">
              <PanelErrorBoundary><LeftPanel activeTab={leftTab} onTabChange={setLeftTab}>
                {{
                  add: <AddSectionPanel />,
                  layers: (
                    <div className="flex flex-col h-full bg-background">
                      <SectionTree />
                      <div className="border-t p-3 border-border">
                        <Button variant="outline" className="w-full gap-2" onClick={() => editorEmit("section:add")}>
                          <Plus className="h-4 w-4" /> Add Section
                        </Button>
                      </div>
                    </div>
                  ),
                  pages: <PagesPanel currentPageId={currentPageId} onPageChange={handlePageChange} />,
                  theme: <SiteStylesPanel initial={liveTheme} onThemeChange={setLiveTheme} />,
                  assets: <AssetsPanel />,
                }}
              </LeftPanel></PanelErrorBoundary>
            </div>
            )}

            <div className="flex flex-1 flex-col overflow-hidden" style={{ minHeight: 0 }}>
              <div
                ref={canvasRef}
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
                {switching && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)' }}>
                    <div className="text-[13px] font-medium text-muted-foreground">Loading page…</div>
                  </div>
                )}
                <DeviceFrame viewport={viewport} zoom={zoom}>
                <div
                  data-editor-frame
                  className={cn("bg-white", viewport === "desktop" && "mx-auto shadow-sm ring-1 ring-black/[0.04]")}
                  style={{
                    width: viewportWidths[viewport],
                    maxWidth: '100%', flex: 1, minHeight: 0, overflowY: 'auto',
                    backgroundColor: 'var(--store-bg, #ffffff)',
                    color: 'var(--store-text, #111827)',
                    fontFamily: 'var(--store-font-body, Inter)',
                    fontSize: `calc(16px * var(--store-body-scale, 100) / 100)`,
                    ...themeVars,
                  }}
                >
                  <ThemeFontLoader headingFont={theme.headingFont as string} bodyFont={theme.bodyFont as string} />
                  <ThemeStyleInjector customCss={theme.customCss as string} />
                  <EditorErrorBoundary>
                    <Frame json={currentCraftJson ?? defaultPageJson()}>
                      <Element canvas is={Container as React.ElementType} />
                    </Frame>
                  </EditorErrorBoundary>
                  <EmptyCanvasState onAddSection={() => editorEmit("section:add")} />
                </div>
                </DeviceFrame>
                <FloatingToolbar />
                <CanvasOverlay />
                <ContentGridlines visible={showGridlines} />
                <ColumnGridOverlay visible={showColGrid} />
                <SpacingIndicator />
              </div>
              <SelectionBreadcrumb />
            </div>

            {!previewMode && <PanelErrorBoundary><RightPanel open={rightOpen} onToggle={toggleRightPanel} /></PanelErrorBoundary>}
          </div>

          <KeyboardShortcuts zoom={zoom} onZoomChange={setZoom} onAddSection={() => editorEmit("section:add")} />
          <ContextMenu />
          <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onAddSection={() => editorEmit("section:add")} onOpenTheme={() => editorEmit("panel:toggle", { panel: "left", tab: "theme" })} />
          <SaveConflictDialog />
        </div>
        </EditorProvider>
        </OverlayStoreProvider>
        </EditorActiveProvider>
      </Editor>
    </CanvasAdapterProvider>
    </BreakpointProvider>
  )
}

function CanvasClickHandler({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }) {
  const handleDeselect = useCanvasDeselect()
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = (e: Event) => {
      if ((e.target as HTMLElement).closest("[data-craft-node-id]")) return
      handleDeselect(e as unknown as React.MouseEvent)
    }
    canvas.addEventListener("click", handler)
    return () => canvas.removeEventListener("click", handler)
  }, [handleDeselect, canvasRef])
  return null
}

function SerializeBridge({ serializeRef }: { serializeRef: React.MutableRefObject<(() => string) | null> }) {
  const { query } = useEditor()
  useEffect(() => { serializeRef.current = () => query.serialize() }, [query, serializeRef])
  return null
}
