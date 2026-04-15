"use client"
import React, { useEffect } from "react"
import { useEditorV3Store } from "../../stores/store"

// ── Clipboard ──

let _clipboard: { instanceId: string } | null = null

// ── Context Menu ──

export function CanvasContextMenu({ x, y, instanceId, onClose }: { x: number; y: number; instanceId: string; onClose: () => void }) {
  useEffect(() => {
    const close = () => onClose()
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [onClose])

  const s = useEditorV3Store.getState()
  const menuItem: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "5px 12px",
    fontSize: 11, fontFamily: "system-ui", background: "none", border: "none",
    cursor: "pointer", color: "#1e293b", whiteSpace: "nowrap", gap: 24,
  }
  const shortcut: React.CSSProperties = { fontSize: 10, color: "#94a3b8", fontFamily: "system-ui" }

  const copy = () => { _clipboard = { instanceId }; onClose() }
  const paste = () => {
    if (!_clipboard) return
    const newId = s.duplicateInstance(_clipboard.instanceId)
    if (newId) { s.moveInstance(newId, instanceId, s.instances.get(instanceId)?.children.length ?? 0); s.select(newId) }
    onClose()
  }
  const duplicate = () => { const id = s.duplicateInstance(instanceId); if (id) s.select(id); onClose() }
  const remove = () => { s.removeInstance(instanceId); s.select(null); onClose() }
  const wrapInBox = () => {
    for (const [parentId, parent] of s.instances) {
      const idx = parent.children.findIndex((c) => c.type === "id" && c.value === instanceId)
      if (idx !== -1) { const boxId = s.addInstance(parentId, idx, "Box"); s.moveInstance(instanceId, boxId, 0); s.select(boxId); break }
    }
    onClose()
  }

  const hoverIn = (e: React.MouseEvent) => { (e.target as HTMLElement).style.background = "#f1f5f9" }
  const hoverOut = (e: React.MouseEvent) => { (e.target as HTMLElement).style.background = "none" }

  return (
    <div style={{
      position: "fixed", left: x, top: y, zIndex: 9999,
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6,
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)", padding: "4px 0", minWidth: 160,
    }}>
      <button style={menuItem} onMouseEnter={hoverIn} onMouseLeave={hoverOut} onClick={copy}><span>Copy</span><span style={shortcut}>⌘C</span></button>
      <button style={{ ...menuItem, color: _clipboard ? "#1e293b" : "#94a3b8" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut} onClick={paste}><span>Paste</span><span style={shortcut}>⌘V</span></button>
      <button style={menuItem} onMouseEnter={hoverIn} onMouseLeave={hoverOut} onClick={duplicate}><span>Duplicate</span><span style={shortcut}>⌘D</span></button>
      <div style={{ height: 1, background: "#e2e8f0", margin: "4px 0" }} />
      <button style={menuItem} onMouseEnter={hoverIn} onMouseLeave={hoverOut} onClick={wrapInBox}><span>Wrap in Box</span></button>
      <div style={{ height: 1, background: "#e2e8f0", margin: "4px 0" }} />
      <button style={{ ...menuItem, color: "#dc2626" }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#fef2f2" }} onMouseLeave={hoverOut} onClick={remove}><span>Delete</span><span style={shortcut}>⌫</span></button>
    </div>
  )
}

// ── Quick Actions ──

export function QuickActions({ instanceId }: { instanceId: string }) {
  const s = useEditorV3Store.getState()
  const inst = s.instances.get(instanceId)
  if (!inst) return null

  const btnStyle: React.CSSProperties = {
    fontSize: 11, fontFamily: "system-ui", background: "#1e293b", color: "#fff",
    border: "none", borderRadius: 4, padding: "3px 7px", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap",
    transition: "transform 0.1s, opacity 0.1s",
  }

  const hoverIn = (e: React.MouseEvent) => { (e.target as HTMLElement).style.transform = "scale(1.1)"; (e.target as HTMLElement).style.opacity = "0.9" }
  const hoverOut = (e: React.MouseEvent) => { (e.target as HTMLElement).style.transform = "scale(1)"; (e.target as HTMLElement).style.opacity = "1" }

  const duplicate = () => { s.duplicateInstance(instanceId) }
  const remove = () => { s.removeInstance(instanceId); s.select(null) }
  const moveUp = () => {
    for (const [, parent] of s.instances) {
      const idx = parent.children.findIndex((c) => c.type === "id" && c.value === instanceId)
      if (idx > 0) { const item = parent.children.splice(idx, 1)[0]; parent.children.splice(idx - 1, 0, item); useEditorV3Store.setState({}); break }
    }
  }
  const moveDown = () => {
    for (const [, parent] of s.instances) {
      const idx = parent.children.findIndex((c) => c.type === "id" && c.value === instanceId)
      if (idx !== -1 && idx < parent.children.length - 1) { const item = parent.children.splice(idx, 1)[0]; parent.children.splice(idx + 1, 0, item); useEditorV3Store.setState({}); break }
    }
  }
  const wrapInBox = () => {
    for (const [parentId, parent] of s.instances) {
      const idx = parent.children.findIndex((c) => c.type === "id" && c.value === instanceId)
      if (idx !== -1) { const boxId = s.addInstance(parentId, idx, "Box"); s.moveInstance(instanceId, boxId, 0); s.select(boxId); break }
    }
  }

  return (
    <div style={{ position: "absolute", top: -28, right: 0, display: "flex", gap: 2, zIndex: 25 }}>
      <button style={btnStyle} onClick={moveUp} onMouseEnter={hoverIn} onMouseLeave={hoverOut} title="Move up (↑)">↑</button>
      <button style={btnStyle} onClick={moveDown} onMouseEnter={hoverIn} onMouseLeave={hoverOut} title="Move down (↓)">↓</button>
      <button style={btnStyle} onClick={duplicate} onMouseEnter={hoverIn} onMouseLeave={hoverOut} title="Duplicate (⌘D)">⧉</button>
      <button style={btnStyle} onClick={wrapInBox} onMouseEnter={hoverIn} onMouseLeave={hoverOut} title="Wrap in Box">☐</button>
      <button style={{ ...btnStyle, background: "#dc2626" }} onClick={remove} onMouseEnter={hoverIn} onMouseLeave={hoverOut} title="Delete (⌫)">✕</button>
    </div>
  )
}
