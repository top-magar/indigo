"use client"

import { Editor, Frame, Element } from "@craftjs/core"
import { resolver } from "../resolver"
import { RenderNode } from "./render-node"
import { SectionTree } from "./section-tree"
import { LayersPanel } from "./layers-panel"
import { AddSectionModal } from "./add-section-modal"
import { SettingsPanel } from "./settings-panel"
import { ThemePanel } from "./theme-panel"
import { SeoPanel } from "./seo-panel"
import { TopBar } from "./top-bar"
import { TextBlock } from "../blocks/text"
import { Container } from "../blocks/container"
import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/shared/utils"
import { Settings2, Palette, Search, Plus, Layers, ListTree } from "lucide-react"
import { saveDraftAction } from "../actions"
import { BreakpointProvider, type Breakpoint } from "../breakpoint-context"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { ContextMenu } from "./context-menu"
import { clampZoom } from "../zoom-utils"

const viewportWidths: Record<string, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
}

const leftTabs = [
  { id: "sections" as const, label: "Sections", icon: ListTree },
  { id: "layers" as const, label: "Layers", icon: Layers },
]

const rightTabs = [
  { id: "settings" as const, label: "Settings", icon: Settings2 },
  { id: "theme" as const, label: "Theme", icon: Palette },
  { id: "seo" as const, label: "SEO", icon: Search },
]

type LeftTab = (typeof leftTabs)[number]["id"]
type RightTab = (typeof rightTabs)[number]["id"]

interface EditorShellProps {
  craftJson: string | null
  tenantId: string
  storeSlug: string
  themeOverrides: Record<string, unknown>
  pageId?: string | null
}

export function EditorShell({ craftJson: initialCraftJson, tenantId, storeSlug, themeOverrides, pageId: initialPageId }: EditorShellProps) {
  const [viewport, setViewport] = useState<Breakpoint>("desktop")
  const [leftTab, setLeftTab] = useState<LeftTab>("sections")
  const [rightTab, setRightTab] = useState<RightTab>("settings")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [currentPageId, setCurrentPageId] = useState<string | null>(initialPageId ?? null)
  const [craftJson, setCraftJson] = useState<string | null>(initialCraftJson)
  const [zoom, setZoom] = useState(1)
  const [editorKey, setEditorKey] = useState(0) // force re-mount on page switch

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedJson = useRef<string | null>(null)
  const isDirty = useRef(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleNodesChange = useCallback((query: any) => {
    isDirty.current = true
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      const json = query.serialize()
      if (json === lastSavedJson.current) return
      isDirty.current = false
      lastSavedJson.current = json
      saveDraftAction(tenantId, json, currentPageId ?? undefined).catch(() => { isDirty.current = true })
    }, 3000)
  }, [tenantId, currentPageId])

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty.current) { e.preventDefault(); e.returnValue = "" }
    }
    window.addEventListener("beforeunload", handler)
    return () => {
      window.removeEventListener("beforeunload", handler)
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  // Pinch-to-zoom / ⌘+scroll on canvas
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      // ctrlKey+wheel from trackpad pinch: deltaY is small (-2 to +2)
      // ctrlKey+wheel from mouse scroll: deltaY is large (~100)
      // Normalize: treat anything > 10 as mouse (divide by 100), else use directly
      const delta = Math.abs(e.deltaY) > 10 ? e.deltaY / 100 : e.deltaY
      setZoom((z) => clampZoom(z - delta * 0.05))
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [])

  const handleViewportChange = useCallback((v: Breakpoint) => {
    setViewport(v)
    setZoom(1)
  }, [])

  const seoInitial = (themeOverrides?.seo as any) ?? { title: "", description: "", ogImage: "" }

  const handlePageChange = useCallback((pageId: string, json: string | null) => {
    // Flush any pending auto-save before switching
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setCurrentPageId(pageId)
    setCraftJson(json)
    lastSavedJson.current = null
    isDirty.current = false
    setEditorKey((k) => k + 1) // re-mount Editor with new JSON
    // Update URL without full navigation
    const url = new URL(window.location.href)
    url.searchParams.set("page", pageId)
    window.history.replaceState({}, "", url.toString())
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      <Editor key={editorKey} resolver={resolver} onRender={RenderNode} onNodesChange={handleNodesChange}>
       <BreakpointProvider value={viewport}>
        <TopBar tenantId={tenantId} storeSlug={storeSlug} viewport={viewport} onViewportChange={handleViewportChange} pageId={currentPageId} onPageChange={handlePageChange} zoom={zoom} onZoomChange={setZoom} />
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="flex w-[252px] shrink-0 flex-col border-r border-border/50 bg-background">
            {/* Left tabs */}
            <div className="flex gap-0 border-b border-border/50">
              {leftTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id)}
                  aria-label={tab.label}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all",
                    leftTab === tab.id
                      ? "border-b-2 border-primary bg-accent/30 text-foreground"
                      : "text-muted-foreground/70 hover:bg-accent/20 hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Left content */}
            <div className="flex-1 overflow-y-auto">
              {leftTab === "sections" && <SectionTree />}
              {leftTab === "layers" && <LayersPanel />}
            </div>

            {/* Add section button */}
            <div className="border-t border-border/50 p-3">
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-border/50 py-2.5 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent/50 hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            </div>
          </div>

          {/* Canvas area */}
          <div
            ref={canvasRef}
            className="relative flex-1 overflow-y-auto bg-muted/50"
            style={{
              backgroundImage: "radial-gradient(circle, hsl(var(--border) / 0.3) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            <div className="p-8" style={{ zoom: zoom }}>
              <div
                className={cn(
                  "mx-auto min-h-[calc(100vh-10rem)] overflow-hidden rounded bg-white transition-[max-width] duration-300",
                  viewport === "mobile" ? "shadow-md ring-1 ring-black/5" : "shadow-md ring-1 ring-black/[0.04]"
                )}
                style={{ maxWidth: viewportWidths[viewport] }}
              >
                <Frame json={craftJson ?? undefined}>
                  <Element canvas is={Container} background="#ffffff" padding={40} maxWidth="full">
                    <TextBlock text="Welcome to your store" fontSize={32} color="#000" alignment="center" tagName="h1" />
                    <TextBlock text="Start building by dragging blocks from the Add Section button" fontSize={16} color="#666" alignment="center" tagName="p" />
                  </Element>
                </Frame>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex w-[280px] shrink-0 flex-col border-l border-border/50 bg-background">
            <div className="flex gap-0 border-b border-border/50">
              {rightTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  aria-label={tab.label}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all",
                    rightTab === tab.id
                      ? "border-b-2 border-primary bg-accent/30 text-foreground"
                      : "text-muted-foreground/70 hover:bg-accent/20 hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {rightTab === "settings" && <SettingsPanel />}
              {rightTab === "theme" && <ThemePanel tenantId={tenantId} initial={themeOverrides ?? {}} pageId={currentPageId} />}
              {rightTab === "seo" && <SeoPanel tenantId={tenantId} initial={seoInitial} pageId={currentPageId} />}
            </div>
          </div>
        </div>

        {/* Add section modal */}
        <AddSectionModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
        <KeyboardShortcuts zoom={zoom} onZoomChange={setZoom} tenantId={tenantId} pageId={currentPageId} />
        <ContextMenu />
       </BreakpointProvider>
      </Editor>
    </div>
  )
}
