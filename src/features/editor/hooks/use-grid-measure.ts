import { useEffect, useState, useCallback } from "react"
import { useCanvasAdapter } from "../lib/canvas-adapter"

export interface GridMeasurement {
  /** Frame's visual left edge relative to canvas content area */
  frameLeft: number
  /** Frame's visual width on canvas (zoom-scaled) */
  frameWidth: number
  /** --store-max-width in CSS px (0 if unset/none) */
  maxW: number
  /** --store-section-gap-h in CSS px */
  padH: number
  /** Total scrollable height of the canvas */
  canvasScrollHeight: number
  /** Current zoom factor */
  zoom: number
}

/** Shared measurement hook for gridline overlays. Zoom-aware, NaN-safe, observes resize + style mutations. */
export function useGridMeasure(visible: boolean): GridMeasurement | null {
  const [state, setState] = useState<GridMeasurement | null>(null)
  const adapter = useCanvasAdapter()

  const measure = useCallback(() => {
    const canvas = adapter.getCanvasElement()
    const frame = adapter.getFrameElement()
    if (!canvas || !frame) return

    const cs = getComputedStyle(frame)
    const rawMaxW = cs.getPropertyValue("--store-max-width")
    const rawPadH = cs.getPropertyValue("--store-section-gap-h")
    const maxW = rawMaxW ? parseInt(rawMaxW, 10) : 0
    const padH = rawPadH ? parseInt(rawPadH, 10) : 24

    // getBoundingClientRect returns visual (zoom-scaled) coordinates
    const canvasRect = canvas.getBoundingClientRect()
    const frameRect = frame.getBoundingClientRect()
    const frameLeft = frameRect.left - canvasRect.left + canvas.scrollLeft
    const frameWidth = frameRect.width

    // Derive zoom from frame's CSS width vs visual width
    const cssWidth = frame.clientWidth
    const zoom = cssWidth > 0 ? frameWidth / cssWidth : 1

    setState({
      frameLeft,
      frameWidth,
      maxW: Number.isFinite(maxW) ? maxW : 0,
      padH: Number.isFinite(padH) ? padH : 24,
      canvasScrollHeight: canvas.scrollHeight,
      zoom,
    })
  }, [])

  useEffect(() => {
    if (!visible) { setState(null); return }
    measure()

    const frame = adapter.getFrameElement()
    const canvas = adapter.getCanvasElement()
    if (!frame) return

    // ResizeObserver for dimension changes
    const ro = new ResizeObserver(() => measure())
    ro.observe(frame)
    if (canvas) ro.observe(canvas)

    // MutationObserver for CSS variable changes (theme edits)
    const mo = new MutationObserver(() => measure())
    mo.observe(frame, { attributes: true, attributeFilter: ["style"] })

    window.addEventListener("resize", measure)
    return () => { ro.disconnect(); mo.disconnect(); window.removeEventListener("resize", measure) }
  }, [visible, measure])

  return state
}
