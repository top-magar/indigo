"use client"

import { useEffect } from "react"
import { clampZoom } from "./zoom-utils"

/** Pinch-to-zoom and Ctrl+scroll on the canvas */
export function usePinchZoom(zoom: number, onZoomChange: (z: number) => void) {
  useEffect(() => {
    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    if (!canvas) return

    const handler = (e: WheelEvent) => {
      // Pinch gesture (trackpad) or Ctrl+scroll (mouse)
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const delta = -e.deltaY * 0.005
      onZoomChange(clampZoom(zoom + delta))
    }

    canvas.addEventListener("wheel", handler, { passive: false })
    return () => canvas.removeEventListener("wheel", handler)
  }, [zoom, onZoomChange])
}
