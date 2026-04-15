"use client"
import React, { useCallback, useEffect, useReducer, useRef } from "react"
import { useEditorV3Store } from "../../stores/store"

// ── Smart Guides ──

type GuideLine = { orientation: "h" | "v"; position: number }
let _activeGuides: GuideLine[] = []
let _guidesVersion = 0

function computeGuides(el: HTMLElement): GuideLine[] {
  const parent = el.parentElement
  if (!parent) return []
  const rect = el.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  const guides: GuideLine[] = []
  const SNAP = 3

  const siblings = Array.from(parent.children).filter((c) => c !== el && c.hasAttribute("data-ws-id"))
  const edges = {
    top: rect.top - parentRect.top, bottom: rect.bottom - parentRect.top,
    left: rect.left - parentRect.left, right: rect.right - parentRect.left,
    centerX: rect.left - parentRect.left + rect.width / 2,
    centerY: rect.top - parentRect.top + rect.height / 2,
  }

  for (const sib of siblings) {
    const sr = sib.getBoundingClientRect()
    const se = {
      top: sr.top - parentRect.top, bottom: sr.bottom - parentRect.top,
      left: sr.left - parentRect.left, right: sr.right - parentRect.left,
      centerX: sr.left - parentRect.left + sr.width / 2,
      centerY: sr.top - parentRect.top + sr.height / 2,
    }
    if (Math.abs(edges.top - se.top) < SNAP) guides.push({ orientation: "h", position: se.top })
    if (Math.abs(edges.bottom - se.bottom) < SNAP) guides.push({ orientation: "h", position: se.bottom })
    if (Math.abs(edges.centerY - se.centerY) < SNAP) guides.push({ orientation: "h", position: se.centerY })
    if (Math.abs(edges.left - se.left) < SNAP) guides.push({ orientation: "v", position: se.left })
    if (Math.abs(edges.right - se.right) < SNAP) guides.push({ orientation: "v", position: se.right })
    if (Math.abs(edges.centerX - se.centerX) < SNAP) guides.push({ orientation: "v", position: se.centerX })
  }
  return guides
}

export function setActiveGuides(el: HTMLElement | null) {
  if (!el) { _activeGuides = []; _guidesVersion++; return }
  const raw = computeGuides(el)
  const seen = new Set<string>()
  _activeGuides = raw.filter((g) => {
    const key = `${g.orientation}:${Math.round(g.position)}`
    if (seen.has(key)) return false
    seen.add(key); return true
  })
  _guidesVersion++
}

export function SmartGuides() {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  const versionRef = useRef(_guidesVersion)
  useEffect(() => {
    const id = setInterval(() => {
      if (_guidesVersion !== versionRef.current) { versionRef.current = _guidesVersion; forceRender() }
    }, 16)
    return () => clearInterval(id)
  }, [])

  if (_activeGuides.length === 0) return null
  return (
    <>
      {_activeGuides.map((g, i) => (
        <div key={i} style={{
          position: "absolute",
          ...(g.orientation === "h"
            ? { left: 0, right: 0, top: g.position, height: 1 }
            : { top: 0, bottom: 0, left: g.position, width: 1 }),
          background: "#f43f5e", zIndex: 30, pointerEvents: "none", opacity: 0.7,
        }} />
      ))}
    </>
  )
}

// ── Resize Handles ──

const HANDLE_SIZE = 10
const HANDLE_POSITIONS = [
  { key: "tl", cursor: "nwse-resize", top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, dx: -1, dy: -1 },
  { key: "tr", cursor: "nesw-resize", top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, dx: 1, dy: -1 },
  { key: "bl", cursor: "nesw-resize", bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, dx: -1, dy: 1 },
  { key: "br", cursor: "nwse-resize", bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, dx: 1, dy: 1 },
  { key: "t", cursor: "ns-resize", top: -HANDLE_SIZE / 2, left: "50%", dx: 0, dy: -1 },
  { key: "b", cursor: "ns-resize", bottom: -HANDLE_SIZE / 2, left: "50%", dx: 0, dy: 1 },
  { key: "l", cursor: "ew-resize", top: "50%", left: -HANDLE_SIZE / 2, dx: -1, dy: 0 },
  { key: "r", cursor: "ew-resize", top: "50%", right: -HANDLE_SIZE / 2, dx: 1, dy: 0 },
] as const

export function ResizeHandles({ instanceId, wrapperRef }: { instanceId: string; wrapperRef: React.RefObject<HTMLDivElement | null> }) {
  const dragInfo = useRef<{ startX: number; startY: number; startW: number; startH: number; dx: number; dy: number } | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent, dx: number, dy: number) => {
    e.stopPropagation(); e.preventDefault()
    const el = wrapperRef.current
    if (!el) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragInfo.current = { startX: e.clientX, startY: e.clientY, startW: el.offsetWidth, startH: el.offsetHeight, dx, dy }
  }, [wrapperRef])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragInfo.current) return
    const { startX, startY, startW, startH, dx, dy } = dragInfo.current
    const s = useEditorV3Store.getState()
    const sel = s.styleSourceSelections.get(instanceId)
    if (!sel) return
    let ssId = sel.values[0]
    if (!ssId) ssId = s.createLocalStyleSource(instanceId)
    if (dx !== 0) s.setStyleDeclaration(ssId, s.currentBreakpointId, "width", { type: "unit", value: Math.max(20, Math.round(startW + (e.clientX - startX) * dx)), unit: "px" })
    if (dy !== 0) s.setStyleDeclaration(ssId, s.currentBreakpointId, "height", { type: "unit", value: Math.max(20, Math.round(startH + (e.clientY - startY) * dy)), unit: "px" })
    if (wrapperRef.current) setActiveGuides(wrapperRef.current)
  }, [instanceId, wrapperRef])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragInfo.current) {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      dragInfo.current = null
      setActiveGuides(null)
    }
  }, [])

  return (
    <>
      {HANDLE_POSITIONS.map(({ key, cursor, dx, dy, ...pos }) => (
        <div key={key}
          onPointerDown={(e) => handlePointerDown(e, dx, dy)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            position: "absolute", ...pos as React.CSSProperties,
            width: HANDLE_SIZE, height: HANDLE_SIZE,
            background: "#fff", border: "1.5px solid #3b82f6", borderRadius: 2,
            cursor, zIndex: 20,
          } as React.CSSProperties}
        />
      ))}
    </>
  )
}

// ── Distance Indicators ──

export function DistanceIndicators({ wrapperRef }: { wrapperRef: React.RefObject<HTMLDivElement | null> }) {
  const el = wrapperRef.current
  if (!el) return null
  const parent = el.parentElement
  if (!parent) return null
  const r = el.getBoundingClientRect()
  const pr = parent.getBoundingClientRect()

  const distTop = Math.round(r.top - pr.top)
  const distBottom = Math.round(pr.bottom - r.bottom)
  const distLeft = Math.round(r.left - pr.left)
  const distRight = Math.round(pr.right - r.right)

  const lineColor = "#f43f5e"
  const badge: React.CSSProperties = { position: "absolute", fontSize: 9, fontFamily: "system-ui", background: lineColor, color: "#fff", padding: "0 4px", borderRadius: 3, lineHeight: "16px", fontWeight: 600, pointerEvents: "none", zIndex: 25, whiteSpace: "nowrap" }
  const line: React.CSSProperties = { position: "absolute", background: lineColor, pointerEvents: "none", zIndex: 24, opacity: 0.5 }

  return (
    <>
      {distTop > 2 && <><div style={{ ...line, left: "50%", width: 1, top: -distTop, height: distTop }} /><div style={{ ...badge, left: "50%", top: -distTop / 2, transform: "translate(-50%,-50%)" }}>{distTop}</div></>}
      {distBottom > 2 && <><div style={{ ...line, left: "50%", width: 1, bottom: -distBottom, height: distBottom }} /><div style={{ ...badge, left: "50%", bottom: -distBottom / 2, transform: "translate(-50%,50%)" }}>{distBottom}</div></>}
      {distLeft > 2 && <><div style={{ ...line, top: "50%", height: 1, left: -distLeft, width: distLeft }} /><div style={{ ...badge, top: "50%", left: -distLeft / 2, transform: "translate(-50%,-50%)" }}>{distLeft}</div></>}
      {distRight > 2 && <><div style={{ ...line, top: "50%", height: 1, right: -distRight, width: distRight }} /><div style={{ ...badge, top: "50%", right: -distRight / 2, transform: "translate(50%,-50%)" }}>{distRight}</div></>}
    </>
  )
}

// ── Spacing Overlay ──

export function SpacingOverlay({ instanceId, wrapperRef }: { instanceId: string; wrapperRef: React.RefObject<HTMLDivElement | null> }) {
  const dragInfo = useRef<{ side: string; startY: number; startX: number; startVal: number } | null>(null)
  const [, forceRender] = useReducer((c: number) => c + 1, 0)

  const el = wrapperRef.current?.firstElementChild as HTMLElement | null
  if (!el) return null
  const cs = getComputedStyle(el)

  const pad = { top: parseFloat(cs.paddingTop), right: parseFloat(cs.paddingRight), bottom: parseFloat(cs.paddingBottom), left: parseFloat(cs.paddingLeft) }
  const mar = { top: parseFloat(cs.marginTop), right: parseFloat(cs.marginRight), bottom: parseFloat(cs.marginBottom), left: parseFloat(cs.marginLeft) }

  const setSpacing = (prop: string, value: number) => {
    const s = useEditorV3Store.getState()
    const sel = s.styleSourceSelections.get(instanceId)
    if (!sel) return
    let ssId = sel.values[0]
    if (!ssId) ssId = s.createLocalStyleSource(instanceId)
    s.setStyleDeclaration(ssId, s.currentBreakpointId, prop, { type: "unit", value: Math.max(0, Math.round(value)), unit: "px" })
  }

  const onPointerDown = (e: React.PointerEvent, side: string, isMargin: boolean) => {
    e.stopPropagation(); e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    const prop = `${isMargin ? "margin" : "padding"}${side.charAt(0).toUpperCase() + side.slice(1)}`
    const startVal = isMargin ? mar[side as keyof typeof mar] : pad[side as keyof typeof pad]
    dragInfo.current = { side, startY: e.clientY, startX: e.clientX, startVal }
    const onMove = (ev: PointerEvent) => {
      if (!dragInfo.current) return
      const isVert = side === "top" || side === "bottom"
      const delta = isVert ? (ev.clientY - dragInfo.current.startY) * (side === "top" ? -1 : 1)
        : (ev.clientX - dragInfo.current.startX) * (side === "left" ? -1 : 1)
      setSpacing(prop, dragInfo.current.startVal + delta)
      forceRender()
    }
    const onUp = () => { dragInfo.current = null; document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp) }
    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
  }

  const padColor = "rgba(34,197,94,0.15)"
  const marColor = "rgba(251,146,60,0.15)"
  const labelStyle: React.CSSProperties = { position: "absolute", fontSize: 9, fontFamily: "system-ui", pointerEvents: "none", color: "#666", fontWeight: 500 }

  return (
    <>
      {pad.top > 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: pad.top, background: padColor, cursor: "ns-resize", zIndex: 15 }} onPointerDown={(e) => onPointerDown(e, "top", false)}><span style={{ ...labelStyle, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>{Math.round(pad.top)}</span></div>}
      {pad.bottom > 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: pad.bottom, background: padColor, cursor: "ns-resize", zIndex: 15 }} onPointerDown={(e) => onPointerDown(e, "bottom", false)}><span style={{ ...labelStyle, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>{Math.round(pad.bottom)}</span></div>}
      {pad.left > 0 && <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pad.left, background: padColor, cursor: "ew-resize", zIndex: 15 }} onPointerDown={(e) => onPointerDown(e, "left", false)}><span style={{ ...labelStyle, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>{Math.round(pad.left)}</span></div>}
      {pad.right > 0 && <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: pad.right, background: padColor, cursor: "ew-resize", zIndex: 15 }} onPointerDown={(e) => onPointerDown(e, "right", false)}><span style={{ ...labelStyle, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>{Math.round(pad.right)}</span></div>}
      {mar.top > 0 && <div style={{ position: "absolute", top: -mar.top, left: -mar.left, right: -mar.right, height: mar.top, background: marColor, cursor: "ns-resize", zIndex: 14 }} onPointerDown={(e) => onPointerDown(e, "top", true)}><span style={{ ...labelStyle, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>{Math.round(mar.top)}</span></div>}
      {mar.bottom > 0 && <div style={{ position: "absolute", bottom: -mar.bottom, left: -mar.left, right: -mar.right, height: mar.bottom, background: marColor, cursor: "ns-resize", zIndex: 14 }} onPointerDown={(e) => onPointerDown(e, "bottom", true)}><span style={{ ...labelStyle, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>{Math.round(mar.bottom)}</span></div>}
    </>
  )
}

// ── Drop Line ──

export function DropLine({ container, position }: { container: HTMLElement | null; position: number }) {
  if (!container) return null
  const children = Array.from(container.querySelectorAll(":scope > [data-ws-id], :scope > * > [data-ws-id]"))
  const style = container.firstElementChild ? getComputedStyle(container.firstElementChild) : null
  const isRow = style?.display === "flex" && (style.flexDirection === "row" || style.flexDirection === "row-reverse")

  let lineStyle: React.CSSProperties
  if (children.length === 0 || position === 0) {
    lineStyle = isRow
      ? { position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#3b82f6", borderRadius: 2, zIndex: 20, pointerEvents: "none" }
      : { position: "absolute", left: 0, right: 0, top: 0, height: 3, background: "#3b82f6", borderRadius: 2, zIndex: 20, pointerEvents: "none" }
  } else {
    const target = children[Math.min(position, children.length) - 1]
    if (!target) return null
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    lineStyle = isRow
      ? { position: "absolute", left: targetRect.right - containerRect.left, top: 0, bottom: 0, width: 3, background: "#3b82f6", borderRadius: 2, zIndex: 20, pointerEvents: "none" }
      : { position: "absolute", left: 0, right: 0, top: targetRect.bottom - containerRect.top, height: 3, background: "#3b82f6", borderRadius: 2, zIndex: 20, pointerEvents: "none" }
  }
  return <div style={lineStyle} />
}

// ── Auto Layout Suggestion ──

export function AutoLayoutSuggestion({ instanceId }: { instanceId: string; wrapperRef: React.RefObject<HTMLDivElement | null> }) {
  const s = useEditorV3Store.getState()
  const inst = s.instances.get(instanceId)
  if (!inst) return null
  const childIds = inst.children.filter((c) => c.type === "id")
  if (childIds.length < 2) return null

  const sel = s.styleSourceSelections.get(instanceId)
  if (sel) {
    for (const ssId of sel.values) {
      for (const decl of s.styleDeclarations.values()) {
        if (decl.styleSourceId === ssId && decl.property === "display" && !decl.state) {
          const v = decl.value.type === "keyword" ? decl.value.value : ""
          if (v === "flex" || v === "grid" || v === "inline-flex" || v === "inline-grid") return null
        }
      }
    }
  }

  const applyLayout = (dir: "row" | "column") => {
    let ssId = sel?.values[0]
    if (!ssId) ssId = s.createLocalStyleSource(instanceId)
    s.setStyleDeclaration(ssId, s.currentBreakpointId, "display", { type: "keyword", value: "flex" })
    s.setStyleDeclaration(ssId, s.currentBreakpointId, "flexDirection", { type: "keyword", value: dir })
    s.setStyleDeclaration(ssId, s.currentBreakpointId, "gap", { type: "unit", value: 16, unit: "px" })
  }

  return (
    <div style={{ position: "absolute", bottom: -32, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4, zIndex: 25, whiteSpace: "nowrap" }}>
      <button onClick={() => applyLayout("row")} style={{ fontSize: 10, fontFamily: "system-ui", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, padding: "3px 8px", cursor: "pointer", fontWeight: 600 }}>→ Flex Row</button>
      <button onClick={() => applyLayout("column")} style={{ fontSize: 10, fontFamily: "system-ui", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, padding: "3px 8px", cursor: "pointer", fontWeight: 600 }}>↓ Flex Column</button>
    </div>
  )
}
