"use client"
import { useState, useCallback } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { StyleValue } from "../../types"

interface GradientStop { color: string; position: number }

function buildGradientCSS(type: string, angle: number, stops: GradientStop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(", ")
  return type === "radial"
    ? `radial-gradient(circle, ${stopsStr})`
    : `linear-gradient(${angle}deg, ${stopsStr})`
}

function parseGradient(value: string): { type: string; angle: number; stops: GradientStop[] } | null {
  const linearMatch = value.match(/^linear-gradient\((\d+)deg,\s*(.+)\)$/)
  if (linearMatch) {
    const stops = linearMatch[2].split(",").map((s) => {
      const parts = s.trim().split(/\s+/)
      return { color: parts[0], position: parseInt(parts[1]) || 0 }
    })
    return { type: "linear", angle: parseInt(linearMatch[1]), stops }
  }
  const radialMatch = value.match(/^radial-gradient\(circle,\s*(.+)\)$/)
  if (radialMatch) {
    const stops = radialMatch[1].split(",").map((s) => {
      const parts = s.trim().split(/\s+/)
      return { color: parts[0], position: parseInt(parts[1]) || 0 }
    })
    return { type: "radial", angle: 0, stops }
  }
  return null
}

export function GradientEditor({ value, onChange }: { value: string; onChange: (css: string) => void }) {
  const parsed = parseGradient(value)
  const [type, setType] = useState(parsed?.type ?? "linear")
  const [angle, setAngle] = useState(parsed?.angle ?? 180)
  const [stops, setStops] = useState<GradientStop[]>(parsed?.stops ?? [
    { color: "#3b82f6", position: 0 },
    { color: "#8b5cf6", position: 100 },
  ])

  const commit = useCallback((t: string, a: number, s: GradientStop[]) => {
    onChange(buildGradientCSS(t, a, s))
  }, [onChange])

  const updateStop = (idx: number, patch: Partial<GradientStop>) => {
    const next = stops.map((s, i) => i === idx ? { ...s, ...patch } : s)
    setStops(next)
    commit(type, angle, next)
  }

  const addStop = () => {
    const next = [...stops, { color: "#000000", position: 50 }]
    setStops(next)
    commit(type, angle, next)
  }

  const removeStop = (idx: number) => {
    if (stops.length <= 2) return
    const next = stops.filter((_, i) => i !== idx)
    setStops(next)
    commit(type, angle, next)
  }

  const preview = buildGradientCSS(type, angle, stops)

  return (
    <div className="space-y-2">
      {/* Preview */}
      <div className="h-8 rounded-md border" style={{ background: preview }} />

      {/* Type + Angle */}
      <div className="flex gap-2">
        <Select value={type} onValueChange={(v) => { setType(v); commit(v, angle, stops) }}>
          <SelectTrigger className="h-7 text-[11px] flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="radial">Radial</SelectItem>
          </SelectContent>
        </Select>
        {type === "linear" && (
          <Input type="number" value={angle} onChange={(e) => { const a = Number(e.target.value); setAngle(a); commit(type, a, stops) }}
            className="h-7 text-[11px] w-16" min={0} max={360} />
        )}
      </div>

      {/* Stops */}
      {stops.map((stop, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input type="color" value={stop.color} onChange={(e) => updateStop(i, { color: e.target.value })}
            className="w-6 h-6 rounded border cursor-pointer p-0 shrink-0" />
          <Input value={stop.position} onChange={(e) => updateStop(i, { position: Number(e.target.value) })}
            type="number" min={0} max={100} className="h-6 text-[10px] w-14" />
          <span className="text-[9px] text-muted-foreground">%</span>
          {stops.length > 2 && (
            <Button variant="ghost" size="icon" className="size-5 shrink-0" onClick={() => removeStop(i)}>
              <Trash2 className="size-2.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full h-6 text-[10px]" onClick={addStop}>
        <Plus className="size-3" /> Add Stop
      </Button>
    </div>
  )
}

export function GradientPopover({ value, onChange }: { value: string; onChange: (v: StyleValue) => void }) {
  const current = value || ""
  const hasGradient = current.includes("gradient")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-6 h-6 rounded border border-border cursor-pointer shrink-0 shadow-sm"
          style={{ background: hasGradient ? current : "linear-gradient(135deg, #ddd 25%, #eee 75%)" }} />
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-3 z-50" side="bottom" align="start" sideOffset={4}>
        <GradientEditor value={current} onChange={(css) => onChange({ type: "unparsed", value: css })} />
      </PopoverContent>
    </Popover>
  )
}
