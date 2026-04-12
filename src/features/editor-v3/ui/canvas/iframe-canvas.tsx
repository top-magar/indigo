"use client"
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { InstanceId, StyleValue } from "../../types"
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

  if (!editing) return <span onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}>{value}</span>

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      style={{ outline: "none", boxShadow: "0 0 0 1px #60a5fa", borderRadius: 2, paddingInline: 2 }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit() } if (e.key === "Escape") setEditing(false) }}
      onClick={(e) => e.stopPropagation()}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  )
}

function CanvasInstance({ instanceId }: { instanceId: InstanceId }) {
  useForceRenderOnStoreChange()
  const s = useEditorV3Store.getState()

  const instance = s.instances.get(instanceId)
  if (!instance) return null

  const Component = getComponent(instance.component)
  if (!Component) return <div style={{ padding: 8, border: "1px dashed red", fontSize: 12 }}>Unknown: {instance.component}</div>

  const props: Record<string, unknown> = {}
  for (const p of s.props.values()) {
    if (p.instanceId === instanceId) props[p.name] = p.value
  }

  const selection = s.styleSourceSelections.get(instanceId)
  let style: React.CSSProperties | undefined
  if (selection) {
    const css: Record<string, string> = {}
    for (const ssId of selection.values) {
      for (const decl of s.styleDeclarations.values()) {
        if (decl.styleSourceId === ssId && decl.breakpointId === s.currentBreakpointId && !decl.state) {
          css[decl.property] = styleValueToCSS(decl.value)
        }
      }
    }
    if (Object.keys(css).length > 0) style = css as React.CSSProperties
  }

  const isSelected = s.selectedInstanceId === instanceId
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0", border: "2px dashed #e5e7eb", borderRadius: 4, fontSize: 12, color: "#9ca3af" }}>
            Drop here
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
    useEditorV3Store.getState().select(instanceId)
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

  return (
    <div
      style={{
        position: "relative",
        outline: isSelected ? "2px solid #3b82f6" : isHovered ? "1px solid #93c5fd" : dropIndicator ? "2px dashed #3b82f6" : undefined,
        outlineOffset: -1,
        cursor: "default",
      }}
      data-ws-id={instanceId}
      onClick={handleClick}
      onMouseEnter={() => useEditorV3Store.getState().hover(instanceId)}
      onMouseLeave={() => useEditorV3Store.getState().hover(null)}
      onDragOver={handleDragOver}
      onDragLeave={() => setDropIndicator(false)}
      onDrop={handleDrop}
    >
      {children}
      {isSelected && (
        <div style={{
          position: "absolute", top: -20, left: 0,
          background: "#3b82f6", color: "#fff", fontSize: 10,
          padding: "2px 6px", borderRadius: "4px 4px 0 0",
          pointerEvents: "none", zIndex: 10,
        }}>
          {label}
        </div>
      )}
    </div>
  )
}

const canvasWidths: Record<string, number | undefined> = {
  "bp-base": undefined,
  "bp-tablet": 768,
  "bp-mobile": 375,
}

const IFRAME_SRCDOC = `<!DOCTYPE html>
<html><head>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; }
</style>
</head><body><div id="canvas-root"></div></body></html>`

/** Renders canvas content inside an iframe for CSS isolation.
 *  Exposes iframeDoc via onDocReady so the parent can pass it to useGoogleFonts. */
export function IframeCanvas({ onDocReady }: { onDocReady?: (doc: Document) => void }) {
  useForceRenderOnStoreChange()
  const s = useEditorV3Store.getState()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  const width = canvasWidths[s.currentBreakpointId]

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null)

  const handleLoad = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const root = doc.getElementById("canvas-root")
    if (root) {
      setIframeBody(root)
      onDocReady?.(doc)
    }
  }, [onDocReady])

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

  // Image file drop on the outer container (iframe doesn't receive cross-origin file drops easily)
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

  if (!page) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#9ca3af" }}>No page selected</div>

  return (
    <div
      style={{ flex: 1, overflow: "auto", background: "#f3f4f6", padding: 32, display: "flex", justifyContent: "center" }}
      onClick={() => useEditorV3Store.getState().select(null)}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault() }}
      onDrop={handleFileDrop}
    >
      <iframe
        ref={iframeRef}
        srcDoc={IFRAME_SRCDOC}
        onLoad={handleLoad}
        style={{
          width: width ?? "100%",
          maxWidth: width ?? 1280,
          minHeight: 600,
          background: "#fff",
          border: "none",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          transition: "width 0.3s, max-width 0.3s",
        }}
      />
      {iframeBody && createPortal(
        <CanvasInstance instanceId={page.rootInstanceId} />,
        iframeBody,
      )}
    </div>
  )
}
