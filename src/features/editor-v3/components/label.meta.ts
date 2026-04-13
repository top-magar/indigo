import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Label",
  category: "forms",
  icon: "tag",
  tag: "label",
  contentModel: { category: "content", children: ["content"] },
  propsSchema: [
    { name: "htmlFor", label: "For (input ID)", type: "string" },
  ],
}
