"use client"

import { Editor, Frame, Element, useEditor } from "@craftjs/core"
import { useEffect } from "react"
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
import { useEditorShortcuts } from "../use-editor-shortcuts"
import { EditorActiveProvider } from "../use-node-safe"
import { useEditorState } from "../use-editor-state"
import { themeToVars } from "../theme-to-vars"
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

export function EditorShell({ tenantId, storeSlug, craftJson, themeOverrides, seoInitial, pageId }: EditorShellProps) {
  const state = useEditorState({ tenantId, craftJson, themeOverrides, pageId })

  return (
    <BreakpointProvider value={state.viewport === "mobile" ? "mobile" : state.viewport === "tablet" ? "tablet" : "desktop"}>
      <Editor key={state.editorKey} resolver={resolver} onRender={RenderNode} onNodesChange={() => {}}>
        <EditorShortcutsProvider onAddSection={() => state.setLeftTab("add")} />
        <SerializeCapture serializeRef={state.serializeRef} />
        <EditorActiveProvider>
        <div className="editor-shell flex h-screen flex-col">
          <TopBar
            tenantId={tenantId}
            storeSlug={storeSlug}
            viewport={state.viewport}
            onViewportChange={state.handleViewportChange}
            pageId={state.currentPageId}
            zoom={state.zoom}
            onZoomChange={state.setZoom}
            previewMode={state.previewMode}
            onPreviewModeChange={state.setPreviewMode}
            onVersionRestore={state.handleVersionRestore}
          />

          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* Left Panel */}
            {!state.previewMode && (
            <div className="editor-panel shrink-0 border-r flex border-border">
              <LeftPanel activeTab={state.leftTab} onTabChange={state.setLeftTab}>
                {{
                  add: <AddSectionPanel />,
                  layers: (
                    <div className="flex flex-col h-full">
                      <SectionTree />
                      <div className="border-t p-3 border-border">
                        <Button variant="outline" className="w-full gap-2" onClick={() => state.setLeftTab("add")}>
                          <Plus className="h-4 w-4" /> Add Section
                        </Button>
                      </div>
                    </div>
                  ),
                  pages: <PagesPanel tenantId={tenantId} currentPageId={state.currentPageId} onPageChange={state.handlePageChange} />,
                  theme: <SiteStylesPanel tenantId={tenantId} initial={state.liveTheme} pageId={state.currentPageId} onThemeChange={state.setLiveTheme} />,
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
                  overflow: 'hidden', minHeight: 0,
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
                    "mx-auto bg-white",
                    state.viewport === "mobile" ? "rounded-lg shadow-lg ring-1 ring-black/5" : "shadow-sm ring-1 ring-black/[0.04]"
                  )}
                  style={{
                    width: viewportWidths[state.viewport],
                    maxWidth: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    zoom: state.zoom,
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
                      margin-bottom: var(--store-section-gap-v, 0px);
                      padding-left: var(--store-section-gap-h, 0px);
                      padding-right: var(--store-section-gap-h, 0px);
                    }
                    [data-craft-node-id] [data-craft-node-id] > div { max-width: var(--store-max-width, none); margin-left: auto; margin-right: auto; }
                  `}</style>
                  {!!state.liveTheme.customCss && <style>{state.liveTheme.customCss as string}</style>}
                  <Frame json={state.currentCraftJson ?? defaultPageJson()}>
                    <Element canvas is={Container as React.ElementType} />
                  </Frame>
                </div>
                <FloatingToolbar />
              </div>
              <SelectionBreadcrumb />
            </div>

            {/* Right Panel */}
            {!state.previewMode && (
              <RightPanel
                tenantId={tenantId}
                seoInitial={seoInitial}
                pageId={state.currentPageId}
                open={state.rightOpen}
                onToggle={state.toggleRightPanel}
              />
            )}
          </div>

          <KeyboardShortcuts zoom={state.zoom} onZoomChange={state.setZoom} tenantId={tenantId} pageId={state.currentPageId} />
          <ContextMenu />
        </div>
        </EditorActiveProvider>
      </Editor>
    </BreakpointProvider>
  )
}

function EditorShortcutsProvider({ onAddSection }: { onAddSection: () => void }) {
  useEditorShortcuts({ onAddSection })
  return null
}

function SerializeCapture({ serializeRef }: { serializeRef: React.MutableRefObject<(() => string) | null> }) {
  const { query } = useEditor()
  useEffect(() => { serializeRef.current = () => query.serialize() }, [query, serializeRef])
  return null
}
