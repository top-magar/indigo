"use client"
import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { craftRef } from "../craft-ref"

interface ContainerProps { background: string; padding: number; maxWidth: "full" | "contained" | "narrow"; borderRadius: number; border: string; shadow: "none" | "sm" | "md" | "lg"; children?: ReactNode }

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const maxWidthMap = { full: "100%", contained: "1200px", narrow: "800px" }
const shadowMap: Record<string, string> = { none: "none", sm: "0 1px 3px rgba(0,0,0,0.08)", md: "0 4px 12px rgba(0,0,0,0.08)", lg: "0 10px 25px rgba(0,0,0,0.12)" }

export const Container = ({ background, padding, maxWidth, borderRadius, border, shadow, children }: ContainerProps) => {
  const { connectors: { connect, drag } } = useNode()
  return (
    <div ref={craftRef(connect, drag)} style={{ background, padding, maxWidth: maxWidthMap[maxWidth], margin: maxWidth !== "full" ? "0 auto" : undefined, minHeight: 60, borderRadius, border: border || undefined, boxShadow: shadowMap[shadow] }}>
      {children}
    </div>
  )
}

const ContainerSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ContainerProps }))
  const set = <K extends keyof ContainerProps>(k: K, v: ContainerProps[K]) => setProp((p: ContainerProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Max Width<select value={props.maxWidth} onChange={(e) => set("maxWidth", e.target.value as any)} className={I}><option value="full">Full</option><option value="contained">Contained (1200px)</option><option value="narrow">Narrow (800px)</option></select></label>
        <label className={F}>Padding ({props.padding}px)<input type="range" min={0} max={80} value={props.padding} onChange={(e) => set("padding", +e.target.value)} /></label>
      </div></details>
      <details><summary className={S}>Style</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Background<input type="color" value={props.background || "#ffffff"} onChange={(e) => set("background", e.target.value)} /></label>
        <label className={F}>Corner Radius ({props.borderRadius}px)<input type="range" min={0} max={32} value={props.borderRadius} onChange={(e) => set("borderRadius", +e.target.value)} /></label>
        <label className={F}>Border<input type="text" value={props.border} onChange={(e) => set("border", e.target.value)} placeholder="1px solid #e5e7eb" className={I} /></label>
        <label className={F}>Shadow<select value={props.shadow} onChange={(e) => set("shadow", e.target.value as any)} className={I}><option value="none">None</option><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option></select></label>
      </div></details>
    </div>
  )
}

Container.craft = {
  displayName: "Container",
  props: { _v: 1, background: "#ffffff", padding: 0, maxWidth: "full", borderRadius: 0, border: "", shadow: "none" },
  related: { settings: ContainerSettings },
  rules: { canMoveIn: () => true },
}
