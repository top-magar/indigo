"use client"

import { useNode, Element } from "@craftjs/core"
import type { ReactNode } from "react"
import { craftRef } from "../craft-ref"
import { Container } from "./container"

interface ColumnsProps {
  columns: 2 | 3 | 4
  gap: number
  children?: ReactNode
}

export const Columns = ({ columns, gap, children }: ColumnsProps) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        minHeight: 60,
      }}
    >
      {children}
    </div>
  )
}

const ColumnsSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ColumnsProps }))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Columns
        <select
          value={props.columns}
          onChange={(e) => setProp((p: ColumnsProps) => (p.columns = +e.target.value as any))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Gap ({props.gap}px)
        <input
          type="range"
          min={0}
          max={48}
          value={props.gap}
          onChange={(e) => setProp((p: ColumnsProps) => (p.gap = +e.target.value))}
        />
      </label>
    </div>
  )
}

Columns.craft = {
  displayName: "Columns",
  props: { _v: 1,
    columns: 2,
    gap: 16,
  },
  related: { settings: ColumnsSettings },
  rules: { canMoveIn: () => true },
}
