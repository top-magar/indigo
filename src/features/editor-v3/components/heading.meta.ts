import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Heading",
  category: "typography",
  icon: "heading",
  tag: "h2",
  contentModel: { category: "content", children: [] },
  propsSchema: [
    { name: "level", label: "Level", type: "number", defaultValue: 2 },
  ],
}
