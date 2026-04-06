"use client"

import { useEditor } from "@craftjs/core"
import { LayoutGrid } from "lucide-react"
import { Section } from "./editor-fields"

/** Preset layout overrides per block type. Only layout props — content is preserved. */
const PRESETS: Record<string, Array<{ label: string; props: Record<string, unknown> }>> = {
  "Hero": [
    { label: "Full Width", props: { variant: "full" } },
    { label: "Split", props: { variant: "split" } },
    { label: "Minimal", props: { variant: "minimal" } },
    { label: "Dark Full", props: { variant: "full", backgroundColor: "#0f172a", textColor: "#f1f5f9" } },
  ],
  "Product Grid": [
    { label: "2 Column", props: { columns: 2, rows: 2 } },
    { label: "3 Column", props: { columns: 3, rows: 1 } },
    { label: "4 Column", props: { columns: 4, rows: 1 } },
    { label: "Wide 2×3", props: { columns: 2, rows: 3 } },
  ],
  "Testimonials": [
    { label: "Cards Grid", props: { variant: "cards", columns: 3 } },
    { label: "Two Column", props: { variant: "cards", columns: 2 } },
    { label: "Single Column", props: { variant: "minimal", columns: 1 } },
    { label: "Large Quote", props: { variant: "large-quote", columns: 1 } },
  ],
  "Image with Text": [
    { label: "Image Left", props: { imagePosition: "left" } },
    { label: "Image Right", props: { imagePosition: "right" } },
  ],
  "Countdown Timer": [
    { label: "Card", props: { variant: "card" } },
    { label: "Bar", props: { variant: "bar" } },
    { label: "Inline", props: { variant: "inline" } },
  ],
  "Stock Counter": [
    { label: "Badge", props: { variant: "badge" } },
    { label: "Progress Bar", props: { variant: "bar" } },
    { label: "Text Only", props: { variant: "text" } },
  ],
  "Popup": [
    { label: "Centered", props: { variant: "centered" } },
    { label: "Sidebar", props: { variant: "sidebar" } },
    { label: "Fullscreen", props: { variant: "fullscreen" } },
  ],
  "Promo Banner": [
    { label: "Bar", props: { variant: "bar", size: "md" } },
    { label: "Centered", props: { variant: "centered", size: "lg" } },
    { label: "Compact", props: { variant: "bar", size: "sm" } },
  ],
}

export function LayoutSuggestions() {
  const { selectedId, blockName, actions } = useEditor((state) => {
    const [id] = state.events.selected
    if (!id) return { selectedId: null, blockName: null }
    return { selectedId: id, blockName: state.nodes[id]?.data.displayName ?? state.nodes[id]?.data.name ?? null }
  })

  if (!selectedId || !blockName) return null
  const presets = PRESETS[blockName]
  if (!presets || presets.length === 0) return null

  const apply = (preset: Record<string, unknown>) => {
    actions.setProp(selectedId, (p: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(preset)) p[k] = v
    })
  }

  return (
    <Section title="Layout Presets" defaultOpen={false}>
      <div className="grid grid-cols-2 gap-1.5">
        {presets.map((p) => (
          <button key={p.label} onClick={() => apply(p.props)}
            className="h-8 text-[11px] font-medium rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
            {p.label}
          </button>
        ))}
      </div>
    </Section>
  )
}
