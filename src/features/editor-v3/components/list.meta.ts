import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "List",
  category: "general",
  icon: "list",
  tag: "ul",
  contentModel: { category: "container", children: ["content", "container"] },
  propsSchema: [
    { name: "ordered", label: "Ordered", type: "boolean", defaultValue: false },
  ],
}
