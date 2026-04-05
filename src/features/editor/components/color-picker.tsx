"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"

// ── Color conversion utils ──────────────────────────────────────

function hexToHsb(hex: string): [number, number, number] {
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
  const s = max === 0 ? 0 : d / max
  return [h, s, max]
}

function hsbToHex(h: number, s: number, b: number): string {
  const c = b * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = b - c
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

function isValidHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v)
}

// ── Recent colors store (module-level) ──────────────────────────

let recentColors: string[] = []
function addRecent(hex: string) {
  recentColors = [hex, ...recentColors.filter((c) => c !== hex)].slice(0, 8)
}

// ── Theme presets ───────────────────────────────────────────────

const THEME_PRESETS = [
  { label: "Primary", var: "--store-primary", fallback: "#000000" },
  { label: "Secondary", var: "--store-secondary", fallback: "#6b7280" },
  { label: "Accent", var: "--store-accent", fallback: "#3b82f6" },
  { label: "Background", var: "--store-bg", fallback: "#ffffff" },
  { label: "Text", var: "--store-text", fallback: "#111827" },
]

function getComputedColor(cssVar: string, fallback: string): string {
  if (typeof window === "undefined") return fallback
  const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  return val || fallback
}

// ── Saturation/Brightness area ──────────────────────────────────

function SatBrightArea({ hue, sat, bright, onChange }: {
  hue: number; sat: number; bright: number
  onChange: (s: number, b: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = useCallback((e: MouseEvent | React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const b = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
    onChange(s, b)
  }, [onChange])

  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) update(e) }
    const up = () => { dragging.current = false }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) }
  }, [update])

  return (
    <div
      ref={ref}
      onMouseDown={(e) => { dragging.current = true; update(e) }}
      style={{
        position: "relative", width: "100%", height: 140, borderRadius: 6, cursor: "crosshair",
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsbToHex(hue, 1, 1)})`,
      }}
    >
      <div style={{
        position: "absolute", width: 12, height: 12, borderRadius: 6,
        border: "2px solid white", boxShadow: "0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.1)",
        left: `${sat * 100}%`, top: `${(1 - bright) * 100}%`,
        transform: "translate(-50%, -50%)", pointerEvents: "none",
      }} />
    </div>
  )
}

// ── Hue slider ──────────────────────────────────────────────────

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = useCallback((e: MouseEvent | React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    onChange(Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)))
  }, [onChange])

  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) update(e) }
    const up = () => { dragging.current = false }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) }
  }, [update])

  return (
    <div
      ref={ref}
      onMouseDown={(e) => { dragging.current = true; update(e) }}
      style={{
        position: "relative", width: "100%", height: 12, borderRadius: 6, cursor: "pointer",
        background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
      }}
    >
      <div style={{
        position: "absolute", width: 14, height: 14, borderRadius: 7, top: -1,
        border: "2px solid white", boxShadow: "0 0 0 1px rgba(0,0,0,0.2)",
        left: `${(hue / 360) * 100}%`, transform: "translateX(-50%)",
        background: hsbToHex(hue, 1, 1), pointerEvents: "none",
      }} />
    </div>
  )
}

// ── Main ColorPicker popover ────────────────────────────────────

export function ColorPickerPopover({ value, onChange, onClose }: {
  value: string; onChange: (hex: string) => void; onClose: () => void
}) {
  const safeValue = isValidHex(value) ? value : "#000000"
  const [hsb, setHsb] = useState(() => hexToHsb(safeValue))
  const [hexInput, setHexInput] = useState(safeValue)

  const [hue, sat, bright] = hsb

  const updateFromHsb = useCallback((h: number, s: number, b: number) => {
    setHsb([h, s, b])
    const hex = hsbToHex(h, s, b)
    setHexInput(hex)
    onChange(hex)
  }, [onChange])

  const handleHexCommit = useCallback(() => {
    const v = hexInput.startsWith("#") ? hexInput : `#${hexInput}`
    if (isValidHex(v)) {
      const [h, s, b] = hexToHsb(v)
      setHsb([h, s, b])
      onChange(v)
      addRecent(v)
    } else {
      setHexInput(hsbToHex(hue, sat, bright))
    }
  }, [hexInput, hue, sat, bright, onChange])

  // Sync when value changes externally
  useEffect(() => {
    if (isValidHex(value) && value !== hsbToHex(hue, sat, bright)) {
      setHsb(hexToHsb(value))
      setHexInput(value)
    }
  }, [value])

  const themeColors = THEME_PRESETS.map((p) => ({
    ...p, hex: getComputedColor(p.var, p.fallback),
  }))

  return (
    <div
      style={{
        position: "absolute", top: "100%", left: 0, zIndex: 100, marginTop: 4,
        width: 240, padding: 12, borderRadius: 8,
        background: "var(--editor-surface)", border: "1px solid var(--editor-border)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column", gap: 10,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Saturation/Brightness area */}
      <SatBrightArea hue={hue} sat={sat} bright={bright} onChange={(s, b) => updateFromHsb(hue, s, b)} />

      {/* Hue slider */}
      <HueSlider hue={hue} onChange={(h) => updateFromHsb(h, sat, bright)} />

      {/* Hex input */}
      <div className="flex gap-2 items-center">
        <div className="w-7 h-7 rounded shrink-0" style={{ backgroundColor: hsbToHex(hue, sat, bright), border: '1px solid var(--editor-border)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />
        <Input value={hexInput} onChange={(e) => setHexInput(e.target.value)} onBlur={handleHexCommit}
          onKeyDown={(e) => { if (e.key === "Enter") handleHexCommit() }}
          className="h-7 text-xs font-mono" />
      </div>

      {/* Theme presets */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--editor-text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Theme</p>
        <div style={{ display: "flex", gap: 4 }}>
          {themeColors.map((c) => (
            <button
              key={c.var}
              title={c.label}
              onClick={() => { onChange(c.hex); addRecent(c.hex); setHsb(hexToHsb(c.hex)); setHexInput(c.hex) }}
              style={{
                width: 24, height: 24, borderRadius: 4, border: "1px solid var(--editor-border)",
                backgroundColor: c.hex, cursor: "pointer", padding: 0,
                boxShadow: value === c.hex ? "0 0 0 2px var(--editor-accent)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Recent colors */}
      {recentColors.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--editor-text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Recent</p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {recentColors.map((c) => (
              <button
                key={c}
                onClick={() => { onChange(c); setHsb(hexToHsb(c)); setHexInput(c) }}
                style={{
                  width: 20, height: 20, borderRadius: 3, border: "1px solid var(--editor-border)",
                  backgroundColor: c, cursor: "pointer", padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
