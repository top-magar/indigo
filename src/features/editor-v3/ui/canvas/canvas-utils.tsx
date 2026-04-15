"use client"
import { useReducer, useEffect, useCallback, useState } from "react"
import type { InstanceId, StyleValue, Prop, StyleDeclaration } from "../../types"
import { useEditorV3Store } from "../../stores/store"
import { InlineRichText } from "../components/inline-rich-text"

// ── Style value → CSS string ──

export function styleValueToCSS(v: StyleValue): string {
  switch (v.type) {
    case "unit": return `${v.value}${v.unit}`
    case "keyword": return v.value
    case "rgb": return `rgba(${v.r},${v.g},${v.b},${v.a})`
    case "unparsed": return v.value
    case "var": return v.fallback ? `var(${v.value}, ${styleValueToCSS(v.fallback)})` : `var(${v.value})`
  }
}

// ── Cached indexes — version-counter based invalidation ──

let _declVersion = -1
let _declIndex: Map<string, StyleDeclaration[]> = new Map()
let _propsVersion = -1
let _propsIndex: Map<string, Prop[]> = new Map()
export let _storeVersion = 0

useEditorV3Store.subscribe(() => { _storeVersion++ })

export function getDeclIndex(s: { styleDeclarations: Map<string, StyleDeclaration> }): Map<string, StyleDeclaration[]> {
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

export function getPropsIndex(s: { props: Map<string, Prop> }): Map<string, Prop[]> {
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

// ── Hooks ──

export function useForceRenderOnStoreChange() {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => useEditorV3Store.subscribe(forceRender), [])
}

export function snapshotFor(id: InstanceId): string {
  const s = useEditorV3Store.getState()
  const inst = s.instances.get(id)
  if (!inst) return ""
  const sel = s.selectedInstanceIds.has(id) ? "s" : s.hoveredInstanceId === id ? "h" : ""
  return `${inst.children.length}:${s.currentBreakpointId}:${sel}:${_storeVersion}`
}

export function useCanvasInstance(instanceId: InstanceId) {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => {
    let prev = snapshotFor(instanceId)
    return useEditorV3Store.subscribe(() => {
      const next = snapshotFor(instanceId)
      if (next !== prev) { prev = next; forceRender() }
    })
  }, [instanceId])
}

// ── Editable text ──

export function EditableText({ instanceId, index, value }: { instanceId: InstanceId; index: number; value: string }) {
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

// ── Drop position calculation ──

export function getDropPosition(container: HTMLElement, clientX: number, clientY: number): number {
  const children = Array.from(container.children).filter(
    (el) => el.hasAttribute("data-ws-id") || el.querySelector("[data-ws-id]")
  )
  if (children.length === 0) return 0
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

export function lockAncestorSizes(el: HTMLElement): Array<{ el: HTMLElement; prev: string }> {
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

export function unlockAncestorSizes(locked: Array<{ el: HTMLElement; prev: string }>) {
  for (const { el, prev } of locked) el.style.height = prev
}

// ── Constants ──

export const canvasWidths: Record<string, number | undefined> = {
  "bp-large": 1440, "bp-laptop": 1280, "bp-base": undefined,
  "bp-tablet": 768, "bp-mobile-land": 480, "bp-mobile": 375,
}

export const IFRAME_SRCDOC = `<!DOCTYPE html>
<html><head>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; line-height: 1.5; -webkit-font-smoothing: antialiased; }
  body.dragging, body.dragging * { user-select: none !important; cursor: grabbing !important; }
  #canvas-root { min-height: 100vh; }
  img, video { max-width: 100%; height: auto; display: block; }
  a { color: inherit; text-decoration: none; }
  button { font: inherit; cursor: pointer; }
  input, textarea, select { font: inherit; }
  h1, h2, h3, h4, h5, h6 { line-height: 1.2; }
  ul, ol { list-style-position: inside; }
  hr { border: none; border-top: 1px solid #e5e7eb; }
</style>
</head><body><div id="canvas-root" data-ws-canvas-root></div></body></html>`
