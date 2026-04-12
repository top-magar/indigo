import dynamic from "next/dynamic"
import { registerBlock } from "../registry"
import { LayoutGrid, Minus, Layers } from "lucide-react"

registerBlock("columns", {
  component: dynamic(() => import("./columns").then(m => ({ default: m.Columns }))),
  fields: [
    { name: "columns", label: "Columns", type: "number" },
    { name: "gap", label: "Gap", type: "number" },
  ],
  defaultProps: { columns: 2, gap: 16 },
  icon: LayoutGrid,
  category: "layout",
})

registerBlock("spacer", {
  component: dynamic(() => import("./spacer").then(m => ({ default: m.Spacer }))),
  category: "layout",
  icon: Minus,
  fields: [
    { name: "height", label: "Height (px)", type: "number" },
    { name: "mobileHeight", label: "Mobile Height (px)", type: "number" },
  ],
  defaultProps: { height: 64, mobileHeight: 32 },
})

registerBlock("container", {
  component: dynamic(() => import("./container").then(m => ({ default: m.Container }))),
  fields: [
    { name: "layout", label: "Layout", type: "select", options: [{ value: "flex-row", label: "Row" }, { value: "flex-col", label: "Column" }, { value: "grid", label: "Grid" }] },
    { name: "gap", label: "Gap", type: "number" },
    { name: "alignItems", label: "Align Items", type: "select", options: [{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }, { value: "stretch", label: "Stretch" }] },
    { name: "justifyContent", label: "Justify Content", type: "select", options: [{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }, { value: "between", label: "Space Between" }, { value: "around", label: "Space Around" }] },
    { name: "wrap", label: "Wrap", type: "toggle" },
  ],
  defaultProps: { layout: "flex-col", gap: 16, alignItems: "stretch", justifyContent: "start", wrap: false },
  icon: LayoutGrid,
  category: "layout",
})

registerBlock("stack", {
  component: dynamic(() => import("./stack").then(m => ({ default: m.Stack }))),
  fields: [
    { name: "direction", label: "Direction", type: "select", options: [{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }] },
    { name: "gap", label: "Gap", type: "number" },
    { name: "align", label: "Align", type: "select", options: [{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }] },
  ],
  defaultProps: { direction: "vertical", gap: 12, align: "start" },
  icon: Layers,
  category: "layout",
})
