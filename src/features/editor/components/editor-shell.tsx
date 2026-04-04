"use client"

import { Editor, Frame, Element, useEditor } from "@craftjs/core"
import { useState, useCallback, useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { SectionTree } from "./section-tree"
import { AddSectionModal } from "./add-section-modal"
import { LeftPanel, type TabId } from "./left-panel"
import { AssetsPanel } from "./assets-panel"
import { ThemePanel } from "./theme-panel"
import { PagesPanel } from "./pages-panel"
import { SelectionBreadcrumb } from "./selection-breadcrumb"
import { SettingsPanel } from "./settings-panel"
import { BatchEditor } from "./batch-editor"
import { PageSettingsPanel } from "./page-settings-panel"
import { FloatingToolbar } from "./floating-toolbar"
import { TopBar } from "./top-bar"
import { RenderNode } from "./render-node"
import { Container } from "../blocks/container"
import { TextBlock } from "../blocks/text"
import { HeaderBlock } from "../blocks/header"
import { FooterBlock } from "../blocks/footer"
import { resolver } from "../resolver"
import { BreakpointProvider, useBreakpoint } from "../breakpoint-context"
import { useEditorShortcuts } from "../use-editor-shortcuts"
import { EditorActiveProvider } from "../use-node-safe"
import { saveDraftAction, loadPageAction } from "../actions"
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
  if (t?.borderRadius) vars["--store-radius"] = `${t.borderRadius}px`
  return vars as React.CSSProperties
}

export function EditorShell({ tenantId, storeSlug, craftJson, themeOverrides, seoInitial, pageId: initialPageId }: EditorShellProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [currentPageId, setCurrentPageId] = useState(initialPageId)
  const [editorKey, setEditorKey] = useState(0)
  const [currentCraftJson, setCurrentCraftJson] = useState(craftJson)
  const [zoom, setZoom] = useState(1)
  const [previewMode, setPreviewMode] = useState(false)
  const [leftTab, setLeftTab] = useState<TabId | null>(null)
  const [rightOpen, setRightOpen] = useState(false)
  const serializeRef = useRef<(() => string) | null>(null)

  const handleViewportChange = useCallback((v: "desktop" | "tablet" | "mobile") => setViewport(v), [])

  const handlePageChange = useCallback(async (pageId: string, _json: string | null) => {
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
  }, [tenantId, currentPageId])

  // Auto-save draft every 30s
  const handleNodesChange = useCallback(() => {}, [])

  return (
    <BreakpointProvider value={viewport === "mobile" ? "mobile" : viewport === "tablet" ? "tablet" : "desktop"}>
      <Editor key={editorKey} resolver={resolver} onRender={RenderNode} onNodesChange={handleNodesChange}>
        <EditorShortcutsProvider onAddSection={() => setAddModalOpen(true)} />
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
          />

          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* ─── Left Panel: Icon Rail + Content ─── */}
            {!previewMode && (
            <div className="editor-panel shrink-0 border-r" style={{ display: 'flex', borderColor: 'var(--editor-border)' }}>
              <LeftPanel activeTab={leftTab} onTabChange={(tab) => { if (tab === "add") { setAddModalOpen(true); return } setLeftTab(tab) }}>
                {{
                  layers: (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <SectionTree />
                      <div className="border-t p-3" style={{ borderColor: 'var(--editor-border)' }}>
                        <button onClick={() => setAddModalOpen(true)} className="add-section-btn flex w-full items-center justify-center gap-2">
                          <Plus className="h-4 w-4" /> Add Section
                        </button>
                      </div>
                    </div>
                  ),
                  pages: (
                    <PagesPanel tenantId={tenantId} currentPageId={currentPageId} onPageChange={handlePageChange} />
                  ),
                  theme: (
                    <div style={{ overflowY: 'auto', height: '100%' }}>
                      <ThemePanel tenantId={tenantId} initial={themeOverrides ?? {}} pageId={currentPageId} />
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
                  ...themeToVars(themeOverrides as Record<string, unknown> ?? {}),
                }}
              >
                  <Frame json={currentCraftJson ?? undefined}>
                    <Element canvas is={Container as React.ElementType}>
                      {/* @ts-expect-error Craft.js default props */}
                      <HeaderBlock />
                      {/* @ts-expect-error Craft.js default props */}
                      <TextBlock text="Welcome to your store" fontSize={32} color="#000" alignment="center" tagName="h1" />
                      {/* @ts-expect-error Craft.js default props */}
                      <TextBlock text="Start building by adding sections from the left panel" fontSize={16} color="#666" alignment="center" tagName="p" />
                      {/* @ts-expect-error Craft.js default props */}
                      <FooterBlock />
                    </Element>
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
              storeSlug={storeSlug}
              seoInitial={seoInitial}
              pageId={currentPageId}
              open={rightOpen}
              onToggle={() => setRightOpen((v) => !v)}
            />
            )}
          </div>

          <AddSectionModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
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
  storeSlug,
  seoInitial,
  pageId,
  open,
  onToggle,
}: {
  tenantId: string
  storeSlug: string
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
      <button
        onClick={onToggle}
        title={open ? "Close panel" : "Open settings"}
        className="ribbon-tab"
        style={{
          position: 'absolute', top: 8, left: -24, zIndex: 10,
          width: 24, height: 48,
          borderRadius: '6px 0 0 6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--editor-surface)', border: '1px solid var(--editor-border)',
          borderRight: 'none', cursor: 'pointer', color: 'var(--editor-icon-secondary)',
          fontSize: 12,
          transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.width = '30px'; e.currentTarget.style.left = '-30px'; e.currentTarget.style.color = 'var(--editor-text)' }}
        onMouseLeave={(e) => { e.currentTarget.style.width = '24px'; e.currentTarget.style.left = '-24px'; e.currentTarget.style.color = 'var(--editor-icon-secondary)' }}
      >
        {open ? '›' : '‹'}
      </button>

      {/* Panel content */}
      {open && (
        <div style={{
          width: 280, height: '100%', display: 'flex', flexDirection: 'column',
          overflowY: 'auto', background: 'var(--editor-surface)',
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
