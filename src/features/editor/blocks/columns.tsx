"use client"
import { useNodeOptional as useNode } from "../use-node-safe"
import { Element } from "@craftjs/core"
import type { ReactNode } from "react"
import { craftRef } from "../craft-ref"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, ToggleField, ImageField, NumberField, Row } from "../components/editor-fields"

interface ColumnsProps { columns: 2 | 3 | 4; gap: number; verticalAlign: "top" | "center" | "bottom"; reverseOnMobile: boolean; equalHeight: boolean; children?: ReactNode }

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const vAlignMap = { top: "flex-start", center: "center", bottom: "flex-end" }

export const Columns = ({ columns, gap, verticalAlign, children }: ColumnsProps) => {
  const { connectors: { connect, drag } } = useNode()
  return (
    <div ref={craftRef(connect, drag)} style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap, alignItems: vAlignMap[verticalAlign], minHeight: 60 }}>
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
                <SliderField label="Gap" value={props.gap} onChange={(v) => set("gap", v)} min={0} max={48} />
                <SelectField label="Vertical Align" value={props.verticalAlign} onChange={(v) => set("verticalAlign", v as any)} options={[{ value: "top", label: "Top" }, { value: "center", label: "Center" }, { value: "bottom", label: "Bottom" }]} />
                <ToggleField label="Reverse on mobile" checked={props.reverseOnMobile} onChange={(v) => set("reverseOnMobile", v)} />
      </Section>
    </div>
  )
}

Columns.craft = {
  displayName: "Columns",
  props: { _v: 1, columns: 2, gap: 16, verticalAlign: "top", reverseOnMobile: false, equalHeight: true },
  related: { settings: ColumnsSettings },
  rules: { canMoveIn: () => true },
}
