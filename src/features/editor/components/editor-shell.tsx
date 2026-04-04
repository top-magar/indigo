"use client"

import { Editor, Frame, Element, useEditor } from "@craftjs/core"
import { useState, useCallback, useEffect } from "react"
import { Plus } from "lucide-react"
import { SectionTree } from "./section-tree"
import { AddSectionModal } from "./add-section-modal"
import { LeftPanel, type TabId } from "./left-panel"
import { AssetsPanel } from "./assets-panel"
import { ThemePanel } from "./theme-panel"
import { PageSwitcher } from "./page-switcher"
import { SelectionBreadcrumb } from "./selection-breadcrumb"
import { SettingsPanel } from "./settings-panel"
import { BatchEditor } from "./batch-editor"
import { PageSettingsPanel } from "./page-settings-panel"
import { FloatingToolbar } from "./floating-toolbar"
import { TopBar } from "./top-bar"
import { RenderNode } from "./render-node"
import { Container } from "../blocks/container"
import { TextBlock } from "../blocks/text"
import { resolver } from "../resolver"
import { BreakpointProvider, useBreakpoint } from "../breakpoint-context"
import { useEditorShortcuts } from "../use-editor-shortcuts"
import { EditorActiveProvider } from "../use-node-safe"
import { saveDraftAction } from "../actions"
import { cn } from "@/shared/utils"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { ContextMenu } from "./context-menu"
import "../editor-theme.css"

const viewportWidths: Record<string, string> = {
  desktop: "100%",
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
  const [leftTab, setLeftTab] = useState<TabId>("layers")

  const handleViewportChange = useCallback((v: "desktop" | "tablet" | "mobile") => setViewport(v), [])

  const handlePageChange = useCallback((pageId: string, json: string | null) => {
    setCurrentPageId(pageId)
    setCurrentCraftJson(json)
    setEditorKey((k) => k + 1)
  }, [])

  // Auto-save draft every 30s
  const handleNodesChange = useCallback(() => {}, [])

  return (
    <BreakpointProvider value={viewport === "mobile" ? "mobile" : viewport === "tablet" ? "tablet" : "desktop"}>
      <Editor key={editorKey} resolver={resolver} onRender={RenderNode} onNodesChange={handleNodesChange}>
        <EditorShortcutsProvider onAddSection={() => setAddModalOpen(true)} />
        <EditorActiveProvider>
        <div className="editor-shell flex h-screen flex-col">
          {/* Top Bar */}
          <TopBar
            tenantId={tenantId}
            storeSlug={storeSlug}
            viewport={viewport}
            onViewportChange={handleViewportChange}
            pageId={currentPageId}
            onPageChange={handlePageChange}
            zoom={zoom}
            onZoomChange={setZoom}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
          />

          <div className="flex flex-1 overflow-hidden">
            {/* ─── Left Panel: Icon Rail + Content ─── */}
            {!previewMode && (
            <div className="editor-panel shrink-0 border-r" style={{ borderColor: 'var(--editor-border)' }}>
              <LeftPanel activeTab={leftTab} onTabChange={(tab) => { if (tab === "add") { setAddModalOpen(true); return } setLeftTab(tab) }}>
                {{
                  add: null,
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
                    <div style={{ padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--editor-text)', marginBottom: 8 }}>Pages</div>
                      <PageSwitcher tenantId={tenantId} currentPageId={currentPageId} onPageChange={handlePageChange} />
                    </div>
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
            <div className="flex flex-1 flex-col overflow-hidden">

            {/* ─── Canvas ─── */}
            <div
              data-editor-canvas
              className="editor-canvas relative flex-1 overflow-y-auto"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="p-6" style={{ zoom }}>
                <div
                  className={cn(
                    "mx-auto min-h-[calc(100vh-10rem)] overflow-hidden bg-white transition-[max-width] duration-300",
                    viewport === "mobile" ? "rounded-lg shadow-lg ring-1 ring-black/5" : "shadow-sm ring-1 ring-black/[0.04]"
                  )}
                  style={{
                    maxWidth: viewportWidths[viewport],
                    backgroundColor: 'var(--store-bg, #ffffff)',
                    color: 'var(--store-text, #111827)',
                    fontFamily: 'var(--store-font-body, Inter)',
                    ...themeToVars(themeOverrides as Record<string, unknown> ?? {}),
                  }}
                >
                  <Frame json={currentCraftJson ?? undefined}>
                    <Element canvas is={Container as React.ElementType}>
                      {/* @ts-expect-error Craft.js default props handle typing */}
                      <TextBlock text="Welcome to your store" fontSize={32} color="#000" alignment="center" tagName="h1" />
                      {/* @ts-expect-error Craft.js default props handle typing */}
                      <TextBlock text="Start building by adding sections from the left panel" fontSize={16} color="#666" alignment="center" tagName="p" />
                    </Element>
                  </Frame>
                </div>
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
 * Right panel — shows block settings when a block is selected,
 * page-level settings (theme/SEO/global) when nothing is selected.
 */
function RightPanel({
  tenantId,
  storeSlug,
  seoInitial,
  pageId,
}: {
  tenantId: string
  storeSlug: string
  seoInitial: { title: string; description: string; ogImage: string }
  pageId: string | null
}) {
  const { selectionCount } = useEditor((state) => ({
    selectionCount: state.events.selected.size,
  }))

  return (
    <div className="editor-panel flex w-[280px] shrink-0 flex-col overflow-hidden border-l" style={{ borderColor: 'var(--editor-border)' }}>
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
  )
}

/** Invisible component that registers keyboard shortcuts inside <Editor> */
function EditorShortcutsProvider({ onAddSection }: { onAddSection: () => void }) {
  useEditorShortcuts({ onAddSection })
  return null
}
