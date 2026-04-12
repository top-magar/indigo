/**
 * HSB (Hue-Saturation-Brightness) color utilities
 * Used by color pickers across the editor.
 */

/** Convert HSB values to a hex color string */
export function hsbToHex(h: number, s: number, b: number): string {
  const c = b * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = b - c
  let r = 0, g = 0, bl = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; bl = x }
  else if (h < 240) { g = x; bl = c }
  else if (h < 300) { r = x; bl = c }
  else { r = c; bl = x }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}

/** Convert a hex color string to HSB tuple */
export function hexToHsb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return [h, max === 0 ? 0 : d / max, max]
}

/** Validate a 6-digit hex color string */
export function isValidHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v)
}
