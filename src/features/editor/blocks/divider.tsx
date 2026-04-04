"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, SliderField, SelectField, ColorField, ToggleField } from "../components/editor-fields"

interface DividerProps {
  _v: number
  height: number
  showLine: boolean
  lineStyle: "solid" | "dashed" | "dotted"
  lineColor: string
  lineWidth: number
  maxWidth: number
}

export const DividerBlock = (props: DividerProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { height, showLine, lineStyle, lineColor, lineWidth, maxWidth } = props

  return (
    <div ref={craftRef(connect, drag)} style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {showLine && (
        <hr style={{ border: "none", borderTop: `${lineWidth}px ${lineStyle} ${lineColor}`, width: "100%", maxWidth: maxWidth || undefined, margin: 0 }} />
      )}
    </div>
  )
}

const DividerSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as DividerProps }))
  if (!props) return null
  const set = <K extends keyof DividerProps>(k: K, v: DividerProps[K]) => setProp((p: DividerProps) => { (p as unknown as Record<string, unknown>)[k] = v })

  return (
    <div className="flex flex-col gap-1 p-1">
      <Section title="Spacing">
        <SliderField label="Height" value={props.height} onChange={(v) => set("height", v)} min={8} max={200} />
      </Section>
      <Section title="Line">
        <ToggleField label="Show Line" checked={props.showLine} onChange={(v) => set("showLine", v)} />
        {props.showLine && (
          <>
            <SelectField label="Style" value={props.lineStyle} onChange={(v) => set("lineStyle", v as DividerProps["lineStyle"])} options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} />
            <ColorField label="Color" value={props.lineColor} onChange={(v) => set("lineColor", v)} />
            <SliderField label="Thickness" value={props.lineWidth} onChange={(v) => set("lineWidth", v)} min={1} max={6} />
            <SliderField label="Max Width" value={props.maxWidth} onChange={(v) => set("maxWidth", v)} min={0} max={1200} />
          </>
        )}
      </Section>
    </div>
  )
}

DividerBlock.craft = {
  displayName: "Divider / Spacer",
  props: { _v: 1, height: 48, showLine: true, lineStyle: "solid", lineColor: "#e5e7eb", lineWidth: 1, maxWidth: 0 } as DividerProps,
  rules: { canMoveIn: () => false },
  related: { settings: DividerSettings },
}
