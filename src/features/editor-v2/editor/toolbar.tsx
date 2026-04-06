"use client"

import { Undo2, Redo2, Monitor, Tablet, Smartphone, Grid3x3, ZoomIn, ZoomOut } from "lucide-react"
import { useEditorStore } from "./store"

export function Toolbar() {
  const { viewport, setViewport, zoom, setZoom, showGridlines, toggleGridlines, undo, redo, undoStack, redoStack } = useEditorStore()

  const viewports = [
    { key: "desktop" as const, icon: Monitor, label: "Desktop" },
    { key: "tablet" as const, icon: Tablet, label: "Tablet" },
    { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
  ]

  return (
    <div className="h-11 border-b border-border flex items-center justify-between px-3" style={{ backgroundColor: "var(--v2-editor-surface, #fff)" }}>
      {/* Left: undo/redo */}
      <div className="flex items-center gap-1">
        <ToolBtn icon={Undo2} onClick={undo} disabled={undoStack.length === 0} title="Undo (⌘Z)" />
        <ToolBtn icon={Redo2} onClick={redo} disabled={redoStack.length === 0} title="Redo (⌘⇧Z)" />
      </div>

      {/* Center: viewport + zoom */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5 rounded-md border border-input p-0.5">
          {viewports.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setViewport(key)} title={label}
              className="h-7 w-7 flex items-center justify-center rounded-sm transition-colors"
              style={{ background: viewport === key ? "var(--v2-editor-accent, #005bd3)" : "transparent", color: viewport === key ? "#fff" : undefined }}>
              <Icon size={14} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 rounded-md border border-input p-0.5">
          <ToolBtn icon={ZoomOut} onClick={() => setZoom(zoom - 0.1)} title="Zoom out" />
          <span className="text-[11px] font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <ToolBtn icon={ZoomIn} onClick={() => setZoom(zoom + 0.1)} title="Zoom in" />
        </div>
        <ToolBtn icon={Grid3x3} onClick={toggleGridlines} title="Toggle gridlines"
          style={{ color: showGridlines ? "var(--v2-editor-accent, #005bd3)" : undefined }} />
      </div>

      {/* Right: placeholder for save/publish */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">v2</span>
      </div>
    </div>
  )
}

function ToolBtn({ icon: Icon, onClick, disabled, title, style }: { icon: React.ComponentType<{ size?: number }>; onClick: () => void; disabled?: boolean; title: string; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-accent disabled:opacity-30 transition-colors"
      style={style}>
      <Icon size={14} />
    </button>
  )
}
