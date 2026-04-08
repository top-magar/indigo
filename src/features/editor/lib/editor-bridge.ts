"use client"

import { useSyncExternalStore, useCallback, useEffect, useRef } from "react"
import type { IframeMessage, NodeInfo, RectData, ParentMessage } from "./bridge-types"
import type { CanvasAdapter, NodeRect } from "./canvas-adapter"

// ── State mirror (parent keeps a copy of iframe state) ──

interface BridgeState {
  ready: boolean
  selectedId: string | null
  selectedNode: NodeInfo | null
  hoveredId: string | null
  hoveredRect: RectData | null
  nodeRects: RectData[]
  canUndo: boolean
  canRedo: boolean
  serializedJson: string | null
}

type Listener = () => void

class EditorBridgeStore {
  private state: BridgeState = {
    ready: false, selectedId: null, selectedNode: null,
    hoveredId: null, hoveredRect: null, nodeRects: [],
    canUndo: false, canRedo: false, serializedJson: null,
  }
  private listeners = new Set<Listener>()
  private iframe: HTMLIFrameElement | null = null

  setIframe(iframe: HTMLIFrameElement | null) { this.iframe = iframe }

  // ── Send commands to iframe ──

  send(msg: ParentMessage) { this.iframe?.contentWindow?.postMessage(msg, "*") }
  selectNode(id: string) { this.send({ type: "select", id }) }
  deselect() { this.send({ type: "deselect" }) }
  deleteNode(id: string) { this.send({ type: "delete", id }) }
  moveNode(id: string, targetParent: string, index: number) { this.send({ type: "move", id, targetParent, index }) }
  duplicateNode(id: string) { this.send({ type: "duplicate", id }) }
  setProp(id: string, key: string, value: unknown) { this.send({ type: "setProp", id, key, value }) }
  setHidden(id: string, hidden: boolean) { this.send({ type: "setHidden", id, hidden }) }
  deserialize(json: string) { this.send({ type: "deserialize", json }) }
  serialize() { this.send({ type: "serialize" }) }
  undo() { this.send({ type: "undo" }) }
  redo() { this.send({ type: "redo" }) }
  requestRects() { this.send({ type: "getNodeRect", id: "" }) }

  // ── Receive messages from iframe ──

  handleMessage(msg: IframeMessage) {
    switch (msg.type) {
      case "ready": this.update({ ready: true }); break
      case "node:selected": this.update({ selectedId: msg.id, selectedNode: msg.node }); break
      case "node:hovered": this.update({ hoveredId: msg.id, hoveredRect: msg.rect }); break
      case "node:rect": this.update({ nodeRects: msg.rects }); break
      case "state:canUndo": this.update({ canUndo: msg.canUndo, canRedo: msg.canRedo }); break
      case "serialize:result": this.update({ serializedJson: msg.json }); break
    }
  }

  // ── useSyncExternalStore ──

  private update(partial: Partial<BridgeState>) {
    this.state = { ...this.state, ...partial }
    this.listeners.forEach((l) => l())
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  getSnapshot(): BridgeState { return this.state }

  destroy() {
    this.listeners.clear()
    this.iframe = null
    this.state = { ready: false, selectedId: null, selectedNode: null, hoveredId: null, hoveredRect: null, nodeRects: [], canUndo: false, canRedo: false, serializedJson: null }
  }
}

// ── Singleton ──

export const editorBridge = new EditorBridgeStore()

// ── React hook ──

export function useEditorBridge() {
  const subscribe = useCallback((cb: Listener) => editorBridge.subscribe(cb), [])
  const getSnapshot = useCallback(() => editorBridge.getSnapshot(), [])
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Hook to wire up the bridge message listener */
export function useEditorBridgeListener(iframeRef: React.RefObject<HTMLIFrameElement | null>) {
  useEffect(() => {
    editorBridge.setIframe(iframeRef.current)
    const handler = (e: MessageEvent<IframeMessage>) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      if (!e.data?.type) return
      editorBridge.handleMessage(e.data)
    }
    window.addEventListener("message", handler)
    return () => {
      window.removeEventListener("message", handler)
      editorBridge.destroy()
    }
  }, [iframeRef])
}

// ── IframeCanvasAdapter ──

export class IframeCanvasAdapter implements CanvasAdapter {
  private iframeRef: React.RefObject<HTMLIFrameElement | null>
  constructor(iframeRef: React.RefObject<HTMLIFrameElement | null>) { this.iframeRef = iframeRef }

  private get iframe() { return this.iframeRef.current }
  private get iframeRect() { return this.iframe?.getBoundingClientRect() ?? null }

  getCanvasElement() { return this.iframe?.parentElement ?? null }
  getFrameElement() { return this.iframe ?? null }
  getNodeElement(id: string) { return this.iframe?.contentDocument?.querySelector(`[data-craft-node-id="${id}"]`) as HTMLElement | null }

  getZoom(): number {
    const canvas = this.getCanvasElement()
    if (!canvas) return 1
    const scaled = canvas.querySelector("[style*='scale']") as HTMLElement | null
    if (!scaled) return 1
    const t = getComputedStyle(scaled).transform
    if (!t || t === "none") return 1
    const m = t.match(/matrix\(([^,]+)/)
    return m ? parseFloat(m[1]) : 1
  }

  getCanvasRect() { return this.getCanvasElement()?.getBoundingClientRect() ?? null }
  getCanvasScroll() { const c = this.getCanvasElement(); return { scrollTop: c?.scrollTop ?? 0, scrollLeft: c?.scrollLeft ?? 0 } }

  getNodeRect(id: string): NodeRect | null {
    const el = this.getNodeElement(id)
    const ir = this.iframeRect
    const canvas = this.getCanvasElement()
    if (!el || !ir || !canvas) return null
    const r = el.getBoundingClientRect()
    const cr = canvas.getBoundingClientRect()
    // iframe-local rect → screen rect → canvas-relative rect
    const top = ir.top + r.top - cr.top + canvas.scrollTop
    const left = ir.left + r.left - cr.left + canvas.scrollLeft
    const width = r.width
    const height = r.height
    return { id, top, left, width, height, right: left + width, bottom: top + height, centerX: left + width / 2, centerY: top + height / 2 }
  }

  getAllNodeRects(excludeId?: string): NodeRect[] {
    const doc = this.iframe?.contentDocument
    if (!doc) return []
    const rects: NodeRect[] = []
    doc.querySelectorAll("[data-craft-node-id]").forEach((el) => {
      const id = (el as HTMLElement).dataset.craftNodeId
      if (!id || id === excludeId || id === "ROOT") return
      const rect = this.getNodeRect(id)
      if (rect) rects.push(rect)
    })
    return rects
  }

  scrollToNode(id: string, delay = 50) {
    setTimeout(() => { this.getNodeElement(id)?.scrollIntoView({ behavior: "smooth", block: "center" }) }, delay)
  }

  scrollToLastChild(parentId: string, delay = 100) {
    setTimeout(() => {
      const parent = this.getNodeElement(parentId)
      if (!parent) return
      const children = parent.querySelectorAll(":scope > [data-craft-node-id]")
      ;(children[children.length - 1] as HTMLElement)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, delay)
  }
}
