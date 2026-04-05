"use client"

import { Editor, Frame, Element, useEditor } from "@craftjs/core"
import { useState, useCallback, useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionTree } from "./section-tree"
import { AddSectionPanel } from "./add-section-panel"
import { LeftPanel, type TabId } from "./left-panel"
import { AssetsPanel } from "./assets-panel"
import { SiteStylesPanel } from "./site-styles-panel"
import { PagesPanel } from "./pages-panel"
import { SelectionBreadcrumb } from "./selection-breadcrumb"
import { SettingsPanel } from "./settings-panel"
import { BatchEditor } from "./batch-editor"
import { PageSettingsPanel } from "./page-settings-panel"
import { FloatingToolbar } from "./floating-toolbar"
import { TopBar } from "./top-bar"
import { RenderNode } from "./render-node"
import { Container } from "../blocks/container"
import { resolver } from "../resolver"
import { BreakpointProvider } from "../breakpoint-context"
import { useEditorShortcuts } from "../use-editor-shortcuts"
import { EditorActiveProvider } from "../use-node-safe"
import { saveDraftAction, loadPageAction } from "../actions"
import { defaultPageJson } from "../default-page"
import { cn } from "@/shared/utils"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { ContextMenu } from "./context-menu"
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

function themeToVars(t: Record<string, unknown>): React.CSSProperties {
  const vars: Record<string, string> = {}
  if (t?.primaryColor) vars["--store-primary"] = t.primaryColor as string
  if (t?.secondaryColor) vars["--store-secondary"] = t.secondaryColor as string
  if (t?.accentColor) vars["--store-accent"] = t.accentColor as string
  if (t?.backgroundColor) vars["--store-bg"] = t.backgroundColor as string
  if (t?.textColor) vars["--store-text"] = t.textColor as string
  if (t?.headingFont) vars["--store-font-heading"] = t.headingFont as string
  if (t?.bodyFont) vars["--store-font-body"] = t.bodyFont as string
  if (t?.borderRadius !== undefined && t?.borderRadius !== null) vars["--store-radius"] = `${t.borderRadius}px`
  // Typography scale
  if (t?.headingScale) vars["--store-heading-scale"] = `${t.headingScale}%`
  if (t?.bodyScale) vars["--store-body-scale"] = `${t.bodyScale}%`
  if (t?.headingLetterSpacing !== undefined) vars["--store-heading-tracking"] = `${t.headingLetterSpacing}em`
  if (t?.bodyLineHeight) vars["--store-body-leading"] = `${t.bodyLineHeight}`
  // Layout
  if (t?.maxWidth) vars["--store-max-width"] = `${t.maxWidth}px`
  if (t?.sectionSpacingV) vars["--store-section-gap-v"] = `${t.sectionSpacingV}px`
  if (t?.sectionSpacingH) vars["--store-section-gap-h"] = `${t.sectionSpacingH}px`
  // Buttons
  if (t?.buttonShape) {
    const r = t.buttonShape === "square" ? "2px" : t.buttonShape === "pill" ? "999px" : "var(--store-radius, 8px)"
    vars["--store-btn-radius"] = r
  }
  if (t?.buttonShadow && t.buttonShadow !== "none") {
    const shadows: Record<string, string> = { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 2px 6px rgba(0,0,0,0.1)", lg: "0 4px 12px rgba(0,0,0,0.15)" }
    vars["--store-btn-shadow"] = shadows[t.buttonShadow as string] || "none"
  }
  // Derived: placeholder colors adapt to light/dark themes
  if (t?.backgroundColor) {
    const bg = t.backgroundColor as string
    const isDark = isColorDark(bg)
    vars["--store-placeholder-bg"] = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
    vars["--store-placeholder-text"] = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"
    vars["--store-border"] = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"
  }
  return vars as React.CSSProperties
}

function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "")
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

export function EditorShell({ tenantId, storeSlug, craftJson, themeOverrides, seoInitial, pageId: initialPageId }: EditorShellProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [currentPageId, setCurrentPageId] = useState(initialPageId)
  const [editorKey, setEditorKey] = useState(0)
  const [currentCraftJson, setCurrentCraftJson] = useState(craftJson)
  const [zoom, setZoom] = useState(1)
  const [previewMode, setPreviewMode] = useState(false)
  const [leftTab, setLeftTab] = useState<TabId | null>(null)
  const [rightOpen, setRightOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [liveTheme, setLiveTheme] = useState<Record<string, unknown>>(themeOverrides ?? {})
  const serializeRef = useRef<(() => string) | null>(null)

  const handleViewportChange = useCallback((v: "desktop" | "tablet" | "mobile") => setViewport(v), [])

  const handlePageChange = useCallback(async (pageId: string, _json: string | null) => {
    setSwitching(true)
    // 1. Auto-save current page
    if (serializeRef.current && currentPageId) {
      const json = serializeRef.current()
      await saveDraftAction(tenantId, json, currentPageId)
    }
    // 2. Load new page's craft_json
    const result = await loadPageAction(tenantId, pageId)
    setCurrentPageId(pageId)
    setCurrentCraftJson(result.success ? result.craftJson : null)
    setEditorKey((k) => k + 1)
    setRightOpen(true)
    setSwitching(false)
  }, [tenantId, currentPageId])

  // Auto-save draft every 30s
  const handleNodesChange = useCallback(() => {}, [])

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

  return (
    <BreakpointProvider value={viewport === "mobile" ? "mobile" : viewport === "tablet" ? "tablet" : "desktop"}>
      <Editor key={editorKey} resolver={resolver} onRender={RenderNode} onNodesChange={handleNodesChange}>
        <EditorShortcutsProvider onAddSection={() => setLeftTab("add")} />
        <SerializeCapture serializeRef={serializeRef} />
        <EditorActiveProvider>
        <div className="editor-shell flex h-screen flex-col">
          {/* Top Bar */}
          <TopBar
            tenantId={tenantId}
            storeSlug={storeSlug}
            viewport={viewport}
            onViewportChange={handleViewportChange}
            pageId={currentPageId}
            zoom={zoom}
            onZoomChange={setZoom}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            onVersionRestore={async () => {
              if (!currentPageId) return
              const result = await loadPageAction(tenantId, currentPageId)
              setCurrentCraftJson(result.success ? result.craftJson : null)
              setEditorKey((k) => k + 1)
            }}
          />

          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* ─── Left Panel: Icon Rail + Content ─── */}
            {!previewMode && (
            <div className="editor-panel shrink-0 border-r flex" style={{ borderColor: 'var(--editor-border)' }}>
              <LeftPanel activeTab={leftTab} onTabChange={setLeftTab}>
                {{
                  add: <AddSectionPanel />,
                  layers: (
                    <div className="flex flex-col h-full">
                      <SectionTree />
                      <div className="border-t p-3" style={{ borderColor: 'var(--editor-border)' }}>
                        <Button variant="outline" className="w-full gap-2" onClick={() => setLeftTab("add")}>
                          <Plus className="h-4 w-4" /> Add Section
                        </Button>
                      </div>
                    </div>
                  ),
                  pages: (
                    <PagesPanel tenantId={tenantId} currentPageId={currentPageId} onPageChange={handlePageChange} />
                  ),
                  theme: (
                    <div style={{ overflowY: 'auto', height: '100%' }}>
                      <SiteStylesPanel tenantId={tenantId} initial={liveTheme} pageId={currentPageId} onThemeChange={setLiveTheme} />
                    </div>
                  ),
                  assets: <AssetsPanel />,
                }}
              </LeftPanel>
            </div>
            )}

            {/* ─── Center: Canvas + Breadcrumb ─── */}
            <div className="flex flex-1 flex-col overflow-hidden" style={{ minHeight: 0 }}>

            {/* ─── Canvas ─── */}
            <div
              data-editor-canvas
              className="editor-canvas relative flex-1"
              style={{
                overflow: 'hidden', minHeight: 0,
                backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                padding: 24,
              }}
            >
              {switching && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)' }}>
                  <div style={{ fontSize: 13, color: 'var(--editor-text-secondary)', fontWeight: 500 }}>Loading page…</div>
                </div>
              )}
              <div
                className={cn(
                  "mx-auto bg-white",
                  viewport === "mobile" ? "rounded-lg shadow-lg ring-1 ring-black/5" : "shadow-sm ring-1 ring-black/[0.04]"
                )}
                style={{
                  width: viewportWidths[viewport],
                  maxWidth: '100%',
                  height: '100%',
                  overflowY: 'auto',
                  zoom,
                  backgroundColor: 'var(--store-bg, #ffffff)',
                  color: 'var(--store-text, #111827)',
                  fontFamily: 'var(--store-font-body, Inter)',
                  ...themeToVars(liveTheme as Record<string, unknown> ?? {}),
                }}
              >
                {/* Load selected Google Fonts */}
                {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                {!!(liveTheme.headingFont || liveTheme.bodyFont) && <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${[liveTheme.headingFont as string, liveTheme.bodyFont as string].filter((f): f is string => !!f && f !== "System UI").map(f => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`} />}
                {/* Custom CSS from Site Styles */}
                {!!liveTheme.customCss && <style>{liveTheme.customCss as string}</style>}
                  <Frame json={currentCraftJson ?? defaultPageJson()}>
                    <Element canvas is={Container as React.ElementType} />
                  </Frame>
                </div>

              {/* Floating toolbar — positioned over selected block */}
              <FloatingToolbar />
            </div>

            {/* ─── Bottom Breadcrumb ─── */}
            <SelectionBreadcrumb />
            </div>

            {/* ─── Right Panel: Context-Sensitive ─── */}
            {!previewMode && (
            <RightPanel
              tenantId={tenantId}
              seoInitial={seoInitial}
              pageId={currentPageId}
              open={rightOpen}
              onToggle={() => setRightOpen((v) => !v)}
            />
            )}
          </div>

          {/* Add Section is now a left panel tab */}
          <KeyboardShortcuts zoom={zoom} onZoomChange={setZoom} tenantId={tenantId} pageId={currentPageId} />
          <ContextMenu />
        </div>
        </EditorActiveProvider>
      </Editor>
    </BreakpointProvider>
  )
}

/**
 * Right panel — hidden by default, opens via ribbon tab or on block selection.
 */
function RightPanel({
  tenantId,
  seoInitial,
  pageId,
  open,
  onToggle,
}: {
  tenantId: string
  seoInitial: { title: string; description: string; ogImage: string }
  pageId: string | null
  open: boolean
  onToggle: () => void
}) {
  const { selectionCount } = useEditor((state) => ({
    selectionCount: state.events.selected.size,
  }))

  // Auto-open when a block is selected
  useEffect(() => {
    if (selectionCount > 0 && !open) onToggle()
  }, [selectionCount])

  return (
    <div style={{ flexShrink: 0, position: 'relative', overflow: 'visible', height: '100%' }}>
      {/* Ribbon tab */}
      <Button
        variant="outline"
        onClick={onToggle}
        title={open ? "Close panel" : "Open settings"}
        className="absolute top-2 -left-6 z-10 w-6 h-12 rounded-l-md rounded-r-none border border-r-0 text-xs p-0 flex items-center justify-center cursor-pointer"
        style={{ background: 'var(--editor-surface)', borderColor: 'var(--editor-border)', color: 'var(--editor-icon-secondary)', transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s' }}
        onMouseEnter={(e) => { e.currentTarget.style.width = '30px'; e.currentTarget.style.left = '-30px' }}
        onMouseLeave={(e) => { e.currentTarget.style.width = '24px'; e.currentTarget.style.left = '-24px' }}
      >
        {open ? '›' : '‹'}
      </Button>

      {/* Panel content */}
      {open && (
        <div style={{
          width: 280, height: '100%', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--editor-surface)',
          borderLeft: '1px solid var(--editor-border)',
        }}>
          {selectionCount > 1 ? (
            <BatchEditor />
          ) : selectionCount === 1 ? (
            <SettingsPanel />
          ) : (
            <PageSettingsPanel
              tenantId={tenantId}
              seoInitial={seoInitial}
              pageId={pageId}
            />
          )}
        </div>
      )}
    </div>
  )
}

/** Invisible component that registers keyboard shortcuts inside <Editor> */
function EditorShortcutsProvider({ onAddSection }: { onAddSection: () => void }) {
  useEditorShortcuts({ onAddSection })
  return null
}

/** Captures the Craft.js serialize function into a ref for use outside <Editor> */
function SerializeCapture({ serializeRef }: { serializeRef: React.MutableRefObject<(() => string) | null> }) {
  const { query } = useEditor()
  useEffect(() => { serializeRef.current = () => query.serialize() }, [query, serializeRef])
  return null
}
