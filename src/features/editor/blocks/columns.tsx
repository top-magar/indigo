"use client"
import { useNode, Element } from "@craftjs/core"
import type { ReactNode } from "react"
import { craftRef } from "../craft-ref"

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
  const set = <K extends keyof ColumnsProps>(k: K, v: ColumnsProps[K]) => setProp((p: ColumnsProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Grid</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Columns<select value={props.columns} onChange={(e) => set("columns", +e.target.value as any)} className={I}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
        <label className={F}>Gap ({props.gap}px)<input type="range" min={0} max={48} value={props.gap} onChange={(e) => set("gap", +e.target.value)} /></label>
        <label className={F}>Vertical Align<select value={props.verticalAlign} onChange={(e) => set("verticalAlign", e.target.value as any)} className={I}><option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option></select></label>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={props.reverseOnMobile} onChange={(e) => set("reverseOnMobile", e.target.checked)} />Reverse on mobile</label>
      </div></details>
    </div>
  )
}

Columns.craft = {
  displayName: "Columns",
  props: { _v: 1, columns: 2, gap: 16, verticalAlign: "top", reverseOnMobile: false, equalHeight: true },
  related: { settings: ColumnsSettings },
  rules: { canMoveIn: () => true },
}
