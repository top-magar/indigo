"use client"
import { useState, useRef, useCallback } from "react"
import type { CssUnit } from "../../types"

const UNITS: CssUnit[] = ["px", "rem", "em", "%", "vw", "vh"]

interface NumericScrubProps {
  value: number
  unit: CssUnit
  onChange: (value: number, unit: CssUnit) => void
  min?: number
  max?: number
  step?: number
  label?: string
}

export function NumericScrubInput({ value, unit, onChange, min = -9999, max = 9999, step = 1, label }: NumericScrubProps) {
  const [editing, setEditing] = useState(false)
  const startX = useRef(0)
  const startVal = useRef(0)
  const dragging = useRef(false)

  const clamp = (v: number) => Math.max(min, Math.min(max, v))

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (editing) return
    startX.current = e.clientX
    startVal.current = value
    dragging.current = false
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [value, editing])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (editing) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 2) dragging.current = true
    if (!dragging.current) return
    const sensitivity = e.shiftKey ? 0.1 : 1
    const newVal = clamp(Math.round((startVal.current + dx * sensitivity * step) * 10) / 10)
    onChange(newVal, unit)
  }, [editing, step, unit, onChange, min, max])

  const handlePointerUp = useCallback(() => {
    if (!dragging.current && !editing) setEditing(true)
    dragging.current = false
  }, [editing])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") { e.preventDefault(); onChange(clamp(value + (e.shiftKey ? 10 : 1) * step), unit) }
    if (e.key === "ArrowDown") { e.preventDefault(); onChange(clamp(value - (e.shiftKey ? 10 : 1) * step), unit) }
    if (e.key === "Enter") (e.target as HTMLInputElement).blur()
    if (e.key === "Escape") { setEditing(false) }
  }, [value, unit, step, onChange, min, max])

  const cycleUnit = useCallback(() => {
    const idx = UNITS.indexOf(unit)
    const next = UNITS[(idx + 1) % UNITS.length]
    onChange(value, next)
  }, [value, unit, onChange])

  return (
    <div className="flex items-center h-7 rounded-md border border-border bg-background text-[11px] overflow-hidden group hover:border-ring/50 transition-colors">
      {label && <span className="text-muted-foreground/60 pl-2 pr-1 select-none text-[10px]">{label}</span>}
      {editing ? (
        <input autoFocus type="number" defaultValue={value} step={step} min={min} max={max}
          className="w-full px-1.5 text-[11px] bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          onBlur={(e) => { onChange(clamp(Number(e.target.value) || 0), unit); setEditing(false) }}
          onKeyDown={handleKeyDown} />
      ) : (
        <div className="flex-1 px-1.5 select-none cursor-ew-resize"
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
          {value}
        </div>
      )}
      <button onClick={cycleUnit}
        className="px-1.5 text-[9px] text-muted-foreground font-medium border-l border-border hover:bg-accent/50 h-full shrink-0 min-w-[28px] transition-colors">
        {unit}
      </button>
    </div>
  )
}
