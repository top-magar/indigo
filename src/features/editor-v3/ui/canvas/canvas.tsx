"use client"
import React, { useCallback, useRef, useReducer, useEffect } from "react"
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

/** Force re-render on any store change */
function useForceRenderOnStoreChange() {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => useEditorV3Store.subscribe(forceRender), [])
}

function EditableText({ instanceId, index, value }: { instanceId: InstanceId; index: number; value: string }) {
  const [editing, setEditing] = React.useState(false)
  const ref = React.useRef<HTMLSpanElement>(null)

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
      className="outline-none ring-1 ring-blue-400 rounded-sm px-0.5"
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

  // Resolve props
  const props: Record<string, unknown> = {}
  for (const p of s.props.values()) {
    if (p.instanceId === instanceId) props[p.name] = p.value
  }

  // Resolve styles
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

  // Empty container placeholder
  const hasChildren = instance.children.length > 0
  const meta = getMeta(instance.component)
  const isContainer = meta?.contentModel.children && meta.contentModel.children.length > 0

  return (
    <CanvasWrapper instanceId={instanceId} isSelected={isSelected} isHovered={isHovered} label={instance.label ?? instance.component} childCount={instance.children.length}>
      <Component {...props} style={style}>
        {hasChildren ? children : isContainer ? <div className="flex items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded text-xs text-gray-400">Drop here</div> : undefined}
      </Component>
    </CanvasWrapper>
  )
}

function CanvasWrapper({ instanceId, isSelected, isHovered, label, childCount, children }: {
  instanceId: string; isSelected: boolean; isHovered: boolean; label: string; childCount: number; children: React.ReactNode
}) {
  const [dropIndicator, setDropIndicator] = React.useState(false)

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
      className="relative"
      data-ws-id={instanceId}
      onClick={handleClick}
      onMouseEnter={() => useEditorV3Store.getState().hover(instanceId)}
      onMouseLeave={() => useEditorV3Store.getState().hover(null)}
      onDragOver={handleDragOver}
      onDragLeave={() => setDropIndicator(false)}
      onDrop={handleDrop}
      style={{ outline: isSelected ? "2px solid #3b82f6" : isHovered ? "1px solid #93c5fd" : dropIndicator ? "2px dashed #3b82f6" : undefined, outlineOffset: -1, cursor: "default" }}
    >
      {children}
      {isSelected && <div className="absolute -top-5 left-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-t pointer-events-none z-10">{label}</div>}
    </div>
  )
}

const canvasWidths: Record<string, number | undefined> = {
  "bp-base": undefined,  // full width
  "bp-tablet": 768,
  "bp-mobile": 375,
}

export function Canvas() {
  useForceRenderOnStoreChange()
  const s = useEditorV3Store.getState()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  const canvasRef = useRef<HTMLDivElement>(null)
  const width = canvasWidths[s.currentBreakpointId]

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    if (files.length === 0) return
    e.preventDefault(); e.stopPropagation()
    const state = useEditorV3Store.getState()
    const rootId = page?.rootInstanceId
    if (!rootId) return
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result as string
        const s = useEditorV3Store.getState()
        const parent = s.selectedInstanceId ?? rootId
        const parentInst = s.instances.get(parent)
        const id = s.addInstance(parent, parentInst?.children.length ?? 0, "Image")
        s.setProp(id, "src", "string", src)
        s.setProp(id, "alt", "string", file.name)
        s.select(id)
      }
      reader.readAsDataURL(file)
    }
  }, [page?.rootInstanceId])

  if (!page) return <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No page selected</div>

  return (
    <div ref={canvasRef} className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center"
      onClick={() => useEditorV3Store.getState().select(null)}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault() }}
      onDrop={handleFileDrop}>
      <div className="bg-white shadow-sm min-h-[600px] transition-all duration-300 overflow-x-hidden overflow-y-auto" style={{ width: width ?? "100%", maxWidth: width ?? 1280 }}>
        <CanvasInstance instanceId={page.rootInstanceId} />
      </div>
    </div>
  )
}
