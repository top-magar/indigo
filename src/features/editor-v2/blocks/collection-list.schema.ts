import { defineBlock } from "../core/schema"
import { CollectionListRender } from "./collection-list"

const fields = {
  heading: { type: "text", label: "Heading", default: "Shop by Collection", group: "Content", content: true },
  columns: { type: "number", label: "Columns", default: 3, group: "Layout", min: 2, max: 5, step: 1 },
  gap: { type: "spacing", label: "Gap", default: 24, group: "Layout", min: 8, max: 48 },
  backgroundColor: { type: "color", label: "Background", default: "", group: "Style" },
  paddingTop: { type: "spacing", label: "Padding Top", default: 48, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 48, group: "Layout", min: 0, max: 120 },
} as const

export const CollectionListSchema = defineBlock({
  name: "CollectionList",
  category: "Commerce",
  icon: "LayoutGrid",
  description: "Grid of collection cards",
  fields,
  render: CollectionListRender,
})
