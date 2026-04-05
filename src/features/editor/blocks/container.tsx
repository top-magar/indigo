"use client"
import { useNodeOptional as useNode } from "../use-node-safe"
import type { ReactNode } from "react"
import { craftRef } from "../craft-ref"
import { Section, TextField, SliderField, SegmentedControl } from "../components/editor-fields"

interface ContainerProps { background: string; padding: number; maxWidth: "full" | "contained" | "narrow"; borderRadius: number; border: string; shadow: "none" | "sm" | "md" | "lg"; children?: ReactNode }

const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
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
  if (!props) return null
  const set = <K extends keyof ContainerProps>(k: K, v: ContainerProps[K]) => setProp((p: ContainerProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Layout">
                <SegmentedControl label="Max Width" value={props.maxWidth} onChange={(v) => set("maxWidth", v as any)} options={[{ value: "full", label: "Full" }, { value: "contained", label: "Contained (1200px)" }, { value: "narrow", label: "Narrow (800px)" }]} />
                <SliderField label="Padding" value={props.padding} onChange={(v) => set("padding", v)} min={0} max={80} />
      </Section>
      <Section title="Style">
        <label className={F}>Background<input type="color" value={props.background || "#ffffff"} onChange={(e) => set("background", e.target.value)} /></label>
                <SliderField label="Corner Radius" value={props.borderRadius} onChange={(v) => set("borderRadius", v)} min={0} max={32} />
                <TextField label="Border" value={props.border} onChange={(v) => set("border", v)} placeholder="1px solid #e5e7eb" />
                <SegmentedControl label="Shadow" value={props.shadow} onChange={(v) => set("shadow", v as any)} options={[{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]} />
      </Section>
    </div>
  )
}

Container.craft = {
  displayName: "Container",
  props: { _v: 1, background: "#ffffff", padding: 0, maxWidth: "full", borderRadius: 0, border: "", shadow: "none" },
  related: { settings: ContainerSettings },
  rules: { canMoveIn: () => true },
}
