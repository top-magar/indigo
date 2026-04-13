"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { Pipette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// ── Color math (no deps) ──

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
  }
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, "0")
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`
}

function hexToHsv(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  const v = max
  const s = max === 0 ? 0 : d / max
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else h = ((r - g) / d + 4) * 60
  }
  return [h, s, v]
}

const PRESETS = ["#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"]

// ── Saturation/Value canvas ──

function SaturationCanvas({ hue, sat, val, onChange }: { hue: number; sat: number; val: number; onChange: (s: number, v: number) => void }) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = useCallback((e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
    onChange(s, v)
  }, [onChange])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    update(e)
  }, [update])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging.current) update(e)
  }, [update])

  const onPointerUp = useCallback(() => { dragging.current = false }, [])

  return (
    <div ref={canvasRef} className="relative w-full h-36 rounded-md cursor-crosshair select-none touch-none"
      style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))` }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <div className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%`, backgroundColor: hsvToHex(hue, sat, val) }} />
    </div>
  )
}

// ── Hue slider ──

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = useCallback((e: { clientX: number }) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    onChange(Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)))
  }, [onChange])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    update(e)
  }, [update])

  return (
    <div ref={ref} className="relative h-3 rounded-full cursor-pointer select-none touch-none"
      style={{ background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)" }}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => { if (dragging.current) update(e) }}
      onPointerUp={() => { dragging.current = false }}>
      <div className="absolute top-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${(hue / 360) * 100}%`, backgroundColor: `hsl(${hue}, 100%, 50%)` }} />
    </div>
  )
}

// ── Eyedropper ──

function EyeDropperButton({ onPick }: { onPick: (hex: string) => void }) {
  if (typeof window === "undefined" || !("EyeDropper" in window)) return null
  return (
    <Button variant="outline" size="icon" className="size-8 shrink-0" onClick={async () => {
      try {
        // @ts-expect-error EyeDropper API
        const result = await new window.EyeDropper().open()
        onPick(result.sRGBHex)
      } catch { /* user cancelled */ }
    }}>
      <Pipette className="size-3.5" />
    </Button>
  )
}

// ── Main export ──

export function EditorColorPicker({ value, onCommit }: { value: string; onCommit: (hex: string) => void }) {
  const [open, setOpen] = useState(false)
  const [h, s, v] = hexToHsv(value || "#000000")
  const [hue, setHue] = useState(h)
  const [sat, setSat] = useState(s)
  const [val, setVal] = useState(v)
  const [hexInput, setHexInput] = useState(value || "#000000")

  // Sync local state when popover opens
  useEffect(() => {
    if (open) {
      const [h2, s2, v2] = hexToHsv(value || "#000000")
      setHue(h2); setSat(s2); setVal(v2); setHexInput(value || "#000000")
    }
  }, [open, value])

  // Keep hex input in sync with HSV
  const currentHex = hsvToHex(hue, sat, val)
  useEffect(() => { setHexInput(currentHex) }, [currentHex])

  const handleHexInput = (raw: string) => {
    setHexInput(raw)
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      const [h2, s2, v2] = hexToHsv(raw)
      setHue(h2); setSat(s2); setVal(v2)
    }
  }

  const handlePreset = (hex: string) => {
    const [h2, s2, v2] = hexToHsv(hex)
    setHue(h2); setSat(s2); setVal(v2)
  }

  return (
    <Popover open={open} onOpenChange={(o) => {
      setOpen(o)
      if (!o) onCommit(currentHex)
    }}>
      <PopoverTrigger asChild>
        <button className="w-6 h-6 rounded border border-border cursor-pointer shrink-0 shadow-sm"
          style={{ backgroundColor: value || "#000000" }} />
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-3 space-y-3" side="left" align="start">
        <SaturationCanvas hue={hue} sat={sat} val={val} onChange={(s2, v2) => { setSat(s2); setVal(v2) }} />
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-2">
            <HueSlider hue={hue} onChange={setHue} />
          </div>
          <EyeDropperButton onPick={(hex) => handlePreset(hex)} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md border border-border shrink-0" style={{ backgroundColor: currentHex }} />
          <Input value={hexInput} onChange={(e) => handleHexInput(e.target.value)}
            className="h-8 text-[11px] font-mono flex-1" spellCheck={false} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {PRESETS.map((c) => (
            <button key={c} onClick={() => handlePreset(c)}
              className="w-5 h-5 rounded-sm border border-border/50 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
