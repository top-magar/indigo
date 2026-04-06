import { defineBlock } from "../core/schema"
import { ProductGridRender } from "./product-grid"

const fields = {
  heading: { type: "text", label: "Heading", default: "Featured Products", group: "Content", content: true },
  columns: { type: "number", label: "Columns", default: 4, group: "Layout", min: 2, max: 6, step: 1 },
  rows: { type: "number", label: "Rows", default: 1, group: "Layout", min: 1, max: 4, step: 1 },
  gap: { type: "spacing", label: "Gap", default: 24, group: "Layout", min: 8, max: 48 },
  showPrice: { type: "boolean", label: "Show Price", default: true, group: "Content" },
  backgroundColor: { type: "color", label: "Background", default: "", group: "Style" },
  paddingTop: { type: "spacing", label: "Padding Top", default: 48, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 48, group: "Layout", min: 0, max: 120 },
} as const

export const ProductGridSchema = defineBlock({
  name: "ProductGrid",
  category: "Commerce",
  icon: "Grid3x3",
  description: "Grid of product cards",
  fields,
  presets: [
    { label: "4 Column", props: { columns: 4, rows: 1 } },
    { label: "3 Column", props: { columns: 3, rows: 2 } },
  ],
  render: ProductGridRender,
})
