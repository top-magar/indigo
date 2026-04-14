"use client"
import { useState, useCallback } from "react"
import { Link2, Unlink } from "lucide-react"
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
      <input autoFocus className="w-10 h-5 text-[10px] text-center bg-transparent border-b border-current outline-none tabular-nums"
        style={{ color }} defaultValue={value || "0"}
        onBlur={(e) => { onChange(e.target.value); setEditing(false) }}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setEditing(false) }} />
    )
  }
  return (
    <button onClick={() => setEditing(true)} className="w-10 h-5 text-[10px] text-center rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-text tabular-nums transition-colors" style={{ color }}>
      {value || "–"}
    </button>
  )
}

export function BoxModelEditor({ styles, onChange }: {
  styles: Map<string, StyleValue>
  onChange: (property: string, value: StyleValue) => void
}) {
  const [linkedMargin, setLinkedMargin] = useState(false)
  const [linkedPadding, setLinkedPadding] = useState(false)

  const handleChange = useCallback((property: string, raw: string) => {
    const sv = toStyleValue(raw)
    if (!sv) return
    // If linked, set all 4 sides
    const isMargin = property.startsWith("margin")
    const isLinked = isMargin ? linkedMargin : linkedPadding
    if (isLinked) {
      const prefix = isMargin ? "margin" : "padding"
      for (const side of ["Top", "Right", "Bottom", "Left"]) onChange(`${prefix}${side}`, sv)
    } else {
      onChange(property, sv)
    }
  }, [onChange, linkedMargin, linkedPadding])

  const m = (side: Side) => parseUnit(styles.get(`margin${side}`))
  const p = (side: Side) => parseUnit(styles.get(`padding${side}`))
  const mAll = parseUnit(styles.get("margin"))
  const pAll = parseUnit(styles.get("padding"))

  return (
    <div className="px-4 py-3">
      <div className="relative rounded-md border border-orange-300/40 dark:border-orange-700/30 bg-orange-50/80 dark:bg-orange-950/20">
        <div className="absolute top-1 left-2 text-[9px] text-orange-400/80 font-semibold uppercase tracking-widest select-none">margin</div>
        <button onClick={() => setLinkedMargin(!linkedMargin)} className="absolute top-1 right-2 text-orange-400/60 hover:text-orange-500 transition-colors" title={linkedMargin ? "Unlink sides" : "Link all sides"}>
          {linkedMargin ? <Link2 className="size-3" /> : <Unlink className="size-3" />}
        </button>

        <div className="flex justify-center pt-4 pb-0.5">
          <SpacingInput value={m("Top") || mAll} onChange={(v) => handleChange("marginTop", v)} color="rgb(251 146 60)" />
        </div>
        <div className="flex items-center">
          <div className="flex justify-center w-11 shrink-0">
            <SpacingInput value={m("Left") || mAll} onChange={(v) => handleChange("marginLeft", v)} color="rgb(251 146 60)" />
          </div>

          {/* Padding box */}
          <div className="flex-1 rounded border border-green-300/40 dark:border-green-700/30 bg-green-50/80 dark:bg-green-950/20 relative">
            <div className="absolute top-1 left-2 text-[9px] text-green-500/80 font-semibold uppercase tracking-widest select-none">padding</div>
            <button onClick={() => setLinkedPadding(!linkedPadding)} className="absolute top-1 right-2 text-green-500/60 hover:text-green-600 transition-colors" title={linkedPadding ? "Unlink sides" : "Link all sides"}>
              {linkedPadding ? <Link2 className="size-3" /> : <Unlink className="size-3" />}
            </button>

            <div className="flex justify-center pt-4 pb-0.5">
              <SpacingInput value={p("Top") || pAll} onChange={(v) => handleChange("paddingTop", v)} color="rgb(34 197 94)" />
            </div>
            <div className="flex items-center">
              <div className="flex justify-center w-11 shrink-0">
                <SpacingInput value={p("Left") || pAll} onChange={(v) => handleChange("paddingLeft", v)} color="rgb(34 197 94)" />
              </div>
              <div className="flex-1 h-9 rounded border border-blue-300/30 dark:border-blue-700/20 bg-blue-50/60 dark:bg-blue-950/15 flex items-center justify-center">
                <span className="text-[9px] text-blue-400/70 font-medium select-none">element</span>
              </div>
              <div className="flex justify-center w-11 shrink-0">
                <SpacingInput value={p("Right") || pAll} onChange={(v) => handleChange("paddingRight", v)} color="rgb(34 197 94)" />
              </div>
            </div>
            <div className="flex justify-center pt-0.5 pb-2">
              <SpacingInput value={p("Bottom") || pAll} onChange={(v) => handleChange("paddingBottom", v)} color="rgb(34 197 94)" />
            </div>
          </div>

          <div className="flex justify-center w-11 shrink-0">
            <SpacingInput value={m("Right") || mAll} onChange={(v) => handleChange("marginRight", v)} color="rgb(251 146 60)" />
          </div>
        </div>
        <div className="flex justify-center pt-0.5 pb-2">
          <SpacingInput value={m("Bottom") || mAll} onChange={(v) => handleChange("marginBottom", v)} color="rgb(251 146 60)" />
        </div>
      </div>
    </div>
  )
}
