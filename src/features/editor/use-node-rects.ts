"use client"

import { useCallback } from "react"

export interface NodeRect {
  id: string
  top: number
  left: number
  width: number
  height: number
  right: number
  bottom: number
  centerX: number
  centerY: number
}

/** Query all visible craft node rects relative to the canvas container, adjusted for zoom. */
export function useNodeRects() {
  const getRects = useCallback((excludeId?: string): NodeRect[] => {
    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    if (!canvas) return []

    // Find zoom from the zoomed wrapper
    let zoom = 1
    const zoomed = canvas.querySelector("[style*='zoom']") as HTMLElement | null
    if (zoomed) {
      const z = parseFloat(zoomed.style.zoom || "1")
      if (z > 0) zoom = z
    }

    const canvasRect = canvas.getBoundingClientRect()
    const scrollLeft = canvas.scrollLeft
    const scrollTop = canvas.scrollTop
    const rects: NodeRect[] = []

    const nodes = canvas.querySelectorAll("[data-craft-node-id]")
    nodes.forEach((el) => {
      const id = (el as HTMLElement).dataset.craftNodeId
      if (!id || id === excludeId) return
      // Skip the root container
      if (el.parentElement?.closest("[data-craft-node-id]") === null && id === "ROOT") return

      const r = el.getBoundingClientRect()
      const top = (r.top - canvasRect.top + scrollTop) / zoom
      const left = (r.left - canvasRect.left + scrollLeft) / zoom
      const width = r.width / zoom
      const height = r.height / zoom

      rects.push({
        id, top, left, width, height,
        right: left + width,
        bottom: top + height,
        centerX: left + width / 2,
        centerY: top + height / 2,
      })
    })

    return rects
  }, [])

  return getRects
}
