"use client"

/**
 * Editor Shell — Main layout for editor v2.
 * Composes: Toolbar (top), BlockPanel (left), Canvas (center), Inspector (right).
 */

import { useEffect } from "react"
import { useEditorStore } from "./store"
import { Toolbar } from "./toolbar"
import { BlockPanel } from "./block-panel"
import { EditorCanvas } from "./canvas"
import { Inspector } from "./inspector"
import { registerBuiltInBlocks } from "../blocks"
import { getNode } from "../core/document"
import { themeToCssVars } from "../core/tokens"
import type { ThemeTokens } from "../core/tokens"
import { BREAKPOINTS } from "../core/tokens"

interface ShellProps {
  theme?: Partial<ThemeTokens>
  initialJson?: string
}

import { loadBuiltInPlugins } from "../plugins"

// Register blocks + plugins once
let registered = false
function ensureBlocks() {
  if (!registered) { registerBuiltInBlocks(); loadBuiltInPlugins(); registered = true }
}

export function EditorShellV2({ theme = {} }: ShellProps) {
  ensureBlocks()

  const { document: doc, selectedId, hoveredId, viewport, zoom, leftPanel, rightPanel, select, hover, apply } = useEditorStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); useEditorStore.getState().undo() }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) { e.preventDefault(); useEditorStore.getState().redo() }
      if (e.key === "Escape") select(null)
      if (e.key === "Backspace" && selectedId && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        apply({ type: "delete_node", nodeId: selectedId })
        select(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedId, select, apply])

  const selectedNode = selectedId ? getNode(doc, selectedId) : null
  const themeVars = themeToCssVars(theme)
  const viewportWidth = { desktop: "1280px", tablet: "768px", mobile: "375px" }[viewport]

  return (
    <div className="flex flex-col h-screen" style={{ "--v2-editor-accent": "#005bd3", "--v2-editor-surface": "#fff", "--v2-editor-border": "#e5e7eb" } as React.CSSProperties}>
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        {leftPanel && (
          <div className="w-56 border-r border-border shrink-0 overflow-hidden" style={{ backgroundColor: "var(--v2-editor-surface)" }}>
            {leftPanel === "blocks" && <BlockPanel />}
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-neutral-100 flex justify-center" style={{ padding: 24 }}>
          <div
            style={{ width: viewportWidth, maxWidth: "100%", zoom, backgroundColor: themeVars["--v2-bg"] || "#fff", color: themeVars["--v2-text"] || "#111827", fontFamily: themeVars["--v2-font-body"] || "Inter", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", ...themeVars as React.CSSProperties }}
          >
            <EditorCanvas document={doc} selectedId={selectedId} hoveredId={hoveredId} onSelect={select} onHover={hover} onDelete={(id) => { apply({ type: "delete_node", nodeId: id }); select(null) }} />
          </div>
        </div>

        {/* Right panel — Inspector */}
        {rightPanel && selectedNode && (
          <div className="w-64 border-l border-border shrink-0 overflow-hidden" style={{ backgroundColor: "var(--v2-editor-surface)" }}>
            <Inspector
              blockType={selectedNode.type}
              props={{ ...selectedNode.props }}
              onPropChange={(key, value) => apply({ type: "update_props", nodeId: selectedId!, props: { [key]: value } })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
