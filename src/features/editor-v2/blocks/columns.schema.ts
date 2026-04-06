import { defineBlock } from "../core/schema"
import { ColumnsRender } from "./columns"

const fields = {
  columns: { type: "number", label: "Columns", default: 2, group: "Layout", min: 1, max: 4, step: 1 },
  gap: { type: "spacing", label: "Gap", default: 24, group: "Layout", min: 0, max: 64 },
  proportions: { type: "enum", label: "Proportions", default: "equal" as const, group: "Layout", options: [{ value: "equal" as const, label: "Equal" }, { value: "40-60" as const, label: "40/60" }, { value: "60-40" as const, label: "60/40" }, { value: "30-70" as const, label: "30/70" }, { value: "70-30" as const, label: "70/30" }] },
  verticalAlign: { type: "enum", label: "Vertical Align", default: "stretch" as const, group: "Layout", options: [{ value: "stretch" as const, label: "Stretch" }, { value: "start" as const, label: "Top" }, { value: "center" as const, label: "Center" }, { value: "end" as const, label: "Bottom" }] },
  paddingTop: { type: "spacing", label: "Padding Top", default: 24, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 24, group: "Layout", min: 0, max: 120 },
  backgroundColor: { type: "color", label: "Background", default: "", group: "Style" },
} as const

export const ColumnsSchema = defineBlock({
  name: "Columns",
  category: "Layout",
  icon: "Columns3",
  description: "Multi-column layout container",
  fields,
  isContainer: true,
  presets: [
    { label: "2 Equal", props: { columns: 2, proportions: "equal" } },
    { label: "3 Equal", props: { columns: 3, proportions: "equal" } },
    { label: "Sidebar Left", props: { columns: 2, proportions: "30-70" } },
    { label: "Sidebar Right", props: { columns: 2, proportions: "70-30" } },
  ],
  render: ColumnsRender,
})
