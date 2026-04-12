"use client"
import { useState, useCallback } from "react"
import type { StyleValue, CssUnit } from "../../types"
import { useStore } from "../use-store"

const commonProps = [
  { group: "Layout", props: ["display", "flexDirection", "alignItems", "justifyContent", "gap"] },
  { group: "Spacing", props: ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft"] },
  { group: "Size", props: ["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"] },
  { group: "Typography", props: ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "textAlign"] },
  { group: "Background", props: ["backgroundColor"] },
  { group: "Border", props: ["borderRadius", "borderWidth", "borderColor", "borderStyle"] },
  { group: "Effects", props: ["opacity", "overflow"] },
]

const FONT_OPTIONS = [
  "", "Arial, sans-serif", "Helvetica, sans-serif", "Georgia, serif", "Times New Roman, serif",
  "Courier New, monospace", "Verdana, sans-serif", "Trebuchet MS, sans-serif", "system-ui, sans-serif",
  "Inter, sans-serif", "Roboto, sans-serif", "Open Sans, sans-serif", "Lato, sans-serif",
  "Montserrat, sans-serif", "Poppins, sans-serif", "Raleway, sans-serif", "Playfair Display, serif",
  "Merriweather, serif", "Source Sans 3, sans-serif", "Nunito, sans-serif", "Oswald, sans-serif",
  "DM Sans, sans-serif", "Space Grotesk, sans-serif", "Outfit, sans-serif", "Sora, sans-serif",
]

function parseValue(raw: string): StyleValue {
  const m = raw.match(/^(-?\d+\.?\d*)(px|rem|em|%|vw|vh|fr|ch)$/)
  if (m) return { type: "unit", value: Number(m[1]), unit: m[2] as CssUnit }
  if (raw.startsWith("#") && raw.length === 7) {
    const r = parseInt(raw.slice(1, 3), 16), g = parseInt(raw.slice(3, 5), 16), b = parseInt(raw.slice(5, 7), 16)
    return { type: "rgb", r, g, b, a: 1 }
  }
  return { type: "keyword", value: raw }
}

function formatValue(v: StyleValue): string {
  switch (v.type) {
    case "unit": return `${v.value}${v.unit}`
    case "keyword": return v.value
    case "rgb": return `#${[v.r, v.g, v.b].map((c) => c.toString(16).padStart(2, "0")).join("")}`
    case "unparsed": return v.value
    case "var": return v.value
  }
}

const COLOR_PROPS = new Set(["color", "backgroundColor", "borderColor"])

const FONT_PROP = "fontFamily"

function StyleRow({ property, value, hasResponsive, onChange }: { property: string; value: StyleValue | undefined; hasResponsive?: boolean; onChange: (v: StyleValue) => void }) {
  const [editing, setEditing] = useState(false)
  const display = value ? formatValue(value) : ""
  const isColor = COLOR_PROPS.has(property)
  const isFont = property === FONT_PROP
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-[10px] text-gray-500 w-24 shrink-0 truncate">
        {hasResponsive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1" title="Has responsive overrides" />}
        {property}
      </span>
      {isColor && (
        <input type="color" value={display || "#000000"} className="w-5 h-5 rounded border cursor-pointer p-0 shrink-0"
          onChange={(e) => onChange(parseValue(e.target.value))} />
      )}
      {isFont ? (
        <select value={display} onChange={(e) => { if (e.target.value) onChange({ type: "keyword", value: e.target.value }) }}
          className="flex-1 px-1 py-0.5 text-xs border rounded bg-white">
          {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f || "— default —"}</option>)}
        </select>
      ) : editing ? (
        <input autoFocus className="flex-1 px-1.5 py-0.5 text-xs border rounded" defaultValue={display}
          onBlur={(e) => { if (e.target.value) onChange(parseValue(e.target.value)); setEditing(false) }}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur() }} />
      ) : (
        <button onClick={() => setEditing(true)} className="flex-1 text-left text-xs px-1.5 py-0.5 rounded hover:bg-gray-100 min-h-[22px]">
          {display || <span className="text-gray-300">—</span>}
        </button>
      )}
    </div>
  )
}

export function StylePanel() {
  const s = useStore()

  const handleChange = useCallback((property: string, value: StyleValue) => {
    if (!s.selectedInstanceId) return
    let ssId: string | undefined
    const sel = s.styleSourceSelections.get(s.selectedInstanceId)
    if (sel) ssId = sel.values[0]
    if (!ssId) ssId = s.createLocalStyleSource(s.selectedInstanceId)
    s.setStyleDeclaration(ssId, s.currentBreakpointId, property, value)
  }, [s])

  const currentStyles = new Map<string, StyleValue>()
  const responsiveProps = new Set<string>()
  if (s.selectedInstanceId) {
    const sel = s.styleSourceSelections.get(s.selectedInstanceId)
    if (sel) {
      for (const ssId of sel.values) {
        for (const decl of s.styleDeclarations.values()) {
          if (decl.styleSourceId === ssId && !decl.state) {
            if (decl.breakpointId === s.currentBreakpointId) currentStyles.set(decl.property, decl.value)
            else responsiveProps.add(decl.property)
          }
        }
      }
    }
  }

  const [customCSS, setCustomCSS] = useState("")

  const applyCustomCSS = useCallback(() => {
    if (!s.selectedInstanceId) return
    const lines = customCSS.split(";").map((l) => l.trim()).filter(Boolean)
    for (const line of lines) {
      const [prop, ...rest] = line.split(":")
      if (!prop || rest.length === 0) continue
      const property = prop.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      const value = rest.join(":").trim()
      if (property && value) handleChange(property, parseValue(value))
    }
    setCustomCSS("")
  }, [s, customCSS, handleChange])

  if (!s.selectedInstanceId) return <div className="p-3 text-xs text-gray-400">Select an instance to style</div>

  return (
    <div className="p-3 overflow-y-auto">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Styles</div>
      {commonProps.map(({ group, props }) => (
        <div key={group} className="mb-3">
          <div className="text-[10px] font-medium text-gray-600 mb-1">{group}</div>
          {props.map((prop) => (
            <StyleRow key={prop} property={prop} value={currentStyles.get(prop)}
              hasResponsive={responsiveProps.has(prop)} onChange={(v) => handleChange(prop, v)} />
          ))}
        </div>
      ))}
      <div className="mt-4 pt-3 border-t">
        <div className="text-[10px] font-medium text-gray-600 mb-1">Custom CSS</div>
        <textarea value={customCSS} onChange={(e) => setCustomCSS(e.target.value)}
          placeholder="property: value; ..." rows={3}
          className="w-full px-2 py-1 text-[11px] font-mono border rounded resize-none bg-gray-50" />
        <button onClick={applyCustomCSS} className="mt-1 px-2 py-0.5 text-[10px] bg-gray-200 rounded hover:bg-gray-300">Apply</button>
      </div>
    </div>
  )
}
