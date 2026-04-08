"use client"

import { createContext, useContext, type ReactNode } from "react"

export interface NodeRect {
  id: string
  top: number; left: number; width: number; height: number
  right: number; bottom: number; centerX: number; centerY: number
}

export interface CanvasAdapter {
  getNodeElement(id: string): HTMLElement | null
  getCanvasElement(): HTMLElement | null
  getFrameElement(): HTMLElement | null
  getNodeRect(id: string): NodeRect | null
  getAllNodeRects(excludeId?: string): NodeRect[]
  getCanvasRect(): DOMRect | null
  getCanvasScroll(): { scrollTop: number; scrollLeft: number }
  getZoom(): number
  scrollToNode(id: string, delay?: number): void
  scrollToLastChild(parentId: string, delay?: number): void
}

// ── Direct DOM implementation (current behavior) ──

export class DirectCanvasAdapter implements CanvasAdapter {
  getCanvasElement() { return document.querySelector("[data-editor-canvas]") as HTMLElement | null }
  getFrameElement() { return document.querySelector("[data-editor-frame]") as HTMLElement | null }
  getNodeElement(id: string) { return document.querySelector(`[data-craft-node-id="${id}"]`) as HTMLElement | null }

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

  getCanvasScroll() {
    const c = this.getCanvasElement()
    return { scrollTop: c?.scrollTop ?? 0, scrollLeft: c?.scrollLeft ?? 0 }
  }

  getNodeRect(id: string): NodeRect | null {
    const el = this.getNodeElement(id)
    const canvas = this.getCanvasElement()
    if (!el || !canvas) return null
    const z = this.getZoom()
    const cr = canvas.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const top = (r.top - cr.top + canvas.scrollTop) / z
    const left = (r.left - cr.left + canvas.scrollLeft) / z
    const width = r.width / z
    const height = r.height / z
    return { id, top, left, width, height, right: left + width, bottom: top + height, centerX: left + width / 2, centerY: top + height / 2 }
  }

  getAllNodeRects(excludeId?: string): NodeRect[] {
    const canvas = this.getCanvasElement()
    if (!canvas) return []
    const z = this.getZoom()
    const cr = canvas.getBoundingClientRect()
    const { scrollTop, scrollLeft } = canvas
    const rects: NodeRect[] = []
    canvas.querySelectorAll("[data-craft-node-id]").forEach((el) => {
      const id = (el as HTMLElement).dataset.craftNodeId
      if (!id || id === excludeId || id === "ROOT") return
      const r = el.getBoundingClientRect()
      const top = (r.top - cr.top + scrollTop) / z
      const left = (r.left - cr.left + scrollLeft) / z
      const width = r.width / z
      const height = r.height / z
      rects.push({ id, top, left, width, height, right: left + width, bottom: top + height, centerX: left + width / 2, centerY: top + height / 2 })
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

// ── Iframe portal implementation (nodes live in iframe document) ──

export class IframePortalAdapter implements CanvasAdapter {
  private iframeSelector = "[data-editor-iframe]"

  private get iframe() { return document.querySelector(this.iframeSelector) as HTMLIFrameElement | null }
  private get iframeDoc() { return this.iframe?.contentDocument ?? null }

  getCanvasElement() { return document.querySelector("[data-editor-canvas]") as HTMLElement | null }
  getFrameElement() { return this.iframe ?? null }
  getNodeElement(id: string) { return this.iframeDoc?.querySelector(`[data-craft-node-id="${id}"]`) as HTMLElement | null }

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
    const ir = this.iframe?.getBoundingClientRect()
    const canvas = this.getCanvasElement()
    if (!el || !ir || !canvas) return null
    const r = el.getBoundingClientRect()
    const cr = canvas.getBoundingClientRect()
    // iframe-local rect → offset by iframe position → canvas-relative
    const top = ir.top + r.top - cr.top + canvas.scrollTop
    const left = ir.left + r.left - cr.left + canvas.scrollLeft
    const width = r.width
    const height = r.height
    return { id, top, left, width, height, right: left + width, bottom: top + height, centerX: left + width / 2, centerY: top + height / 2 }
  }

  getAllNodeRects(excludeId?: string): NodeRect[] {
    const doc = this.iframeDoc
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

// ── React context ──

const CanvasAdapterContext = createContext<CanvasAdapter>(new DirectCanvasAdapter())

export function CanvasAdapterProvider({ adapter, children }: { adapter: CanvasAdapter; children: ReactNode }) {
  return <CanvasAdapterContext value={adapter}>{children}</CanvasAdapterContext>
}

export function useCanvasAdapter(): CanvasAdapter {
  return useContext(CanvasAdapterContext)
}
