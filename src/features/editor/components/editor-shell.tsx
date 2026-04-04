"use client"

import { Editor, Frame, Element, useEditor } from "@craftjs/core"
import { useState, useCallback, useEffect } from "react"
import { Plus } from "lucide-react"
import { SectionTree } from "./section-tree"
import { AddSectionModal } from "./add-section-modal"
import { SettingsPanel } from "./settings-panel"
import { PageSettingsPanel } from "./page-settings-panel"
import { FloatingToolbar } from "./floating-toolbar"
import { TopBar } from "./top-bar"
import { RenderNode } from "./render-node"
import { Container } from "../blocks/container"
import { TextBlock } from "../blocks/text"
import { resolver } from "../resolver"
import { BreakpointProvider, useBreakpoint } from "../breakpoint-context"
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
  if (t?.primaryColor) vars["--store-color-primary"] = t.primaryColor as string
  if (t?.fontHeading) vars["--store-font-heading"] = t.fontHeading as string
  if (t?.fontBody) vars["--store-font-body"] = t.fontBody as string
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
          />

          <div className="flex flex-1 overflow-hidden">
            {/* ─── Left Panel: Structure ─── */}
            <div className="editor-panel flex w-[240px] shrink-0 flex-col border-r" style={{ borderColor: 'var(--editor-border)' }}>
              <SectionTree />

              {/* Add section button — always at bottom */}
              <div className="border-t p-3" style={{ borderColor: 'var(--editor-border)' }}>
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="add-section-btn flex w-full items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </button>
              </div>
            </div>

            {/* ─── Canvas ─── */}
            <div
              data-editor-canvas
              className="editor-canvas relative flex-1 overflow-y-auto"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(var(--border) / 0.2) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="p-6" style={{ zoom }}>
                <div
                  className={cn(
                    "mx-auto min-h-[calc(100vh-10rem)] overflow-hidden bg-white transition-[max-width] duration-300",
                    viewport === "mobile" ? "rounded-lg shadow-lg ring-1 ring-black/5" : "shadow-sm ring-1 ring-black/[0.04]"
                  )}
                  style={{ maxWidth: viewportWidths[viewport], ...themeToVars(themeOverrides as Record<string, unknown> ?? {}) }}
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

            {/* ─── Right Panel: Context-Sensitive ─── */}
            <RightPanel
              tenantId={tenantId}
              storeSlug={storeSlug}
              themeOverrides={themeOverrides ?? {}}
              seoInitial={seoInitial}
              pageId={currentPageId}
            />
          </div>

          <AddSectionModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
          <KeyboardShortcuts zoom={zoom} onZoomChange={setZoom} tenantId={tenantId} pageId={currentPageId} />
          <ContextMenu />
        </div>
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
  themeOverrides,
  seoInitial,
  pageId,
}: {
  tenantId: string
  storeSlug: string
  themeOverrides: Record<string, unknown>
  seoInitial: { title: string; description: string; ogImage: string }
  pageId: string | null
}) {
  const { hasSelection } = useEditor((state) => ({
    hasSelection: state.events.selected.size > 0,
  }))

  return (
    <div className="editor-panel flex w-[280px] shrink-0 flex-col border-l" style={{ borderColor: 'var(--editor-border)' }}>
      {hasSelection ? (
        <SettingsPanel />
      ) : (
        <PageSettingsPanel
          tenantId={tenantId}
          themeOverrides={themeOverrides}
          seoInitial={seoInitial}
          pageId={pageId}
        />
      )}
    </div>
  )
}
