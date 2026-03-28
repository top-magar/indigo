"use client"

import { useNode, Element } from "@craftjs/core"
import type { ReactNode } from "react"
import { craftRef } from "../craft-ref"

interface ContainerProps {
  background: string
  padding: number
  maxWidth: "full" | "contained" | "narrow"
  children?: ReactNode
}

const maxWidthMap = {
  full: "100%",
  contained: "1200px",
  narrow: "800px",
}

export const Container = ({ background, padding, maxWidth, children }: ContainerProps) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        background,
        padding,
        maxWidth: maxWidthMap[maxWidth],
        margin: maxWidth !== "full" ? "0 auto" : undefined,
        minHeight: 60,
      }}
    >
      {children}
    </div>
  )
}

const ContainerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ContainerProps }))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background
        <input
          type="color"
          value={props.background || "#ffffff"}
          onChange={(e) => setProp((p: ContainerProps) => (p.background = e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Padding ({props.padding}px)
        <input
          type="range"
          min={0}
          max={80}
          value={props.padding}
          onChange={(e) => setProp((p: ContainerProps) => (p.padding = +e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Max Width
        <select
          value={props.maxWidth}
          onChange={(e) => setProp((p: ContainerProps) => (p.maxWidth = e.target.value as any))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="full">Full Width</option>
          <option value="contained">Contained (1200px)</option>
          <option value="narrow">Narrow (800px)</option>
        </select>
      </label>
    </div>
  )
}

Container.craft = {
  displayName: "Container",
  props: { _v: 1,
    background: "#ffffff",
    padding: 20,
    maxWidth: "full",
  },
  related: { settings: ContainerSettings },
  rules: {
    canMoveIn: () => true,
  },
}
