"use client"
import { Paintbrush } from "lucide-react"
import { useEditorV3Store } from "../../stores/store"
import { useStore } from "../use-store"
import { generateId } from "../../id"
import type { StyleValue, CssUnit } from "../../types"

interface Preset {
  name: string
  description: string
  styles: Record<string, StyleValue>
}

const unit = (v: number, u: CssUnit): StyleValue => ({ type: "unit", value: v, unit: u })
const kw = (v: string): StyleValue => ({ type: "keyword", value: v })
const rgb = (r: number, g: number, b: number, a = 1): StyleValue => ({ type: "rgb", r, g, b, a })
const raw = (v: string): StyleValue => ({ type: "unparsed", value: v })

const PRESETS: Preset[] = [
  { name: "Card", description: "Rounded card with shadow", styles: {
    padding: raw("24px"), borderRadius: unit(12, "px"), backgroundColor: rgb(255, 255, 255),
    boxShadow: raw("0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"),
    border: raw("1px solid #e5e7eb"),
  }},
  { name: "Pill Button", description: "Rounded pill-shaped button", styles: {
    padding: raw("10px 24px"), borderRadius: unit(999, "px"), backgroundColor: rgb(0, 0, 0),
    color: rgb(255, 255, 255), fontSize: unit(14, "px"), fontWeight: kw("600"),
    border: kw("none"), cursor: kw("pointer"),
  }},
  { name: "Ghost Button", description: "Transparent with border", styles: {
    padding: raw("10px 24px"), borderRadius: unit(8, "px"), backgroundColor: kw("transparent"),
    border: raw("1px solid #d1d5db"), fontSize: unit(14, "px"), fontWeight: kw("500"), cursor: kw("pointer"),
  }},
  { name: "Badge", description: "Small colored badge", styles: {
    padding: raw("4px 12px"), borderRadius: unit(999, "px"), backgroundColor: rgb(239, 246, 255),
    color: rgb(59, 130, 246), fontSize: unit(12, "px"), fontWeight: kw("600"),
    display: kw("inline-flex"),
  }},
  { name: "Hero Text", description: "Large bold heading", styles: {
    fontSize: unit(56, "px"), fontWeight: kw("800"), lineHeight: unit(1.1, "em"),
    letterSpacing: unit(-1, "px"),
  }},
  { name: "Subheading", description: "Muted uppercase label", styles: {
    fontSize: unit(13, "px"), fontWeight: kw("600"), textTransform: kw("uppercase"),
    letterSpacing: unit(2, "px"), color: rgb(107, 114, 128),
  }},
  { name: "Body Text", description: "Readable paragraph text", styles: {
    fontSize: unit(16, "px"), lineHeight: unit(1.7, "em"), color: rgb(55, 65, 81),
  }},
  { name: "Glass", description: "Glassmorphism effect", styles: {
    backgroundColor: raw("rgba(255,255,255,0.1)"), backdropFilter: raw("blur(12px)"),
    borderRadius: unit(16, "px"), border: raw("1px solid rgba(255,255,255,0.2)"),
    padding: raw("24px"),
  }},
  { name: "Gradient BG", description: "Blue-purple gradient", styles: {
    backgroundImage: raw("linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"),
    padding: raw("48px"), borderRadius: unit(12, "px"),
  }},
  { name: "Centered Stack", description: "Flex column centered", styles: {
    display: kw("flex"), flexDirection: kw("column"), alignItems: kw("center"),
    justifyContent: kw("center"), gap: unit(16, "px"), textAlign: kw("center"),
  }},
  { name: "Grid 2-col", description: "Two column grid", styles: {
    display: kw("grid"), gridTemplateColumns: raw("repeat(2, 1fr)"), gap: unit(24, "px"),
  }},
  { name: "Grid 3-col", description: "Three column grid", styles: {
    display: kw("grid"), gridTemplateColumns: raw("repeat(3, 1fr)"), gap: unit(24, "px"),
  }},
]

function applyPreset(preset: Preset): void {
  const s = useEditorV3Store.getState()
  if (!s.selectedInstanceId) return
  const instanceId = s.selectedInstanceId
  const bpId = s.currentBreakpointId

  let sel = s.styleSourceSelections.get(instanceId)
  if (!sel || sel.values.length === 0) {
    const ssId = generateId()
    useEditorV3Store.setState((draft) => {
      draft.styleSources.set(ssId, { id: ssId, type: "local" })
      draft.styleSourceSelections.set(instanceId, { instanceId, values: [ssId] })
    })
    sel = { instanceId, values: [ssId] }
  }
  const ssId = sel.values[0]
  for (const [prop, value] of Object.entries(preset.styles)) {
    s.setStyleDeclaration(ssId, bpId, prop, value)
  }
}

export function StylePresetsPanel() {
  const s = useStore()
  const hasSelection = !!s.selectedInstanceId

  return (
    <div className="p-2 space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-1 font-medium">Style Presets</div>
      {!hasSelection && (
        <div className="text-[10px] text-muted-foreground text-center py-4">Select an element to apply presets</div>
      )}
      {hasSelection && PRESETS.map((preset) => (
        <button key={preset.name} onClick={() => applyPreset(preset)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent/50 transition-colors text-left group">
          <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
            <Paintbrush className="w-3 h-3 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium">{preset.name}</div>
            <div className="text-[9px] text-muted-foreground leading-tight">{preset.description}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
