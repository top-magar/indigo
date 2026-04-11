"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pipette } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
}

function hsbToHex(h: number, s: number, b: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return b - b * s * Math.max(Math.min(k, 4 - k, 1), 0)
  }
  const r = Math.round(f(5) * 255), g = Math.round(f(3) * 255), bl = Math.round(f(1) * 255)
  return `#${[r, g, bl].map(v => v.toString(16).padStart(2, "0")).join("")}`
}

function hexToHsb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  if (d) {
    if (max === r) h = ((g - b) / d + 6) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return [h, max ? d / max : 0, max]
}

function isValidHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v)
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const safeHex = isValidHex(value) ? value : "#000000"
  const [hsb, setHsb] = useState(() => hexToHsb(safeHex))
  const [hue, sat, bri] = hsb
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    if (isValidHex(value)) setHsb(hexToHsb(value))
  }, [value])

  const drawCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const w = 200, h = 150
    const hueColor = hsbToHex(hue, 1, 1)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, w, h)
    const hGrad = ctx.createLinearGradient(0, 0, w, 0)
    hGrad.addColorStop(0, "#fff")
    hGrad.addColorStop(1, hueColor)
    ctx.fillStyle = hGrad
    ctx.fillRect(0, 0, w, h)
    const vGrad = ctx.createLinearGradient(0, 0, 0, h)
    vGrad.addColorStop(0, "rgba(0,0,0,0)")
    vGrad.addColorStop(1, "#000")
    ctx.fillStyle = vGrad
    ctx.fillRect(0, 0, w, h)
  }, [hue])

  useEffect(() => { drawCanvas() }, [drawCanvas])

  const pickFromCanvas = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const b = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
    const newHsb: [number, number, number] = [hue, s, b]
    setHsb(newHsb)
    onChange(hsbToHex(...newHsb))
  }, [hue, onChange])

  const onCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    dragging.current = true
    pickFromCanvas(e)
  }, [pickFromCanvas])

  const onCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging.current) pickFromCanvas(e)
  }, [pickFromCanvas])

  useEffect(() => {
    const up = () => { dragging.current = false }
    window.addEventListener("mouseup", up)
    return () => window.removeEventListener("mouseup", up)
  }, [])

  const onHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = Number(e.target.value)
    const newHsb: [number, number, number] = [h, sat, bri]
    setHsb(newHsb)
    onChange(hsbToHex(...newHsb))
  }

  const onHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value
    if (!v.startsWith("#")) v = "#" + v
    if (isValidHex(v)) { setHsb(hexToHsb(v)); onChange(v) }
  }

  const eyedrop = async () => {
    if (!("EyeDropper" in window)) return
    try {
      const ed = new (window as Record<string, unknown> as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper()
      const result = await ed.open()
      onChange(result.sRGBHex)
    } catch { /* user cancelled */ }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-7 w-7 rounded-md ring-1 ring-border/30 shrink-0 cursor-pointer" style={{ backgroundColor: safeHex }} />
      </PopoverTrigger>
      <PopoverContent className="w-[224px] p-3 flex flex-col gap-2">
        <canvas
          ref={canvasRef} width={200} height={150}
          className="rounded cursor-crosshair w-[200px] h-[150px]"
          onMouseDown={onCanvasMouseDown} onMouseMove={onCanvasMouseMove}
        />
        <div className="relative h-3">
          <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }} />
          <input
            type="range" min={0} max={360} value={Math.round(hue)} onChange={onHueChange}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
          />
          <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-white shadow pointer-events-none" style={{ left: `${(hue / 360) * 100}%` }} />
        </div>
        <div className="flex gap-2 items-center">
          <Input value={safeHex} onChange={onHexInput} className="h-7 text-xs font-mono flex-1" maxLength={7} />
          {"EyeDropper" in globalThis && (
            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={eyedrop}>
              <Pipette className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
