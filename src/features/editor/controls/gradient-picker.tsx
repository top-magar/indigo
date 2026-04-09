"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"

type GradientMode = "solid" | "linear" | "radial"

interface GradientPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function parseMode(value: string): GradientMode {
  if (value.startsWith("linear-gradient")) return "linear"
  if (value.startsWith("radial-gradient")) return "radial"
  return "solid"
}

const PRESETS = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(180deg, #0f172a, #1e293b)",
]

export function GradientPicker({ label, value, onChange }: GradientPickerProps) {
  const mode = parseMode(value)
  const [color1, setColor1] = useState(() => mode === "solid" ? (value || "#ffffff") : "#667eea")
  const [color2, setColor2] = useState("#764ba2")
  const [angle, setAngle] = useState(135)

  const buildGradient = (c1: string, c2: string, a: number, m: GradientMode) => {
    if (m === "solid") return c1
    if (m === "radial") return `radial-gradient(circle, ${c1}, ${c2})`
    return `linear-gradient(${a}deg, ${c1}, ${c2})`
  }

  const setMode = (m: GradientMode) => {
    onChange(buildGradient(color1, color2, angle, m))
  }

  const updateColor = (which: 1 | 2, c: string) => {
    if (which === 1) { setColor1(c); onChange(buildGradient(c, color2, angle, mode)) }
    else { setColor2(c); onChange(buildGradient(color1, c, angle, mode)) }
  }

  const updateAngle = (a: number) => {
    setAngle(a)
    onChange(buildGradient(color1, color2, a, mode))
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>

      {/* Mode selector */}
      <div className="flex gap-1">
        {(["solid", "linear", "radial"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 h-7 text-[11px] font-medium rounded border capitalize"
            style={{ borderColor: mode === m ? "var(--editor-accent, #005bd3)" : "var(--editor-border)", background: mode === m ? "var(--editor-accent-light, #e8f0fe)" : "transparent" }}>
            {m}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="h-8 rounded-md border" style={{ background: value || "#ffffff" }} />

      {/* Color inputs */}
      <div className="flex gap-2">
        <label className="flex-1 flex items-center gap-1.5">
          <input type="color" value={color1} onChange={(e) => updateColor(1, e.target.value)} className="size-5 rounded border-0 cursor-pointer" />
          <span className="text-[11px] text-muted-foreground">{mode === "solid" ? "Color" : "From"}</span>
        </label>
        {mode !== "solid" && (
          <label className="flex-1 flex items-center gap-1.5">
            <input type="color" value={color2} onChange={(e) => updateColor(2, e.target.value)} className="size-5 rounded border-0 cursor-pointer" />
            <span className="text-[11px] text-muted-foreground">To</span>
          </label>
        )}
      </div>

      {/* Angle (linear only) */}
      {mode === "linear" && (
        <label className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground w-10">Angle</span>
          <input type="range" min={0} max={360} value={angle} onChange={(e) => updateAngle(+e.target.value)} className="flex-1 h-1" />
          <span className="text-[11px] font-mono text-muted-foreground w-8">{angle}°</span>
        </label>
      )}

      {/* Presets */}
      {mode !== "solid" && (
        <div className="flex gap-1 flex-wrap">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => onChange(p)} className="size-5 rounded border hover:ring-2 ring-blue-400" style={{ background: p }} />
          ))}
        </div>
      )}
    </div>
  )
}
