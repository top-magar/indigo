"use client"
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { InstanceId, StyleValue, Prop, StyleDeclaration } from "../../types"
import { useEditorV3Store } from "../../stores/store"
import { getComponent, getMeta } from "../../registry/registry"
import { InlineRichText } from "../components/inline-rich-text"

function styleValueToCSS(v: StyleValue): string {
  switch (v.type) {
    case "unit": return `${v.value}${v.unit}`
    case "keyword": return v.value
    case "rgb": return `rgba(${v.r},${v.g},${v.b},${v.a})`
    case "unparsed": return v.value
    case "var": return v.fallback ? `var(${v.value}, ${styleValueToCSS(v.fallback)})` : `var(${v.value})`
  }
}

function useForceRenderOnStoreChange() {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => useEditorV3Store.subscribe(forceRender), [])
}

/** Targeted subscription — only re-renders when data relevant to this instance changes */
function useCanvasInstance(instanceId: InstanceId) {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => {
    let prev = snapshotFor(instanceId)
    return useEditorV3Store.subscribe(() => {
      const next = snapshotFor(instanceId)
      if (next !== prev) { prev = next; forceRender() }
    })
  }, [instanceId])
}

function snapshotFor(id: InstanceId): string {
  const s = useEditorV3Store.getState()
  const inst = s.instances.get(id)
  if (!inst) return ""
  const sel = s.selectedInstanceIds.has(id) ? "s" : s.hoveredInstanceId === id ? "h" : ""
  return `${inst.children.length}:${s.currentBreakpointId}:${sel}:${_storeVersion}`
}

function EditableText({ instanceId, index, value }: { instanceId: InstanceId; index: number; value: string }) {
  const [editing, setEditing] = useState(false)

  const handleSave = useCallback((html: string) => {
    if (html !== value) useEditorV3Store.getState().setTextChild(instanceId, index, html)
    setEditing(false)
  }, [instanceId, index, value])

  if (!editing) {
    return (
      <span onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }} style={{ cursor: "text" }}
        dangerouslySetInnerHTML={{ __html: value }} />
    )
  }

  return (
    <span onClick={(e) => e.stopPropagation()} style={{ display: "inline-block", minWidth: 20 }}>
      <InlineRichText instanceId={instanceId} initialContent={value} onSave={handleSave} />
    </span>
  )
  
}

// Cached indexes — version-counter based invalidation
let _declVersion = -1
let _declIndex: Map<string, StyleDeclaration[]> = new Map()
let _propsVersion = -1
let _propsIndex: Map<string, Prop[]> = new Map()
let _storeVersion = 0

// Bump version on every store mutation
useEditorV3Store.subscribe(() => { _storeVersion++ })

function getDeclIndex(s: { styleDeclarations: Map<string, StyleDeclaration> }): Map<string, StyleDeclaration[]> {
  if (_storeVersion !== _declVersion) {
    _declVersion = _storeVersion
    const idx = new Map<string, StyleDeclaration[]>()
    for (const decl of s.styleDeclarations.values()) {
      const list = idx.get(decl.styleSourceId)
      if (list) list.push(decl)
      else idx.set(decl.styleSourceId, [decl])
    }
    _declIndex = idx
  }
  return _declIndex
}

function getPropsIndex(s: { props: Map<string, Prop> }): Map<string, Prop[]> {
  if (_storeVersion !== _propsVersion) {
    _propsVersion = _storeVersion
    const idx = new Map<string, Prop[]>()
    for (const p of s.props.values()) {
      const list = idx.get(p.instanceId)
      if (list) list.push(p)
      else idx.set(p.instanceId, [p])
    }
    _propsIndex = idx
  }
  return _propsIndex
}

function CanvasInstance({ instanceId }: { instanceId: InstanceId }) {
  useCanvasInstance(instanceId)
  const s = useEditorV3Store.getState()

  const instance = s.instances.get(instanceId)
  if (!instance) return null

  const Component = getComponent(instance.component)
  if (!Component) return <div style={{ padding: 8, border: "1px dashed #ef4444", fontSize: 11, color: "#ef4444", borderRadius: 4 }}>Unknown: {instance.component}</div>

  const props: Record<string, unknown> = {}
  const propsIdx = getPropsIndex(s)
  for (const p of propsIdx.get(instanceId) ?? []) {
    props[p.name] = p.value
  }

  const selection = s.styleSourceSelections.get(instanceId)
  let style: React.CSSProperties | undefined
  if (selection) {
    const css: Record<string, string> = {}
    const declIdx = getDeclIndex(s)
    for (const ssId of selection.values) {
      for (const decl of declIdx.get(ssId) ?? []) {
        if (decl.breakpointId === s.currentBreakpointId && !decl.state) {
          css[decl.property] = styleValueToCSS(decl.value)
        }
      }
    }
    if (Object.keys(css).length > 0) style = css as React.CSSProperties
  }

  const isSelected = s.selectedInstanceIds.has(instanceId)
  const isHovered = s.hoveredInstanceId === instanceId && !isSelected

  const children = instance.children.map((child, i) => {
    if (child.type === "id") return <CanvasInstance key={child.value} instanceId={child.value} />
    if (child.type === "text") return <EditableText key={i} instanceId={instanceId} index={i} value={child.value} />
    return null
  })

  const hasChildren = instance.children.length > 0
  const meta = getMeta(instance.component)
  const isContainer = meta?.contentModel.children && meta.contentModel.children.length > 0

  return (
    <CanvasWrapper instanceId={instanceId} isSelected={isSelected} isHovered={isHovered} label={instance.label ?? instance.component} childCount={instance.children.length}>
      <Component {...props} style={style}>
        {hasChildren ? children : isContainer ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px 0", border: "1.5px dashed #d1d5db", borderRadius: 6,
            fontSize: 11, color: "#9ca3af", letterSpacing: 0.3,
          }}>
            + Drop here
          </div>
        ) : undefined}
      </Component>
    </CanvasWrapper>
  )
}

/** Calculate drop position among siblings based on mouse coordinates */
function getDropPosition(container: HTMLElement, clientX: number, clientY: number): number {
  const children = Array.from(container.children).filter(
    (el) => el.hasAttribute("data-ws-id") || el.querySelector("[data-ws-id]")
  )
  if (children.length === 0) return 0

  // Detect flex direction
  const style = getComputedStyle(container)
  const isRow = style.flexDirection === "row" || style.flexDirection === "row-reverse" ||
    (style.display === "grid" && style.gridAutoFlow !== "row")
  const isVertical = !isRow

  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect()
    const mid = isVertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2
    const cursor = isVertical ? clientY : clientX
    if (cursor < mid) return i
  }
  return children.length
}

/** Lock ancestor heights to prevent layout collapse during drag */
function lockAncestorSizes(el: HTMLElement): Array<{ el: HTMLElement; prev: string }> {
  const locked: Array<{ el: HTMLElement; prev: string }> = []
  let current = el.parentElement
  while (current && !current.hasAttribute("data-ws-canvas-root")) {
    const computed = getComputedStyle(current)
    if (computed.height === "auto" || computed.height === "") {
      locked.push({ el: current, prev: current.style.height })
      current.style.height = computed.height === "auto" ? `${current.offsetHeight}px` : computed.height
    }
    current = current.parentElement
  }
  return locked
}

function unlockAncestorSizes(locked: Array<{ el: HTMLElement; prev: string }>) {
  for (const { el, prev } of locked) el.style.height = prev
}

function CanvasWrapper({ instanceId, isSelected, isHovered, label, childCount, children }: {
  instanceId: string; isSelected: boolean; isHovered: boolean; label: string; childCount: number; children: React.ReactNode
}) {
  const [dropPosition, setDropPosition] = useState<number | null>(null)
  const lockedRef = useRef<Array<{ el: HTMLElement; prev: string }>>([])
  const dragRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.shiftKey) {
      useEditorV3Store.getState().toggleSelect(instanceId)
    } else {
      useEditorV3Store.getState().select(instanceId)
    }
  }, [instanceId])

  // Drag-to-move for absolutely positioned elements
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isSelected || e.button !== 0) return
    const s = useEditorV3Store.getState()
    const sel = s.styleSourceSelections.get(instanceId)
    if (!sel) return
    let posValue: string | undefined
    for (const ssId of sel.values) {
      for (const decl of s.styleDeclarations.values()) {
        if (decl.styleSourceId === ssId && decl.property === "position" && !decl.state) {
          posValue = decl.value.type === "keyword" ? decl.value.value : undefined
        }
      }
    }
    if (posValue !== "absolute" && posValue !== "fixed") return
    let left = 0, top = 0
    for (const ssId of sel.values) {
      for (const decl of s.styleDeclarations.values()) {
        if (decl.styleSourceId === ssId && !decl.state) {
          if (decl.property === "left" && decl.value.type === "unit") left = decl.value.value
          if (decl.property === "top" && decl.value.type === "unit") top = decl.value.value
        }
      }
    }
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, startLeft: left, startTop: top }
  }, [instanceId, isSelected])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    const s = useEditorV3Store.getState()
    const sel = s.styleSourceSelections.get(instanceId)
    if (!sel) return
    const ssId = sel.values[0]
    if (!ssId) return
    s.setStyleDeclaration(ssId, s.currentBreakpointId, "left", { type: "unit", value: Math.round(dragRef.current.startLeft + dx), unit: "px" })
    s.setStyleDeclaration(ssId, s.currentBreakpointId, "top", { type: "unit", value: Math.round(dragRef.current.startTop + dy), unit: "px" })
    if (wrapperRef.current) setActiveGuides(wrapperRef.current)
  }, [instanceId])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragRef.current) {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      dragRef.current = null
      setActiveGuides(null)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("component-name") && !e.dataTransfer.types.includes("instance-id")) return
    e.preventDefault(); e.stopPropagation()
    // Lock ancestors on first dragover
    if (lockedRef.current.length === 0 && wrapperRef.current) {
      lockedRef.current = lockAncestorSizes(wrapperRef.current)
    }
    // Calculate positional drop index
    const container = wrapperRef.current?.querySelector("[data-ws-id] > *") ?? wrapperRef.current
    if (container) {
      const pos = getDropPosition(container as HTMLElement, e.clientX, e.clientY)
      setDropPosition(pos)
    } else {
      setDropPosition(0)
    }
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropPosition(null)
    unlockAncestorSizes(lockedRef.current)
    lockedRef.current = []
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    const insertAt = dropPosition ?? childCount
    setDropPosition(null)
    unlockAncestorSizes(lockedRef.current)
    lockedRef.current = []
    const s = useEditorV3Store.getState()
    const comp = e.dataTransfer.getData("component-name")
    const dragId = e.dataTransfer.getData("instance-id")
    if (comp) { const id = s.addInstance(instanceId, insertAt, comp); s.select(id) }
    else if (dragId && dragId !== instanceId) { s.moveInstance(dragId, instanceId, insertAt); s.select(dragId) }
  }, [instanceId, childCount, dropPosition])

  // Canvas drag reorder — selected elements become draggable
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("instance-id", instanceId)
    e.dataTransfer.effectAllowed = "move"
    // Lock ancestors immediately
    if (wrapperRef.current) lockedRef.current = lockAncestorSizes(wrapperRef.current)
  }, [instanceId])

  const handleDragEnd = useCallback(() => {
    setDropPosition(null)
    unlockAncestorSizes(lockedRef.current)
    lockedRef.current = []
  }, [])

  const outlineStyle = isSelected
    ? "2px solid #3b82f6"
    : isHovered
      ? "1.5px solid #93c5fd"
      : dropPosition !== null
        ? "2px dashed #3b82f6"
        : undefined

  return (
    <div
      ref={wrapperRef}
      draggable={isSelected}
      style={{ position: "relative", outline: outlineStyle, outlineOffset: -1, cursor: dragRef.current ? "grabbing" : isSelected ? "grab" : "default" }}
      data-ws-id={instanceId}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => useEditorV3Store.getState().hover(instanceId)}
      onMouseLeave={() => useEditorV3Store.getState().hover(null)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {/* Selection label — inside the element to avoid clipping */}
      {isSelected && (
        <div style={{
          position: "absolute", top: 0, left: 0,
          background: "#3b82f6", color: "#fff", fontSize: 10, fontFamily: "system-ui, sans-serif",
          padding: "1px 6px", borderRadius: "0 0 4px 0",
          pointerEvents: "none", zIndex: 10, lineHeight: "16px", fontWeight: 500,
          opacity: 0.9,
        }}>
          {label}
        </div>
      )}
      {/* Resize handles */}
      {isSelected && <ResizeHandles instanceId={instanceId} wrapperRef={wrapperRef} />}
      {/* Drop indicator — blue line at insertion point */}
      {dropPosition !== null && (
        <DropLine container={wrapperRef.current} position={dropPosition} />
      )}
    </div>
  )
}

const HANDLE_SIZE = 8
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

function ResizeHandles({ instanceId, wrapperRef }: { instanceId: string; wrapperRef: React.RefObject<HTMLDivElement | null> }) {
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
    if (dx !== 0) {
      const newW = Math.max(20, startW + (e.clientX - startX) * dx)
      s.setStyleDeclaration(ssId, s.currentBreakpointId, "width", { type: "unit", value: Math.round(newW), unit: "px" })
    }
    if (dy !== 0) {
      const newH = Math.max(20, startH + (e.clientY - startY) * dy)
      s.setStyleDeclaration(ssId, s.currentBreakpointId, "height", { type: "unit", value: Math.round(newH), unit: "px" })
    }
    if (wrapperRef.current) setActiveGuides(wrapperRef.current)
  }, [instanceId])

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

function DropLine({ container, position }: { container: HTMLElement | null; position: number }) {
  if (!container) return null
  const children = Array.from(container.querySelectorAll(":scope > [data-ws-id], :scope > * > [data-ws-id]"))
  const style = container.firstElementChild ? getComputedStyle(container.firstElementChild) : null
  const isRow = style?.display === "flex" && (style.flexDirection === "row" || style.flexDirection === "row-reverse")

  let lineStyle: React.CSSProperties
  if (children.length === 0 || position === 0) {
    // Top/left of container
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

const canvasWidths: Record<string, number | undefined> = {
  "bp-large": 1440,
  "bp-laptop": 1280,
  "bp-base": undefined,
  "bp-tablet": 768,
  "bp-mobile-land": 480,
  "bp-mobile": 375,
}

const IFRAME_SRCDOC = `<!DOCTYPE html>
<html><head>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; min-height: 100vh; }
  #canvas-root { min-height: 100vh; }
</style>
</head><body><div id="canvas-root"></div></body></html>`

// ── Smart Guides ──────────────────────────────────────────────────────────────
type GuideLine = { orientation: "h" | "v"; position: number }
let _activeGuides: GuideLine[] = []
let _guidesVersion = 0

function computeGuides(el: HTMLElement): GuideLine[] {
  const parent = el.parentElement
  if (!parent) return []
  const rect = el.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  const guides: GuideLine[] = []
  const SNAP = 3 // px threshold

  const siblings = Array.from(parent.children).filter((c) => c !== el && c.hasAttribute("data-ws-id"))
  const edges = {
    top: rect.top - parentRect.top,
    bottom: rect.bottom - parentRect.top,
    left: rect.left - parentRect.left,
    right: rect.right - parentRect.left,
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
    // Horizontal alignments
    if (Math.abs(edges.top - se.top) < SNAP) guides.push({ orientation: "h", position: se.top })
    if (Math.abs(edges.bottom - se.bottom) < SNAP) guides.push({ orientation: "h", position: se.bottom })
    if (Math.abs(edges.centerY - se.centerY) < SNAP) guides.push({ orientation: "h", position: se.centerY })
    // Vertical alignments
    if (Math.abs(edges.left - se.left) < SNAP) guides.push({ orientation: "v", position: se.left })
    if (Math.abs(edges.right - se.right) < SNAP) guides.push({ orientation: "v", position: se.right })
    if (Math.abs(edges.centerX - se.centerX) < SNAP) guides.push({ orientation: "v", position: se.centerX })
  }
  return guides
}

function setActiveGuides(el: HTMLElement | null) {
  _activeGuides = el ? computeGuides(el) : []
  _guidesVersion++
}

function SmartGuides() {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  const versionRef = useRef(_guidesVersion)
  useEffect(() => {
    const id = setInterval(() => {
      if (_guidesVersion !== versionRef.current) { versionRef.current = _guidesVersion; forceRender() }
    }, 16) // ~60fps poll
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

export function IframeCanvas({ onDocReady }: { onDocReady?: (doc: Document) => void }) {
  useForceRenderOnStoreChange()
  const s = useEditorV3Store.getState()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  const width = canvasWidths[s.currentBreakpointId]

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null)
  // Use store zoom
  const storeZoom = s.zoom

  const handleLoad = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const root = doc.getElementById("canvas-root")
    if (root) {
      setIframeBody(root)
      onDocReady?.(doc)
    }
  }, [onDocReady])

  // Auto-resize iframe to match content height
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !iframeBody) return
    const resize = () => {
      const h = iframeBody.scrollHeight
      if (h > 0) iframe.style.height = `${h}px`
    }
    resize()
    const observer = new MutationObserver(resize)
    observer.observe(iframeBody, { childList: true, subtree: true, attributes: true })
    return () => observer.disconnect()
  }, [iframeBody])

  // Forward keyboard events from iframe to parent for shortcuts
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const forward = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return
      window.dispatchEvent(new KeyboardEvent(e.type, e))
    }
    doc.addEventListener("keydown", forward)
    return () => doc.removeEventListener("keydown", forward)
  }, [iframeBody])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    if (files.length === 0) return
    e.preventDefault(); e.stopPropagation()
    const rootId = page?.rootInstanceId
    if (!rootId) return
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result as string
        const st = useEditorV3Store.getState()
        const parent = st.selectedInstanceId ?? rootId
        const parentInst = st.instances.get(parent)
        const id = st.addInstance(parent, parentInst?.children.length ?? 0, "Image")
        st.setProp(id, "src", "string", src)
        st.setProp(id, "alt", "string", file.name)
        st.select(id)
      }
      reader.readAsDataURL(file)
    }
  }, [page?.rootInstanceId])

  if (!page) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#9ca3af", background: "#f9fafb" }}>
        No page selected
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1, overflow: "auto", padding: 24, position: "relative",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        background: "#f5f5f5",
        backgroundImage: "radial-gradient(circle, #ddd 0.5px, transparent 0.5px)",
        backgroundSize: "20px 20px",
      }}
      onClick={() => useEditorV3Store.getState().select(null)}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault() }}
      onDrop={handleFileDrop}
    >
      <div style={{ transform: `scale(${storeZoom / 100})`, transformOrigin: "top center", transition: "transform 0.2s", width: width ?? "100%", maxWidth: width ?? 1280 }}>
        <iframe
          ref={iframeRef}
          srcDoc={IFRAME_SRCDOC}
          onLoad={handleLoad}
          style={{
            width: "100%",
            minHeight: 400,
            background: "#fff",
            border: "none",
            borderRadius: 4,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        />
      </div>
      {iframeBody && createPortal(
        <>
          <CanvasInstance instanceId={page.rootInstanceId} />
          <SmartGuides />
        </>,
        iframeBody,
      )}
      {/* Zoom controls moved to bottom bar in editor-shell */}
    </div>
  )
}
