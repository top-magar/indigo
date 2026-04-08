/** Shared zoom step values (as decimals: 0.25 = 25%) */
export const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const

export const ZOOM_MIN = ZOOM_STEPS[0]
export const ZOOM_MAX = ZOOM_STEPS[ZOOM_STEPS.length - 1]

export function zoomIn(current: number): number {
  const next = ZOOM_STEPS.filter((s) => s > current + 0.001)
  return next.length ? next[0] : ZOOM_MAX
}

export function zoomOut(current: number): number {
  const prev = ZOOM_STEPS.filter((s) => s < current - 0.001)
  return prev.length ? prev[prev.length - 1] : ZOOM_MIN
}

/** Clamp and round to nearest 1% for clean display */
export function clampZoom(z: number): number {
  return Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)) * 100) / 100
}
