"use client"
import { useState, useCallback } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { StyleValue, CssUnit } from "../../types"
import { useStore } from "../use-store"

const commonProps = [
  { group: "Layout", props: ["display", "flexDirection", "flexWrap", "alignItems", "justifyContent", "gap", "gridTemplateColumns", "gridTemplateRows"] },
  { group: "Position", props: ["position", "top", "right", "bottom", "left", "zIndex"] },
  { group: "Spacing", props: ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft"] },
  { group: "Size", props: ["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight", "aspectRatio"] },
  { group: "Typography", props: ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "textAlign", "textDecoration", "textTransform", "whiteSpace", "wordBreak"] },
  { group: "Background", props: ["backgroundColor", "backgroundImage", "backgroundSize", "backgroundPosition", "backgroundRepeat"] },
  { group: "Border", props: ["borderRadius", "borderWidth", "borderColor", "borderStyle", "borderTop", "borderBottom", "outline", "boxShadow"] },
  { group: "Effects", props: ["opacity", "overflow", "cursor", "pointerEvents", "userSelect", "mixBlendMode"] },
  { group: "Transitions", props: ["transition", "transitionDuration", "transitionTimingFunction", "transform"] },
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

const KEYWORD_OPTIONS: Record<string, string[]> = {
  display: ["block", "flex", "grid", "inline", "inline-block", "inline-flex", "inline-grid", "none"],
  flexDirection: ["row", "column", "row-reverse", "column-reverse"],
  flexWrap: ["nowrap", "wrap", "wrap-reverse"],
  alignItems: ["stretch", "flex-start", "flex-end", "center", "baseline"],
  justifyContent: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
  textAlign: ["left", "center", "right", "justify"],
  textDecoration: ["none", "underline", "line-through", "overline"],
  textTransform: ["none", "uppercase", "lowercase", "capitalize"],
  whiteSpace: ["normal", "nowrap", "pre", "pre-wrap", "pre-line"],
  wordBreak: ["normal", "break-all", "break-word"],
  overflow: ["visible", "hidden", "scroll", "auto"],
  cursor: ["auto", "default", "pointer", "text", "move", "not-allowed", "grab", "crosshair"],
  borderStyle: ["none", "solid", "dashed", "dotted", "double"],
  fontWeight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  pointerEvents: ["auto", "none"],
  userSelect: ["auto", "none", "text", "all"],
  backgroundSize: ["auto", "cover", "contain"],
  backgroundPosition: ["center", "top", "bottom", "left", "right", "top left", "top right", "bottom left", "bottom right"],
  backgroundRepeat: ["repeat", "no-repeat", "repeat-x", "repeat-y"],
  mixBlendMode: ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "difference", "exclusion"],
}

function StyleRow({ property, value, hasResponsive, onChange, onClear }: { property: string; value: StyleValue | undefined; hasResponsive?: boolean; onChange: (v: StyleValue) => void; onClear?: () => void }) {
  const [editing, setEditing] = useState(false)
  const display = value ? formatValue(value) : ""
  const isColor = COLOR_PROPS.has(property)
  const isFont = property === FONT_PROP
  const keywords = KEYWORD_OPTIONS[property]
  return (
    <div className="flex items-center gap-2 py-0.5" onContextMenu={(e) => { if (value && onClear) { e.preventDefault(); onClear() } }}>
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
          className="flex-1 px-1 py-0.5 text-[11px] border rounded bg-white">
          {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f || "— default —"}</option>)}
        </select>
      ) : keywords ? (
        <select value={display} onChange={(e) => { if (e.target.value) onChange({ type: "keyword", value: e.target.value }); else if (onClear) onClear() }}
          className="flex-1 px-1 py-0.5 text-[11px] border rounded bg-white">
          <option value="">—</option>
          {keywords.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      ) : editing ? (
        <input autoFocus className="flex-1 px-1.5 py-0.5 text-[11px] border rounded focus:ring-1 focus:ring-blue-300 focus:outline-none" defaultValue={display}
          onBlur={(e) => { if (e.target.value) onChange(parseValue(e.target.value)); setEditing(false) }}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setEditing(false) }} />
      ) : (
        <button onClick={() => setEditing(true)} className="flex-1 text-left text-[11px] px-1.5 py-0.5 rounded hover:bg-gray-100 min-h-[22px]">
          {display || <span className="text-gray-300">—</span>}
        </button>
      )}
    </div>
  )
}

function StyleGroup({ group, props, currentStyles, responsiveProps, onChange, onClear }: {
  group: string; props: string[]; currentStyles: Map<string, StyleValue>; responsiveProps: Set<string>
  onChange: (prop: string, v: StyleValue) => void; onClear: (prop: string) => void
}) {
  const [open, setOpen] = useState(true)
  const hasValues = props.some((p) => currentStyles.has(p))
  return (
    <div className="border-b border-gray-100">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        {open ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
        {group}
        {hasValues && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-auto" />}
      </button>
      {open && (
        <div className="px-3 pb-2">
          {props.map((prop) => (
            <StyleRow key={prop} property={prop} value={currentStyles.get(prop)}
              hasResponsive={responsiveProps.has(prop)} onChange={(v) => onChange(prop, v)} onClear={() => onClear(prop)} />
          ))}
        </div>
      )}
    </div>
  )
}

export function StylePanel() {
  const s = useStore()
  const [styleState, setStyleState] = useState<string | undefined>(undefined)

  const handleChange = useCallback((property: string, value: StyleValue) => {
    if (!s.selectedInstanceId) return
    let ssId: string | undefined
    const sel = s.styleSourceSelections.get(s.selectedInstanceId)
    if (sel) ssId = sel.values[0]
    if (!ssId) ssId = s.createLocalStyleSource(s.selectedInstanceId)
    s.setStyleDeclaration(ssId, s.currentBreakpointId, property, value, styleState)
  }, [s, styleState])

  const handleClear = useCallback((property: string) => {
    if (!s.selectedInstanceId) return
    const sel = s.styleSourceSelections.get(s.selectedInstanceId)
    if (!sel) return
    const ssId = sel.values[0]
    if (ssId) s.deleteStyleDeclaration(ssId, s.currentBreakpointId, property, styleState)
  }, [s, styleState])

  const currentStyles = new Map<string, StyleValue>()
  const responsiveProps = new Set<string>()
  if (s.selectedInstanceId) {
    const sel = s.styleSourceSelections.get(s.selectedInstanceId)
    if (sel) {
      for (const ssId of sel.values) {
        for (const decl of s.styleDeclarations.values()) {
          if (decl.styleSourceId === ssId && (decl.state ?? undefined) === styleState) {
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

  if (!s.selectedInstanceId) return <div className="p-4 text-xs text-gray-400 text-center">Select an element to style</div>

  return (
    <div className="overflow-y-auto">
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex gap-0.5">
          {([undefined, "hover", "focus", "active"] as const).map((st) => (
            <button key={st ?? "none"} onClick={() => setStyleState(st)}
              className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${styleState === st ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}>
              {st ?? "Base"}
            </button>
          ))}
        </div>
      </div>
      {commonProps.map(({ group, props }) => (
        <StyleGroup key={group} group={group} props={props} currentStyles={currentStyles} responsiveProps={responsiveProps} onChange={handleChange} onClear={handleClear} />
      ))}
      <div className="px-3 py-3 border-t">
        <div className="text-[10px] font-medium text-gray-500 mb-1.5">Custom CSS</div>
        <textarea value={customCSS} onChange={(e) => setCustomCSS(e.target.value)}
          placeholder="property: value; ..." rows={3}
          className="w-full px-2 py-1.5 text-[11px] font-mono border rounded resize-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-300 focus:outline-none" />
        <button onClick={applyCustomCSS} className="mt-1.5 px-2.5 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200 transition-colors font-medium">Apply</button>
      </div>
    </div>
  )
}
