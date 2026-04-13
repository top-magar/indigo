"use client"
import { useState, useCallback } from "react"
import type { StyleValue, CssUnit } from "../../types"

type Side = "Top" | "Right" | "Bottom" | "Left"

function parseUnit(v: StyleValue | undefined): string {
  if (!v) return ""
  if (v.type === "unit") return `${v.value}${v.unit}`
  if (v.type === "keyword") return v.value
  if (v.type === "unparsed") return v.value
  return ""
}

function toStyleValue(raw: string): StyleValue | null {
  if (!raw || raw === "0") return { type: "unit", value: 0, unit: "px" }
  const m = raw.match(/^(-?\d+\.?\d*)(px|rem|em|%|vw|vh)$/)
  if (m) return { type: "unit", value: Number(m[1]), unit: m[2] as CssUnit }
  if (raw === "auto") return { type: "keyword", value: "auto" }
  return null
}

function SpacingInput({ value, onChange, color }: { value: string; onChange: (v: string) => void; color: string }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <input autoFocus className="w-8 h-4 text-[9px] text-center bg-transparent border-b border-current outline-none"
        style={{ color }} defaultValue={value || "0"}
        onBlur={(e) => { onChange(e.target.value); setEditing(false) }}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setEditing(false) }} />
    )
  }

  return (
    <button onClick={() => setEditing(true)}
      className="w-8 h-4 text-[9px] text-center hover:underline cursor-text"
      style={{ color }}>
      {value || "–"}
    </button>
  )
}

export function BoxModelEditor({ styles, onChange }: {
  styles: Map<string, StyleValue>
  onChange: (property: string, value: StyleValue) => void
}) {
  const handleChange = useCallback((property: string, raw: string) => {
    const sv = toStyleValue(raw)
    if (sv) onChange(property, sv)
  }, [onChange])

  const m = (side: Side) => parseUnit(styles.get(`margin${side}`))
  const p = (side: Side) => parseUnit(styles.get(`padding${side}`))
  const mAll = parseUnit(styles.get("margin"))
  const pAll = parseUnit(styles.get("padding"))

  return (
    <div className="px-3 py-2">
      {/* Margin box */}
      <div className="relative bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-200/50 dark:border-orange-800/30">
        <div className="absolute top-0.5 left-1.5 text-[8px] text-orange-400 font-medium uppercase tracking-wider">margin</div>

        {/* Margin top */}
        <div className="flex justify-center pt-3 pb-0.5">
          <SpacingInput value={m("Top") || mAll} onChange={(v) => handleChange("marginTop", v)} color="rgb(251 146 60)" />
        </div>

        <div className="flex items-center">
          {/* Margin left */}
          <div className="flex justify-center w-10 shrink-0">
            <SpacingInput value={m("Left") || mAll} onChange={(v) => handleChange("marginLeft", v)} color="rgb(251 146 60)" />
          </div>

          {/* Padding box */}
          <div className="flex-1 bg-green-50 dark:bg-green-950/30 rounded border border-green-200/50 dark:border-green-800/30 relative">
            <div className="absolute top-0.5 left-1.5 text-[8px] text-green-500 font-medium uppercase tracking-wider">padding</div>

            {/* Padding top */}
            <div className="flex justify-center pt-3 pb-0.5">
              <SpacingInput value={p("Top") || pAll} onChange={(v) => handleChange("paddingTop", v)} color="rgb(34 197 94)" />
            </div>

            <div className="flex items-center">
              {/* Padding left */}
              <div className="flex justify-center w-10 shrink-0">
                <SpacingInput value={p("Left") || pAll} onChange={(v) => handleChange("paddingLeft", v)} color="rgb(34 197 94)" />
              </div>

              {/* Element center */}
              <div className="flex-1 h-8 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200/50 dark:border-blue-800/30 flex items-center justify-center">
                <span className="text-[8px] text-blue-400 font-medium">element</span>
              </div>

              {/* Padding right */}
              <div className="flex justify-center w-10 shrink-0">
                <SpacingInput value={p("Right") || pAll} onChange={(v) => handleChange("paddingRight", v)} color="rgb(34 197 94)" />
              </div>
            </div>

            {/* Padding bottom */}
            <div className="flex justify-center pt-0.5 pb-2">
              <SpacingInput value={p("Bottom") || pAll} onChange={(v) => handleChange("paddingBottom", v)} color="rgb(34 197 94)" />
            </div>
          </div>

          {/* Margin right */}
          <div className="flex justify-center w-10 shrink-0">
            <SpacingInput value={m("Right") || mAll} onChange={(v) => handleChange("marginRight", v)} color="rgb(251 146 60)" />
          </div>
        </div>

        {/* Margin bottom */}
        <div className="flex justify-center pt-0.5 pb-2">
          <SpacingInput value={m("Bottom") || mAll} onChange={(v) => handleChange("marginBottom", v)} color="rgb(251 146 60)" />
        </div>
      </div>
    </div>
  )
}
