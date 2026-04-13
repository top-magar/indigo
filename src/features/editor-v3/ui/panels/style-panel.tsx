"use client"
import { useState, useCallback } from "react"
import { ChevronDown, Paintbrush } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { EditorColorPicker } from "../components/color-picker"
import { BoxModelEditor } from "../components/box-model-editor"
import { GradientPopover } from "../components/gradient-editor"
import { FontPicker } from "../components/font-picker"
import { NumericScrubInput } from "../components/numeric-scrub-input"
import type { StyleValue, CssUnit } from "../../types"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"

const commonProps = [
  { group: "Layout", props: ["display", "flexDirection", "flexWrap", "alignItems", "justifyContent", "gap", "gridTemplateColumns", "gridTemplateRows"] },
  { group: "Spacing", props: ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft"] },
  { group: "Size", props: ["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight", "aspectRatio", "overflow", "objectFit"] },
  { group: "Position", props: ["position", "top", "right", "bottom", "left", "zIndex"] },
  { group: "Typography", props: ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "textAlign", "textDecoration", "textTransform", "whiteSpace", "wordBreak"] },
  { group: "Background", props: ["backgroundColor", "backgroundImage", "backgroundSize", "backgroundPosition", "backgroundRepeat"] },
  { group: "Border", props: ["borderRadius", "borderWidth", "borderColor", "borderStyle", "borderTop", "borderBottom", "outline", "boxShadow"] },
  { group: "Effects", props: ["opacity", "transform", "transformOrigin", "filter", "backdropFilter", "transition", "transitionDuration", "transitionTimingFunction", "cursor", "pointerEvents", "userSelect", "mixBlendMode"] },
]

const FONT_OPTIONS = [
  "", "Arial, sans-serif", "Helvetica, sans-serif", "Georgia, serif", "Times New Roman, serif",
  "Courier New, monospace", "Verdana, sans-serif", "system-ui, sans-serif",
  "Inter, sans-serif", "Roboto, sans-serif", "Open Sans, sans-serif", "Lato, sans-serif",
  "Montserrat, sans-serif", "Poppins, sans-serif", "Playfair Display, serif",
  "DM Sans, sans-serif", "Space Grotesk, sans-serif", "Outfit, sans-serif", "Sora, sans-serif",
]

const KEYWORD_OPTIONS: Record<string, string[]> = {
  display: ["block", "flex", "grid", "inline", "inline-block", "inline-flex", "inline-grid", "none"],
  flexDirection: ["row", "column", "row-reverse", "column-reverse"],
  flexWrap: ["nowrap", "wrap", "wrap-reverse"],
  alignItems: ["stretch", "flex-start", "flex-end", "center", "baseline"],
  justifyContent: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
  textAlign: ["left", "center", "right", "justify"],
  textDecoration: ["none", "underline", "line-through", "overline"],
  textTransform: ["none", "uppercase", "lowercase", "capitalize"],
  whiteSpace: ["normal", "nowrap", "pre", "pre-wrap"],
  wordBreak: ["normal", "break-all", "break-word"],
  overflow: ["visible", "hidden", "scroll", "auto"],
  objectFit: ["fill", "contain", "cover", "none", "scale-down"],
  cursor: ["auto", "default", "pointer", "text", "move", "not-allowed", "grab"],
  borderStyle: ["none", "solid", "dashed", "dotted", "double"],
  fontWeight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  pointerEvents: ["auto", "none"],
  transformOrigin: ["center", "top", "top right", "right", "bottom right", "bottom", "bottom left", "left", "top left"],
  userSelect: ["auto", "none", "text", "all"],
  backgroundSize: ["auto", "cover", "contain"],
  backgroundPosition: ["center", "top", "bottom", "left", "right"],
  backgroundRepeat: ["repeat", "no-repeat", "repeat-x", "repeat-y"],
  mixBlendMode: ["normal", "multiply", "screen", "overlay", "darken", "lighten"],
}

const COLOR_PROPS = new Set(["color", "backgroundColor", "borderColor"])

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

function StyleRow({ property, value, isInherited, hasResponsive, onChange, onClear }: {
  property: string; value: StyleValue | undefined; isInherited?: boolean; hasResponsive?: boolean
  onChange: (v: StyleValue) => void; onClear?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const display = value ? formatValue(value) : ""
  const isColor = COLOR_PROPS.has(property)
  const isGradient = property === "backgroundImage"
  const isFont = property === "fontFamily"
  const keywords = KEYWORD_OPTIONS[property]

  return (
    <div className="group flex items-center gap-1.5 py-0.5" onContextMenu={(e) => { if (value && onClear) { e.preventDefault(); onClear() } }}>
      <span className="text-[10px] text-muted-foreground w-[104px] shrink-0 truncate">
        {value && !isInherited && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1" title="Set on this breakpoint" />}
        {isInherited && <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 mr-1" title="Inherited from larger breakpoint" />}
        {!value && hasResponsive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mr-1" title="Set on other breakpoint" />}
        {property}
      </span>
      {isColor && (
        <EditorColorPicker value={display || "#000000"} onCommit={(hex) => onChange(parseValue(hex))} />
      )}
      {isGradient && (
        <GradientPopover value={display} onChange={onChange} />
      )}
      {isFont ? (
        <div className="flex-1 min-w-0">
          <FontPicker value={display} onChange={(font) => onChange({ type: "keyword", value: font })} />
        </div>
      ) : keywords ? (
        <Select value={display || undefined} onValueChange={(v) => { if (v === "__clear__") { onClear?.() } else { onChange(parseValue(v)) } }}>
          <SelectTrigger className="h-6 text-[11px] flex-1 min-w-0">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__clear__">—</SelectItem>
            {keywords.map((k) => (
              <SelectItem key={k} value={k} className="text-[11px]">{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : value?.type === "unit" ? (
        <div className="flex-1 min-w-0">
          <NumericScrubInput value={value.value} unit={value.unit} onChange={(v, u) => onChange({ type: "unit", value: v, unit: u })} />
        </div>
      ) : editing ? (
        <input autoFocus className="flex-1 px-1.5 py-0.5 text-[11px] border rounded focus:ring-1 focus:ring-ring focus:outline-none bg-background" defaultValue={display}
          onBlur={(e) => { if (e.target.value) onChange(parseValue(e.target.value)); setEditing(false) }}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setEditing(false) }} />
      ) : (
        <button onClick={() => setEditing(true)} className="flex-1 text-left text-[11px] px-1.5 py-0.5 rounded hover:bg-accent min-h-[22px]">
          {display || <span className="text-muted-foreground/50">—</span>}
        </button>
      )}
      {value && onClear && (
        <button onClick={onClear} className="opacity-0 group-hover:opacity-100 shrink-0 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-destructive transition-opacity" title="Clear">
          <span className="text-[10px]">×</span>
        </button>
      )}
    </div>
  )
}

function StyleGroup({ group, props, currentStyles, inheritedProps, responsiveProps, onChange, onClear }: {
  group: string; props: string[]; currentStyles: Map<string, StyleValue>; inheritedProps: Set<string>; responsiveProps: Set<string>
  onChange: (prop: string, v: StyleValue) => void; onClear: (prop: string) => void
}) {
  const hasValues = props.some((p) => currentStyles.has(p) || inheritedProps.has(p))
  return (
    <Collapsible defaultOpen className="border-b">
      <CollapsibleTrigger className="w-full flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-muted-foreground hover:bg-accent/50 transition-colors">
        <ChevronDown className="size-3 transition-transform group-data-[state=closed]:-rotate-90" />
        {group}
        {hasValues && <span className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-2">
          {props.map((prop) => (
            <StyleRow key={prop} property={prop} value={currentStyles.get(prop)} isInherited={inheritedProps.has(prop) && !currentStyles.has(prop)}
              hasResponsive={responsiveProps.has(prop)} onChange={(v) => onChange(prop, v)} onClear={() => onClear(prop)} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function StyleSourceSelector({ instanceId }: { instanceId: string }) {
  const s = useEditorV3Store.getState()
  const sel = s.styleSourceSelections.get(instanceId)
  const sources = sel?.values.map((ssId) => {
    const ss = s.styleSources.get(ssId)
    return ss ? { id: ssId, type: ss.type, hasStyles: false } : null
  }).filter(Boolean) as Array<{ id: string; type: string; hasStyles: boolean }> ?? []

  // Check which sources have styles
  for (const src of sources) {
    for (const decl of s.styleDeclarations.values()) {
      if (decl.styleSourceId === src.id) { src.hasStyles = true; break }
    }
  }

  const [showAdd, setShowAdd] = useState(false)
  const tokens = [...s.styleSources.values()].filter((ss) => ss.type === "token")

  const addToken = (tokenId: string) => {
    useEditorV3Store.setState((draft) => {
      const existing = draft.styleSourceSelections.get(instanceId)
      if (existing) {
        if (!existing.values.includes(tokenId)) existing.values.push(tokenId)
      } else {
        draft.styleSourceSelections.set(instanceId, { instanceId, values: [tokenId] })
      }
    })
    setShowAdd(false)
  }

  const removeSource = (ssId: string) => {
    useEditorV3Store.setState((draft) => {
      const existing = draft.styleSourceSelections.get(instanceId)
      if (existing) existing.values = existing.values.filter((v) => v !== ssId)
    })
  }

  return (
    <div className="px-3 py-1.5 border-b">
      <div className="flex items-center gap-1 flex-wrap">
        {sources.map((src) => (
          <span key={src.id} className={`inline-flex items-center gap-1 h-5 px-2 rounded text-[9px] font-medium ${
            src.type === "local"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-purple-50 text-purple-700 border border-purple-200"
          } ${src.hasStyles ? "" : "opacity-50"}`}>
            {src.type === "local" ? "Local" : s.styleSources.get(src.id)?.name ?? src.id.slice(0, 6)}
            {src.type === "token" && (
              <button onClick={() => removeSource(src.id)} className="hover:text-red-500 ml-0.5">×</button>
            )}
          </span>
        ))}
        {showAdd ? (
          <select autoFocus className="h-5 text-[9px] border rounded px-1 bg-background"
            onChange={(e) => { if (e.target.value) addToken(e.target.value) }}
            onBlur={() => setShowAdd(false)}>
            <option value="">Select token...</option>
            {tokens.map((t) => <option key={t.id} value={t.id}>{t.name ?? t.id.slice(0, 8)}</option>)}
          </select>
        ) : (
          <button onClick={() => setShowAdd(true)}
            className="h-5 px-1.5 rounded border border-dashed border-muted-foreground/30 text-[9px] text-muted-foreground hover:border-muted-foreground/60 transition-colors">
            +
          </button>
        )}
      </div>
    </div>
  )
}

export function StylePanel() {
  const s = useStore()
  const [styleState, setStyleState] = useState<string | undefined>(undefined)

  const handleChange = useCallback((property: string, value: StyleValue) => {
    if (!s.selectedInstanceId) return
    const st = useEditorV3Store.getState()
    let ssId: string | undefined
    const sel = st.styleSourceSelections.get(s.selectedInstanceId)
    if (sel) ssId = sel.values[0]
    if (!ssId) ssId = st.createLocalStyleSource(s.selectedInstanceId)
    st.setStyleDeclaration(ssId, s.currentBreakpointId, property, value, styleState)
  }, [s.selectedInstanceId, s.currentBreakpointId, styleState])

  const handleClear = useCallback((property: string) => {
    if (!s.selectedInstanceId) return
    const st = useEditorV3Store.getState()
    const sel = st.styleSourceSelections.get(s.selectedInstanceId)
    if (!sel) return
    const ssId = sel.values[0]
    if (ssId) st.deleteStyleDeclaration(ssId, s.currentBreakpointId, property, styleState)
  }, [s.selectedInstanceId, s.currentBreakpointId, styleState])

  const currentStyles = new Map<string, StyleValue>()
  const responsiveProps = new Set<string>()
  const inheritedProps = new Set<string>()
  if (s.selectedInstanceId) {
    const sel = s.styleSourceSelections.get(s.selectedInstanceId)
    if (sel) {
      for (const ssId of sel.values) {
        for (const decl of s.styleDeclarations.values()) {
          if (decl.styleSourceId === ssId && (decl.state ?? undefined) === styleState) {
            if (decl.breakpointId === s.currentBreakpointId) currentStyles.set(decl.property, decl.value)
            else {
              responsiveProps.add(decl.property)
              // Check if inherited from a larger breakpoint (cascade down)
              const bp = s.breakpoints.get(decl.breakpointId)
              const currentBp = s.breakpoints.get(s.currentBreakpointId)
              const bpWidth = bp?.minWidth ?? 992
              const currentWidth = currentBp?.minWidth ?? 992
              if (bpWidth >= currentWidth && !currentStyles.has(decl.property)) {
                inheritedProps.add(decl.property)
              }
            }
          }
        }
      }
    }
  }

  const [customCSS, setCustomCSS] = useState("")
  const applyCustomCSS = useCallback(() => {
    if (!s.selectedInstanceId) return
    for (const line of customCSS.split(";").map((l) => l.trim()).filter(Boolean)) {
      const [prop, ...rest] = line.split(":")
      if (!prop || rest.length === 0) continue
      const property = prop.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      const value = rest.join(":").trim()
      if (property && value) handleChange(property, parseValue(value))
    }
    setCustomCSS("")
  }, [s.selectedInstanceId, customCSS, handleChange])

  if (!s.selectedInstanceId) return (
    <div className="flex flex-col items-center gap-2 py-12 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Paintbrush className="size-4 text-muted-foreground" />
      </div>
      <div className="text-[11px] text-muted-foreground">Select an element to style</div>
    </div>
  )

  return (
    <div className="overflow-y-auto">
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
        <Select value={styleState ?? "base"} onValueChange={(v) => setStyleState(v === "base" ? undefined : v)}>
          <SelectTrigger className="h-6 w-[72px] text-[10px] border-0 bg-muted/50 shadow-none px-2 gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="base" className="text-[10px]">Base</SelectItem>
            <SelectItem value="hover" className="text-[10px]">:hover</SelectItem>
            <SelectItem value="focus" className="text-[10px]">:focus</SelectItem>
            <SelectItem value="active" className="text-[10px]">:active</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1">
          {currentStyles.size > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-[9px] px-2 text-muted-foreground" onClick={() => {
              for (const prop of currentStyles.keys()) handleClear(prop)
            }}>Clear all</Button>
          )}
          <Button variant={currentStyles.get("display")?.type === "keyword" && (currentStyles.get("display") as { type: "keyword"; value: string }).value === "none" ? "destructive" : "outline"}
            size="sm" className="h-6 text-[9px] px-2" onClick={() => {
              const d = currentStyles.get("display")
              const isHidden = d?.type === "keyword" && d.value === "none"
              if (isHidden) handleClear("display")
              else handleChange("display", { type: "keyword", value: "none" })
            }}>
            {(() => { const d = currentStyles.get("display"); return d?.type === "keyword" && d.value === "none" ? "Hidden" : "Visible" })()}
          </Button>
        </div>
      </div>
      {/* Style source selector — shows local + token sources */}
      <StyleSourceSelector instanceId={s.selectedInstanceId!} />
      <BoxModelEditor styles={currentStyles} onChange={handleChange} />
      {/* Quick layout toggle */}
      <div className="px-3 py-2 border-b flex items-center gap-1">
        <span className="text-[9px] text-muted-foreground w-12 shrink-0">Layout</span>
        {(["block", "flex", "grid", "none"] as const).map((d) => (
          <button key={d} onClick={() => handleChange("display", { type: "keyword", value: d })}
            className={`h-6 px-2 text-[10px] rounded border transition-colors ${
              currentStyles.get("display")?.type === "keyword" && (currentStyles.get("display") as { type: "keyword"; value: string }).value === d
                ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"
            }`}>{d}</button>
        ))}
        {currentStyles.get("display")?.type === "keyword" && (currentStyles.get("display") as { type: "keyword"; value: string }).value === "flex" && (
          <>
            <div className="w-px h-4 bg-border mx-0.5" />
            {(["row", "column"] as const).map((dir) => (
              <button key={dir} onClick={() => handleChange("flexDirection", { type: "keyword", value: dir })}
                className={`h-6 px-2 text-[10px] rounded border transition-colors ${
                  currentStyles.get("flexDirection")?.type === "keyword" && (currentStyles.get("flexDirection") as { type: "keyword"; value: string }).value === dir
                    ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"
                }`}>{dir === "row" ? "→" : "↓"}</button>
            ))}
          </>
        )}
      </div>
      {commonProps.map(({ group, props }) => (
        <StyleGroup key={group} group={group} props={props} currentStyles={currentStyles} inheritedProps={inheritedProps} responsiveProps={responsiveProps} onChange={handleChange} onClear={handleClear} />
      ))}
      <div className="px-3 py-3 border-t">
        <div className="text-[10px] font-medium text-muted-foreground mb-1.5">Custom CSS</div>
        <textarea value={customCSS} onChange={(e) => setCustomCSS(e.target.value)}
          placeholder="property: value; ..." rows={3}
          className="w-full px-2 py-1.5 text-[11px] font-mono border rounded resize-none bg-muted/30 focus:bg-background focus:ring-1 focus:ring-ring focus:outline-none" />
        <Button variant="secondary" size="sm" className="mt-1.5 h-6 text-[10px]" onClick={applyCustomCSS}>Apply</Button>
      </div>
    </div>
  )
}
