import { defineBlock } from "../core/schema"
import { TextRender } from "./text"

const fields = {
  content: { type: "text", label: "Content", default: "Add your text here. Click to edit.", group: "Content", content: true, multiline: true },
  fontSize: { type: "number", label: "Font Size", default: 16, group: "Style", min: 10, max: 72, unit: "px" },
  lineHeight: { type: "number", label: "Line Height", default: 1.6, group: "Style", min: 1, max: 3, step: 0.1 },
  alignment: { type: "enum", label: "Align", default: "left" as const, group: "Layout", options: [{ value: "left" as const, label: "Left" }, { value: "center" as const, label: "Center" }, { value: "right" as const, label: "Right" }] },
  color: { type: "color", label: "Color", default: "", group: "Style" },
  maxWidth: { type: "number", label: "Max Width", default: 700, group: "Layout", min: 200, max: 1200, unit: "px" },
  paddingTop: { type: "spacing", label: "Padding Top", default: 32, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 32, group: "Layout", min: 0, max: 120 },
} as const

export const TextSchema = defineBlock({
  name: "Text",
  category: "Content",
  icon: "Type",
  description: "Rich text paragraph block",
  fields,
  render: TextRender,
})
