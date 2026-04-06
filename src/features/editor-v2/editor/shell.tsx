"use client"

import { useEffect, useRef, useCallback } from "react"
import { useEditorStore } from "./store"
import { Toolbar } from "./toolbar"
import { BlockPanel } from "./block-panel"
import { EditorCanvas } from "./canvas"
import { Inspector } from "./inspector"
import { ThemePanel } from "./theme-panel"
import { GridOverlay } from "./grid-overlay"
import { LayersPanel } from "./layers-panel"
import { ContextMenu } from "./context-menu"
import { registerBuiltInBlocks } from "../blocks"
import { getNode } from "../core/document"
import { themeToCssVars } from "../core/tokens"
import type { ThemeTokens } from "../core/tokens"
import { loadBuiltInPlugins } from "../plugins"
import { saveDraftAction, publishAction, saveThemeAction } from "@/features/editor/actions"

interface ShellProps {
  tenantId: string
  pageId: string | null
  craftJson?: string | null
  theme?: Partial<ThemeTokens>
}

// Registration guard — blocks only (no window-dependent plugins)
let blocksRegistered = false
function ensureBlocks() {
  if (!blocksRegistered) { registerBuiltInBlocks(); blocksRegistered = true }
}

export function EditorShellV2({ tenantId, pageId, craftJson, theme = {} }: ShellProps) {
  ensureBlocks()

  const store = useEditorStore()
  const { document: doc, selectedId, hoveredId, viewport, zoom, leftPanel, rightPanel, dirty, saving, select, hover, apply, init, loadFromCraftJSON } = store

  // Init on mount — load plugins here (they need window)
  useEffect(() => {
    try { loadBuiltInPlugins() } catch { /* already loaded */ }
    init(tenantId, pageId, theme)
    if (craftJson) {
      try { loadFromCraftJSON(craftJson) } catch (e) { console.warn("[v2] Failed to load craft JSON:", e) }
    }
  }, [tenantId, pageId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Save handler
  const handleSave = useCallback(async () => {
    const s = useEditorStore.getState()
    if (!s.tenantId || s.saving) return
    s.setSaving(true)
    try {
      const craftJsonStr = s.getCraftJSON()
      await saveDraftAction(s.tenantId, craftJsonStr, s.pageId ?? undefined)
      if (Object.keys(s.theme).length > 0) await saveThemeAction(s.tenantId, s.theme as Record<string, unknown>, s.pageId ?? undefined)
      s.markSaved()
    } catch (e) {
      console.error("[v2] Save failed:", e)
    } finally {
      s.setSaving(false)
    }
  }, [])

  const handlePublish = useCallback(async () => {
    await handleSave()
    const s = useEditorStore.getState()
    if (s.tenantId) {
      try { await publishAction(s.tenantId, s.pageId ?? undefined) } catch (e) { console.error("[v2] Publish failed:", e) }
    }
  }, [handleSave])

  // Autosave — 3s after last change
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    if (!dirty) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(handleSave, 3000)
    return () => clearTimeout(timerRef.current)
  }, [dirty, handleSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key === "z" && !e.shiftKey) { e.preventDefault(); useEditorStore.getState().undo() }
      if (meta && e.key === "z" && e.shiftKey) { e.preventDefault(); useEditorStore.getState().redo() }
      if (meta && e.key === "s") { e.preventDefault(); handleSave() }
      if (e.key === "Escape") select(null)
      if (e.key === "Backspace" && selectedId && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault(); apply({ type: "delete_node", nodeId: selectedId }); select(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedId, select, apply, handleSave])

  const selectedNode = selectedId ? (() => { try { return getNode(doc, selectedId) } catch { return null } })() : null
  const themeVars = themeToCssVars(store.theme)
  const viewportWidth = { desktop: "1280px", tablet: "768px", mobile: "375px" }[viewport]

  return (
    <div className="flex flex-col h-screen" style={{ "--v2-editor-accent": "#005bd3", "--v2-editor-surface": "#fff" } as React.CSSProperties}>
      <Toolbar onSave={handleSave} onPublish={handlePublish} onImportV1={craftJson ? () => { try { store.loadFromCraftJSON(craftJson) } catch (e) { console.error("[v2] Import failed:", e) } } : undefined} saving={saving} dirty={dirty} />

      <div className="flex flex-1 overflow-hidden">
        {leftPanel && (
          <div className="w-56 border-r border-border shrink-0 overflow-hidden flex flex-col" style={{ backgroundColor: "var(--v2-editor-surface)" }}>
            <div className="flex border-b border-border shrink-0">
              {(["blocks", "layers", "styles"] as const).map((p) => (
                <button key={p} onClick={() => store.setLeftPanel(p)}
                  className="flex-1 py-1.5 text-[11px] font-medium capitalize transition-colors"
                  style={{ borderBottom: leftPanel === p ? "2px solid var(--v2-editor-accent, #005bd3)" : "2px solid transparent", color: leftPanel === p ? "var(--v2-editor-accent)" : undefined }}>
                  {p === "styles" ? "Site Styles" : p}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {leftPanel === "blocks" && <BlockPanel />}
              {leftPanel === "layers" && <LayersPanel />}
              {leftPanel === "styles" && <ThemePanel />}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-neutral-100 flex justify-center" style={{ padding: 24 }}>
          <div style={{ width: viewportWidth, maxWidth: "100%", zoom, backgroundColor: themeVars["--v2-bg"] || "#fff", color: themeVars["--v2-text"] || "#111827", fontFamily: themeVars["--v2-font-body"] || "Inter", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", position: "relative", ...themeVars as React.CSSProperties }}>
            <GridOverlay />
            <EditorCanvas document={doc} selectedId={selectedId} hoveredId={hoveredId} onSelect={select} onHover={hover} onDelete={(id) => { apply({ type: "delete_node", nodeId: id }); select(null) }} onMove={(nodeId, parentId, index) => apply({ type: "move_node", nodeId, newParentId: parentId, index })} />
          </div>
        </div>

        {rightPanel && selectedNode && (
          <div className="w-64 border-l border-border shrink-0 overflow-hidden" style={{ backgroundColor: "var(--v2-editor-surface)" }}>
            <Inspector blockType={selectedNode.type} props={{ ...selectedNode.props }} onPropChange={(key, value) => apply({ type: "update_props", nodeId: selectedId!, props: { [key]: value } })} />
          </div>
        )}
      </div>
      <ContextMenu />
    </div>
  )
}
