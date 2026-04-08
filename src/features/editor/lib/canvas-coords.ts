import type { CanvasAdapter } from "./canvas-adapter"

/** Convert a screen-space DOMRect to canvas-relative coordinates, accounting for scroll and zoom. */
export function toCanvasCoords(
  rect: DOMRect,
  canvas: HTMLElement,
  zoom: number,
): { top: number; left: number; right: number; bottom: number; centerX: number; centerY: number; width: number; height: number } {
  const cr = canvas.getBoundingClientRect()
  const z = zoom || 1
  const top = (rect.top - cr.top + canvas.scrollTop) / z
  const left = (rect.left - cr.left + canvas.scrollLeft) / z
  const width = rect.width / z
  const height = rect.height / z
  return { top, left, right: left + width, bottom: top + height, centerX: left + width / 2, centerY: top + height / 2, width, height }
}

/** Parse zoom/scale from the transform matrix of the scaled element inside the canvas. */
export function getCanvasZoom(canvas: HTMLElement): number {
  const scaled = canvas.querySelector("[style*='scale']") as HTMLElement | null
  if (!scaled) return 1
  const t = getComputedStyle(scaled).transform
  if (!t || t === "none") return 1
  const m = t.match(/matrix\(([^,]+)/)
  return m ? parseFloat(m[1]) : 1
}

/** Adapter-based zoom getter */
export function getZoomFromAdapter(adapter: CanvasAdapter): number {
  return adapter.getZoom()
}
