"use client"

import { useEffect, useRef } from "react"
import { clampZoom } from "../lib/zoom-utils"

/** Pinch-to-zoom and Ctrl+scroll on the canvas. Uses ref to avoid stale closures. */
export function usePinchZoom(zoom: number, onZoomChange: (z: number) => void) {
  const zoomRef = useRef(zoom)
  const cbRef = useRef(onZoomChange)
  zoomRef.current = zoom
  cbRef.current = onZoomChange

  useEffect(() => {
    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    if (!canvas) return

    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const delta = -e.deltaY * 0.005
      cbRef.current(clampZoom(zoomRef.current + delta))
    }

    canvas.addEventListener("wheel", handler, { passive: false })
    return () => canvas.removeEventListener("wheel", handler)
  }, []) // stable — no deps, uses refs
}
