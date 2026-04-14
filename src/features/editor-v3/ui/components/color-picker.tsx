"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { Pipette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else h = ((r - g) / d + 4) * 60
  }
  return [h, max === 0 ? 0 : d / max, max]
}

const PRESETS = ["#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"]

// Recent colors — persisted across picker instances
const _recentColors: string[] = []
function addRecentColor(hex: string) {
  const idx = _recentColors.indexOf(hex)
  if (idx !== -1) _recentColors.splice(idx, 1)
  _recentColors.unshift(hex)
  if (_recentColors.length > 8) _recentColors.pop()
}

function AlphaSlider({ alpha, color, onChange }: { alpha: number; color: string; onChange: (a: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const update = useCallback((e: { clientX: number }) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    onChange(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
  }, [onChange])

  return (
    <div ref={ref} className="relative h-3 rounded-full cursor-pointer select-none touch-none"
      style={{ background: `linear-gradient(to right, transparent, ${color}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 8px 8px` }}
      onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); update(e) }}
      onPointerMove={(e) => { if (dragging.current) update(e) }}
      onPointerUp={() => { dragging.current = false }}>
      <div className="absolute top-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${alpha * 100}%`, backgroundColor: color }} />
    </div>
  )
}

function SaturationCanvas({ hue, sat, val, onChange }: { hue: number; sat: number; val: number; onChange: (s: number, v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = useCallback((e: { clientX: number; clientY: number }) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    onChange(
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)),
    )
  }, [onChange])

  return (
    <div ref={ref} className="relative w-full h-36 rounded-md cursor-crosshair select-none touch-none"
      style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))` }}
      onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); update(e) }}
      onPointerMove={(e) => { if (dragging.current) update(e) }}
      onPointerUp={() => { dragging.current = false }}>
      <div className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%`, backgroundColor: hsvToHex(hue, sat, val) }} />
    </div>
  )
}

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = useCallback((e: { clientX: number }) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    onChange(Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)))
  }, [onChange])

  return (
    <div ref={ref} className="relative h-3 rounded-full cursor-pointer select-none touch-none"
      style={{ background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)" }}
      onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); update(e) }}
      onPointerMove={(e) => { if (dragging.current) update(e) }}
      onPointerUp={() => { dragging.current = false }}>
      <div className="absolute top-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${(hue / 360) * 100}%`, backgroundColor: `hsl(${hue}, 100%, 50%)` }} />
    </div>
  )
}

export function EditorColorPicker({ value, onCommit }: { value: string; onCommit: (hex: string) => void }) {
  const [open, setOpen] = useState(false)
  const [hue, setHue] = useState(0)
  const [sat, setSat] = useState(0)
  const [val, setVal] = useState(0)
  const [alpha, setAlpha] = useState(1)
  const [hexInput, setHexInput] = useState(value || "#000000")
  const [format, setFormat] = useState<"hex" | "rgb">("hex")
  const commitTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Sync from store when popover opens
  useEffect(() => {
    if (open) {
      const [h, s, v] = hexToHsv(value || "#000000")
      setHue(h); setSat(s); setVal(v); setHexInput(value || "#000000")
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentHex = hsvToHex(hue, sat, val)

  // Debounced real-time commit — updates canvas as you drag
  const commitDebounced = useCallback((hex: string) => {
    clearTimeout(commitTimer.current)
    commitTimer.current = setTimeout(() => onCommit(hex), 16)
  }, [onCommit])

  const handleSatVal = useCallback((s: number, v: number) => {
    setSat(s); setVal(v)
    const hex = hsvToHex(hue, s, v)
    setHexInput(hex)
    commitDebounced(hex)
  }, [hue, commitDebounced])

  const handleHue = useCallback((h: number) => {
    setHue(h)
    const hex = hsvToHex(h, sat, val)
    setHexInput(hex)
    commitDebounced(hex)
  }, [sat, val, commitDebounced])

  const handleHexInput = (raw: string) => {
    setHexInput(raw)
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      const [h, s, v] = hexToHsv(raw)
      setHue(h); setSat(s); setVal(v)
      commitDebounced(raw)
    }
  }

  const handlePreset = (hex: string) => {
    const [h, s, v] = hexToHsv(hex)
    setHue(h); setSat(s); setVal(v); setHexInput(hex)
    addRecentColor(hex)
    onCommit(hex)
  }

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error EyeDropper API
      const result = await new window.EyeDropper().open()
      handlePreset(result.sRGBHex)
    } catch { /* cancelled */ }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-6 h-6 rounded border border-border cursor-pointer shrink-0 shadow-sm"
          style={{ backgroundColor: open ? currentHex : (value || "#000000") }} />
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-3 space-y-2.5 z-50" side="bottom" align="start" sideOffset={4}>
        <SaturationCanvas hue={hue} sat={sat} val={val} onChange={handleSatVal} />
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1.5">
            <HueSlider hue={hue} onChange={handleHue} />
            <AlphaSlider alpha={alpha} color={currentHex} onChange={(a) => { setAlpha(a); commitDebounced(currentHex) }} />
          </div>
          {typeof window !== "undefined" && "EyeDropper" in window && (
            <Button variant="outline" size="icon" className="size-7 shrink-0" onClick={handleEyeDropper}>
              <Pipette className="size-3" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded border border-border shrink-0" style={{ backgroundColor: currentHex, opacity: alpha }} />
          {format === "hex" ? (
            <Input value={hexInput} onChange={(e) => handleHexInput(e.target.value)}
              className="h-7 text-[11px] font-mono flex-1" spellCheck={false} />
          ) : (
            <div className="flex-1 text-[10px] font-mono text-muted-foreground px-1.5">
              {(() => { const [r, g, b] = [parseInt(currentHex.slice(1, 3), 16), parseInt(currentHex.slice(3, 5), 16), parseInt(currentHex.slice(5, 7), 16)]; return `rgb(${r}, ${g}, ${b})` })()}
            </div>
          )}
          <button onClick={() => setFormat(format === "hex" ? "rgb" : "hex")}
            className="h-6 px-1.5 text-[9px] rounded border border-border hover:bg-accent shrink-0">
            {format === "hex" ? "HEX" : "RGB"}
          </button>
        </div>
        {alpha < 1 && <div className="text-[9px] text-muted-foreground">Opacity: {Math.round(alpha * 100)}%</div>}
        <div className="flex gap-1 flex-wrap">
          {PRESETS.map((c) => (
            <button key={c} onClick={() => handlePreset(c)}
              className="w-5 h-5 rounded-sm border border-border/50 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c }} />
          ))}
        </div>
        {_recentColors.length > 0 && (
          <div>
            <div className="text-[9px] text-muted-foreground mb-1">Recent</div>
            <div className="flex gap-1">
              {_recentColors.map((c) => (
                <button key={c} onClick={() => handlePreset(c)}
                  className="w-5 h-5 rounded-sm border border-border/50 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
