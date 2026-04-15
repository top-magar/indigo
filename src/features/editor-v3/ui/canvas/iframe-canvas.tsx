"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { InstanceId } from "../../types"
import { useEditorV3Store } from "../../stores/store"
import { getComponent, getMeta } from "../../registry/registry"
import {
  styleValueToCSS, useForceRenderOnStoreChange, useCanvasInstance,
  EditableText, getDeclIndex, getPropsIndex, getDropPosition,
  lockAncestorSizes, unlockAncestorSizes, canvasWidths, IFRAME_SRCDOC,
} from "./canvas-utils"
import {
  SmartGuides, setActiveGuides, ResizeHandles,
  DistanceIndicators, SpacingOverlay, DropLine, AutoLayoutSuggestion,
} from "./canvas-overlays"
import { CanvasContextMenu, QuickActions } from "./canvas-actions"

// ── CanvasInstance — recursive component renderer ──

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
    const sortedBps = [...s.breakpoints.values()].sort((a, b) => (b.minWidth ?? 9999) - (a.minWidth ?? 9999))
    const currentBp = s.breakpoints.get(s.currentBreakpointId)
    const currentWidth = currentBp?.minWidth ?? 9999
    const activeBpIds = sortedBps.filter((bp) => (bp.minWidth ?? 9999) >= currentWidth).map((bp) => bp.id)

    for (const ssId of selection.values) {
      for (const bpId of activeBpIds) {
        for (const decl of declIdx.get(ssId) ?? []) {
          if (decl.breakpointId === bpId && !decl.state) {
            css[decl.property] = styleValueToCSS(decl.value)
          }
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
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "24px 16px", border: "1.5px dashed #d1d5db", borderRadius: 8,
            fontSize: 11, color: "#9ca3af", letterSpacing: 0.3, gap: 6,
            background: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.015) 4px, rgba(0,0,0,0.015) 8px)",
          }}>
            <span style={{ fontSize: 18, opacity: 0.5 }}>+</span>
            <span>Drop elements here</span>
          </div>
        ) : undefined}
      </Component>
    </CanvasWrapper>
  )
}

// ── CanvasWrapper — selection, drag, drop, overlays ──

function CanvasWrapper({ instanceId, isSelected, isHovered, label, childCount, children }: {
  instanceId: string; isSelected: boolean; isHovered: boolean; label: string; childCount: number; children: React.ReactNode
}) {
  const [dropPosition, setDropPosition] = useState<number | null>(null)
  const lockedRef = useRef<Array<{ el: HTMLElement; prev: string }>>([])
  const dragRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null)
  const [altHeld, setAltHeld] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === "Alt") setAltHeld(true) }
    const up = (e: KeyboardEvent) => { if (e.key === "Alt") setAltHeld(false) }
    document.addEventListener("keydown", down)
    document.addEventListener("keyup", up)
    return () => { document.removeEventListener("keydown", down); document.removeEventListener("keyup", up) }
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    useEditorV3Store.getState().select(instanceId)
    setCtxMenu({ x: e.clientX, y: e.clientY })
  }, [instanceId])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); setCtxMenu(null)
    if (e.shiftKey) useEditorV3Store.getState().toggleSelect(instanceId)
    else useEditorV3Store.getState().select(instanceId)
  }, [instanceId])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const s = useEditorV3Store.getState()
    const inst = s.instances.get(instanceId)
    if (!inst) return
    const firstChild = inst.children.find((c) => c.type === "id")
    if (firstChild) s.select(firstChild.value)
  }, [instanceId])

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
    if (lockedRef.current.length === 0 && wrapperRef.current) lockedRef.current = lockAncestorSizes(wrapperRef.current)
    const container = wrapperRef.current?.querySelector("[data-ws-id] > *") ?? wrapperRef.current
    if (container) setDropPosition(getDropPosition(container as HTMLElement, e.clientX, e.clientY))
    else setDropPosition(0)
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
    const dragIdsRaw = e.dataTransfer.getData("instance-ids")
    const dragId = e.dataTransfer.getData("instance-id")
    if (comp) { const id = s.addInstance(instanceId, insertAt, comp); s.select(id) }
    else if (dragIdsRaw) {
      const ids = JSON.parse(dragIdsRaw) as string[]
      let offset = 0
      for (const id of ids) { if (id !== instanceId) { s.moveInstance(id, instanceId, insertAt + offset); offset++ } }
      if (ids[0]) s.select(ids[0])
    }
    else if (dragId && dragId !== instanceId) { s.moveInstance(dragId, instanceId, insertAt); s.select(dragId) }
  }, [instanceId, childCount, dropPosition])

  const handleDragStart = useCallback((e: React.DragEvent) => {
    const s = useEditorV3Store.getState()
    const ids = s.selectedInstanceIds.size > 1 ? [...s.selectedInstanceIds] : [instanceId]
    e.dataTransfer.setData("instance-id", ids[0])
    e.dataTransfer.setData("instance-ids", JSON.stringify(ids))
    e.dataTransfer.effectAllowed = "move"
    if (wrapperRef.current) lockedRef.current = lockAncestorSizes(wrapperRef.current)
    wrapperRef.current?.ownerDocument.body.classList.add("dragging")
  }, [instanceId])

  const handleDragEnd = useCallback(() => {
    setDropPosition(null)
    unlockAncestorSizes(lockedRef.current)
    wrapperRef.current?.ownerDocument.body.classList.remove("dragging")
    lockedRef.current = []
  }, [])

  const outlineStyle = isSelected ? "2px solid #3b82f6" : isHovered ? "1.5px solid #93c5fd" : dropPosition !== null ? "2px dashed #3b82f6" : undefined
  const elRadius = wrapperRef.current?.firstElementChild ? getComputedStyle(wrapperRef.current.firstElementChild).borderRadius : undefined

  return (
    <div
      ref={wrapperRef} draggable={isSelected}
      style={{ position: "relative", outline: outlineStyle, outlineOffset: -1, borderRadius: elRadius, cursor: dragRef.current ? "grabbing" : isSelected ? "grab" : "default" }}
      data-ws-id={instanceId}
      onClick={handleClick} onContextMenu={handleContextMenu} onDoubleClick={handleDoubleClick}
      onDragStart={handleDragStart} onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
      onMouseEnter={(e) => { e.stopPropagation(); useEditorV3Store.getState().hover(instanceId) }}
      onMouseLeave={(e) => { e.stopPropagation(); useEditorV3Store.getState().hover(null) }}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
    >
      {children}
      {isSelected && <QuickActions instanceId={instanceId} />}
      {isSelected && (
        <div style={{ position: "absolute", top: 0, left: 0, background: "#3b82f6", color: "#fff", fontSize: 10, fontFamily: "system-ui, sans-serif", padding: "1px 6px", borderRadius: "0 0 4px 0", pointerEvents: "none", zIndex: 10, lineHeight: "16px", fontWeight: 500, opacity: 0.9 }}>
          {label}
        </div>
      )}
      {(isSelected || isHovered) && wrapperRef.current && (
        <div style={{ position: "absolute", bottom: -18, right: 0, background: isSelected ? "#3b82f6" : "#6b7280", color: "#fff", fontSize: 9, fontFamily: "system-ui, sans-serif", fontWeight: 600, padding: "1px 5px", borderRadius: 3, pointerEvents: "none", zIndex: 10, lineHeight: "14px", whiteSpace: "nowrap", opacity: 0.85 }}>
          {Math.round(wrapperRef.current.offsetWidth)} × {Math.round(wrapperRef.current.offsetHeight)}
        </div>
      )}
      {isSelected && <ResizeHandles instanceId={instanceId} wrapperRef={wrapperRef} />}
      {isSelected && altHeld && <SpacingOverlay instanceId={instanceId} wrapperRef={wrapperRef} />}
      {isSelected && altHeld && <DistanceIndicators wrapperRef={wrapperRef} />}
      {isSelected && <AutoLayoutSuggestion instanceId={instanceId} wrapperRef={wrapperRef} />}
      {dropPosition !== null && <DropLine container={wrapperRef.current} position={dropPosition} />}
      {ctxMenu && <CanvasContextMenu x={ctxMenu.x} y={ctxMenu.y} instanceId={instanceId} onClose={() => setCtxMenu(null)} />}
    </div>
  )
}

// ── IframeCanvas — main export ──

export function IframeCanvas({ onDocReady }: { onDocReady?: (doc: Document) => void }) {
  useForceRenderOnStoreChange()
  const s = useEditorV3Store.getState()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  const width = canvasWidths[s.currentBreakpointId]
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null)
  const storeZoom = s.zoom

  const handleLoad = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const root = doc.getElementById("canvas-root")
    if (root) { setIframeBody(root); onDocReady?.(doc) }
  }, [onDocReady])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !iframeBody) return
    const resize = () => { const h = iframeBody.scrollHeight; if (h > 0) iframe.style.height = `${h}px` }
    resize()
    const observer = new MutationObserver(resize)
    observer.observe(iframeBody, { childList: true, subtree: true, attributes: true })
    return () => observer.disconnect()
  }, [iframeBody])

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
    return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#9ca3af", background: "#f9fafb" }}>No page selected</div>
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      useEditorV3Store.getState().setZoom(storeZoom + (e.deltaY > 0 ? -10 : 10))
    }
  }, [storeZoom])

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
      onWheel={handleWheel}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault() }}
      onDrop={handleFileDrop}
    >
      <div style={{ transform: `scale(${storeZoom / 100})`, transformOrigin: "top center", transition: "transform 0.2s", width: width ?? "100%", maxWidth: width ?? 1280 }}>
        <iframe ref={iframeRef} srcDoc={IFRAME_SRCDOC} onLoad={handleLoad}
          style={{ width: "100%", minHeight: 400, background: "#fff", border: "none", borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" }}
        />
      </div>
      {iframeBody && createPortal(
        <><CanvasInstance instanceId={page.rootInstanceId} /><SmartGuides /></>,
        iframeBody,
      )}
    </div>
  )
}
