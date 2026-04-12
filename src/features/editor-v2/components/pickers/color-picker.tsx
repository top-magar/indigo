"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Pipette } from "lucide-react"
import { hsbToHex, hexToHsb, isValidHex } from "@/shared/colors/hsb"
import { SectionLabel } from "../ui-primitives"

// ── EyeDropper type ─────────────────────────────────────────────

interface EyeDropperResult { sRGBHex: string }
interface EyeDropperAPI { open(): Promise<EyeDropperResult> }
declare global {
  interface Window { EyeDropper?: new () => EyeDropperAPI }
}

// ── Recent colors (module-level, persists across mounts) ────────

let recentColors: string[] = []
function addRecent(hex: string): void {
  recentColors = [hex, ...recentColors.filter((c) => c !== hex)].slice(0, 8)
}

// ── Theme presets (V2 CSS var names) ────────────────────────────

const THEME_PRESETS = [
  { label: "Primary", var: "--store-color-primary", fallback: "#000000" },
  { label: "Secondary", var: "--store-color-secondary", fallback: "#6b7280" },
  { label: "Accent", var: "--store-color-accent", fallback: "#3b82f6" },
  { label: "Background", var: "--store-color-bg", fallback: "#ffffff" },
  { label: "Text", var: "--store-color-text", fallback: "#111827" },
] as const

function getComputedColor(cssVar: string, fallback: string): string {
  if (typeof window === "undefined") return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || fallback
}

// ── Saturation/Brightness canvas ────────────────────────────────

function SatBrightArea({ hue, sat, bright, onChange }: {
  hue: number; sat: number; bright: number
  onChange: (s: number, b: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const pick = useCallback((e: MouseEvent | React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const b = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
    onChange(s, b)
  }, [onChange])

  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) pick(e) }
    const up = () => { dragging.current = false }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) }
  }, [pick])

  return (
    <div
      ref={ref}
      onMouseDown={(e) => { dragging.current = true; pick(e) }}
      className="relative w-full rounded cursor-crosshair"
      style={{
        height: 150,
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsbToHex(hue, 1, 1)})`,
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: 12, height: 12, borderRadius: 6,
          border: "2px solid white",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.1)",
          left: `${sat * 100}%`, top: `${(1 - bright) * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  )
}

// ── Hue slider ──────────────────────────────────────────────────

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const pick = useCallback((e: MouseEvent | React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    onChange(Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)))
  }, [onChange])

  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) pick(e) }
    const up = () => { dragging.current = false }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) }
  }, [pick])

  return (
    <div
      ref={ref}
      onMouseDown={(e) => { dragging.current = true; pick(e) }}
      className="relative w-full cursor-pointer"
      style={{
        height: 12, borderRadius: 6,
        background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
      }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 14, height: 14, borderRadius: 7,
          border: "2px solid white",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.2)",
          left: `${(hue / 360) * 100}%`,
          transform: "translate(-50%, -50%)",
          background: hsbToHex(hue, 1, 1),
        }}
      />
    </div>
  )
}

// ── Main ColorPicker ────────────────────────────────────────────

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const safeHex = isValidHex(value) ? value : "#000000"
  const [hsb, setHsb] = useState(() => hexToHsb(safeHex))
  const [hexInput, setHexInput] = useState(safeHex)
  const [hue, sat, bri] = hsb

  const commit = useCallback((hex: string) => {
    onChange(hex)
    addRecent(hex)
  }, [onChange])

  const updateFromHsb = useCallback((h: number, s: number, b: number) => {
    setHsb([h, s, b])
    const hex = hsbToHex(h, s, b)
    setHexInput(hex)
    commit(hex)
  }, [commit])

  const handleHexCommit = useCallback(() => {
    const v = hexInput.startsWith("#") ? hexInput : `#${hexInput}`
    if (isValidHex(v)) {
      setHsb(hexToHsb(v))
      commit(v)
    } else {
      setHexInput(hsbToHex(hue, sat, bri))
    }
  }, [hexInput, hue, sat, bri, commit])

  useEffect(() => {
    if (isValidHex(value) && value !== hsbToHex(hue, sat, bri)) {
      setHsb(hexToHsb(value))
      setHexInput(value)
    }
  }, [value])

  const eyedrop = async () => {
    if (!window.EyeDropper) return
    try {
      const result = await new window.EyeDropper().open()
      setHsb(hexToHsb(result.sRGBHex))
      setHexInput(result.sRGBHex)
      commit(result.sRGBHex)
    } catch { /* user cancelled */ }
  }

  const themeColors = THEME_PRESETS.map((p) => ({
    ...p, hex: getComputedColor(p.var, p.fallback),
  }))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-7 w-7 rounded-md ring-1 ring-border/30 shrink-0 cursor-pointer" style={{ backgroundColor: safeHex }} />
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-3 flex flex-col gap-2.5">
        <SatBrightArea hue={hue} sat={sat} bright={bri} onChange={(s, b) => updateFromHsb(hue, s, b)} />
        <HueSlider hue={hue} onChange={(h) => updateFromHsb(h, sat, bri)} />

        {/* Hex input + eyedropper */}
        <div className="flex gap-2 items-center">
          <div className="w-7 h-7 rounded shrink-0 ring-1 ring-border/30" style={{ backgroundColor: hsbToHex(hue, sat, bri) }} />
          <Input
            value={hexInput} onChange={(e) => setHexInput(e.target.value)}
            onBlur={handleHexCommit} onKeyDown={(e) => { if (e.key === "Enter") handleHexCommit() }}
            className="h-7 text-xs font-mono flex-1" maxLength={7}
          />
          {window.EyeDropper && (
            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={eyedrop}>
              <Pipette className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Theme presets */}
        <div>
          <p className="mb-1"><SectionLabel>Theme</SectionLabel></p>
          <div className="flex gap-1">
            {themeColors.map((c) => (
              <Tooltip key={c.var}>
                <TooltipTrigger asChild>
                  <button
                    className="size-5 rounded ring-1 ring-border/20 cursor-pointer"
                    onClick={() => { updateFromHsb(...hexToHsb(c.hex)) }}
                    style={{ backgroundColor: c.hex, boxShadow: value === c.hex ? "0 0 0 2px hsl(var(--primary))" : "none" }}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{c.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Recent colors */}
        {recentColors.length > 0 && (
          <div>
            <p className="mb-1"><SectionLabel>Recent</SectionLabel></p>
            <div className="flex gap-1 flex-wrap">
              {recentColors.map((c) => (
                <button
                  key={c}
                  className="size-4 rounded-sm ring-1 ring-border/20 cursor-pointer"
                  onClick={() => { updateFromHsb(...hexToHsb(c)) }}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
