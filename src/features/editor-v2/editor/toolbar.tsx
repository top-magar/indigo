"use client"

import { Undo2, Redo2, Monitor, Tablet, Smartphone, Grid3x3, ZoomIn, ZoomOut, Save, Globe, Loader2, Import } from "lucide-react"
import { useEditorStore } from "./store"

interface ToolbarProps {
  onSave: () => void
  onPublish: () => void
  onImportV1?: () => void
  saving: boolean
  dirty: boolean
}

export function Toolbar({ onSave, onPublish, onImportV1, saving, dirty }: ToolbarProps) {
  const { viewport, setViewport, zoom, setZoom, showGridlines, toggleGridlines, undo, redo, undoStack, redoStack } = useEditorStore()

  const viewports = [
    { key: "desktop" as const, icon: Monitor, label: "Desktop" },
    { key: "tablet" as const, icon: Tablet, label: "Tablet" },
    { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
  ]

  return (
    <div className="h-11 border-b border-border flex items-center justify-between px-3" style={{ backgroundColor: "var(--v2-editor-surface, #fff)" }}>
      <div className="flex items-center gap-1">
        <ToolBtn icon={Undo2} onClick={undo} disabled={undoStack.length === 0} title="Undo (⌘Z)" />
        <ToolBtn icon={Redo2} onClick={redo} disabled={redoStack.length === 0} title="Redo (⌘⇧Z)" />
      </div>

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

      <div className="flex items-center gap-2">
        {dirty && <span className="text-[10px] text-muted-foreground">Unsaved</span>}
        {onImportV1 && (
          <button onClick={onImportV1} title="Import from v1"
            className="h-7 px-2.5 flex items-center gap-1.5 text-[11px] font-medium rounded border border-input bg-background hover:bg-accent transition-colors">
            <Import size={12} /> Import v1
          </button>
        )}
        <button onClick={onSave} disabled={saving || !dirty} title="Save (⌘S)"
          className="h-7 px-2.5 flex items-center gap-1.5 text-[11px] font-medium rounded border border-input bg-background hover:bg-accent disabled:opacity-40 transition-colors">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
        </button>
        <button onClick={onPublish} disabled={saving} title="Publish"
          className="h-7 px-2.5 flex items-center gap-1.5 text-[11px] font-medium rounded text-white transition-colors"
          style={{ backgroundColor: "var(--v2-editor-accent, #005bd3)" }}>
          <Globe size={12} /> Publish
        </button>
      </div>
    </div>
  )
}

function ToolBtn({ icon: Icon, onClick, disabled, title, style }: { icon: React.ComponentType<{ size?: number; className?: string }>; onClick: () => void; disabled?: boolean; title: string; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-accent disabled:opacity-30 transition-colors" style={style}>
      <Icon size={14} />
    </button>
  )
}
