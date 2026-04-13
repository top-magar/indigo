"use client"
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { InstanceId, StyleValue, Prop, StyleDeclaration } from "../../types"
import { useEditorV3Store } from "../../stores/store"
import { getComponent, getMeta } from "../../registry/registry"

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

function EditableText({ instanceId, index, value }: { instanceId: InstanceId; index: number; value: string }) {
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  const commit = useCallback(() => {
    if (!ref.current) return
    const newText = ref.current.textContent ?? ""
    if (newText !== value) useEditorV3Store.getState().setTextChild(instanceId, index, newText)
    setEditing(false)
  }, [instanceId, index, value])

  if (!editing) {
    return <span onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }} style={{ cursor: "text" }}>{value}</span>
  }

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      style={{ outline: "none", boxShadow: "0 0 0 2px #3b82f6", borderRadius: 2, paddingInline: 2, background: "rgba(59,130,246,0.04)" }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit() } if (e.key === "Escape") setEditing(false) }}
      onClick={(e) => e.stopPropagation()}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  )
}

// Cached indexes — rebuilt only when store changes (not per-instance)
let _declIndexVersion = 0
let _declIndex: Map<string, StyleDeclaration[]> = new Map()
let _propsIndex: Map<string, Prop[]> = new Map()

function getDeclIndex(s: { styleDeclarations: Map<string, StyleDeclaration> }): Map<string, StyleDeclaration[]> {
  const v = s.styleDeclarations.size
  if (v !== _declIndexVersion) {
    _declIndexVersion = v
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
  const v = s.props.size
  if (v !== _propsIndex.size) {
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
  useForceRenderOnStoreChange()
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

function CanvasWrapper({ instanceId, isSelected, isHovered, label, childCount, children }: {
  instanceId: string; isSelected: boolean; isHovered: boolean; label: string; childCount: number; children: React.ReactNode
}) {
  const [dropIndicator, setDropIndicator] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.shiftKey) {
      useEditorV3Store.getState().toggleSelect(instanceId)
    } else {
      useEditorV3Store.getState().select(instanceId)
    }
  }, [instanceId])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("component-name") || e.dataTransfer.types.includes("instance-id")) {
      e.preventDefault(); e.stopPropagation(); setDropIndicator(true)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDropIndicator(false)
    const s = useEditorV3Store.getState()
    const comp = e.dataTransfer.getData("component-name")
    const dragId = e.dataTransfer.getData("instance-id")
    if (comp) { const id = s.addInstance(instanceId, childCount, comp); s.select(id) }
    else if (dragId && dragId !== instanceId) { s.moveInstance(dragId, instanceId, childCount); s.select(dragId) }
  }, [instanceId, childCount])

  const outlineStyle = isSelected
    ? "2px solid #3b82f6"
    : isHovered
      ? "1.5px solid #93c5fd"
      : dropIndicator
        ? "2px dashed #3b82f6"
        : undefined

  return (
    <div
      style={{ position: "relative", outline: outlineStyle, outlineOffset: -1, cursor: "default" }}
      data-ws-id={instanceId}
      onClick={handleClick}
      onMouseEnter={() => useEditorV3Store.getState().hover(instanceId)}
      onMouseLeave={() => useEditorV3Store.getState().hover(null)}
      onDragOver={handleDragOver}
      onDragLeave={() => setDropIndicator(false)}
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
      {/* Drop indicator overlay */}
      {dropIndicator && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(59,130,246,0.06)",
          borderRadius: 2, pointerEvents: "none", zIndex: 5,
        }} />
      )}
    </div>
  )
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
        <CanvasInstance instanceId={page.rootInstanceId} />,
        iframeBody,
      )}
      {/* Zoom controls moved to bottom bar in editor-shell */}
    </div>
  )
}
