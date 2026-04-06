"use client"

import { AlignCenterVertical, AlignEndVertical, AlignStartVertical } from "lucide-react"
import { useNodeOptional as useNode } from "../use-node-safe"
import { useResponsiveStyles } from "../use-responsive"
import type { ReactNode } from "react"
import { craftRef } from "../craft-ref"
import { Section, SliderField, SegmentedControl, ToggleField } from "../components/editor-fields"

interface ColumnsProps { columns: 2 | 3 | 4; gap: number; verticalAlign: "top" | "center" | "bottom"; reverseOnMobile: boolean; equalHeight: boolean; proportions: string; children?: ReactNode }

const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const vAlignMap = { top: "flex-start", center: "center", bottom: "flex-end" }

const PROPORTION_MAP: Record<string, string> = {
  equal: "",
  "40-60": "2fr 3fr",
  "60-40": "3fr 2fr",
  "30-70": "3fr 7fr",
  "70-30": "7fr 3fr",
  "25-75": "1fr 3fr",
  "75-25": "3fr 1fr",
}

export const Columns = ({ columns, gap, verticalAlign, proportions, children }: ColumnsProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { columns: rCols } = useResponsiveStyles()
  const cols = rCols(columns)
  const grid = (proportions && proportions !== "equal" && cols === 2 && PROPORTION_MAP[proportions])
    ? PROPORTION_MAP[proportions]
    : `repeat(${cols}, 1fr)`
  return (
    <div ref={craftRef(connect, drag)} style={{ display: "grid", gridTemplateColumns: grid, gap, alignItems: vAlignMap[verticalAlign], minHeight: 60 }}>
      {children}
    </div>
  )
}

const ColumnsSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ColumnsProps }))
  if (!props) return null
  const set = <K extends keyof ColumnsProps>(k: K, v: ColumnsProps[K]) => setProp((p: ColumnsProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Grid">
        <label className={F}>Columns<select value={props.columns} onChange={(e) => set("columns", +e.target.value as any)} className={I}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
                {props.columns === 2 && (
                  <SegmentedControl label="Proportions" value={props.proportions || "equal"} onChange={(v) => set("proportions", v)} options={[{ value: "equal", label: "50/50" }, { value: "40-60", label: "40/60" }, { value: "60-40", label: "60/40" }, { value: "30-70", label: "30/70" }, { value: "70-30", label: "70/30" }]} />
                )}
                <SliderField label="Gap" value={props.gap} onChange={(v) => set("gap", v)} min={0} max={48}  step={4} />
                <SegmentedControl label="Vertical Align" value={props.verticalAlign} onChange={(v) => set("verticalAlign", v as any)} options={[{ value: "top", label: "Top", icon: AlignStartVertical, iconOnly: true }, { value: "center", label: "Center", icon: AlignCenterVertical, iconOnly: true }, { value: "bottom", label: "Bottom", icon: AlignEndVertical, iconOnly: true }]} />
                <ToggleField label="Reverse on mobile" checked={props.reverseOnMobile} onChange={(v) => set("reverseOnMobile", v)} />
      </Section>
    </div>
  )
}

Columns.craft = {
  displayName: "Columns",
  props: { _v: 1, columns: 2, gap: 16, verticalAlign: "top", reverseOnMobile: false, equalHeight: true, proportions: "equal" },
  related: { settings: ColumnsSettings },
  rules: { canMoveIn: () => true },
}
