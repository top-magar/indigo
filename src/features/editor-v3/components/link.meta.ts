import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Link",
  category: "general",
  icon: "link",
  tag: "a",
  contentModel: { category: "content", children: ["content"] },
  propsSchema: [
    { name: "href", label: "URL", type: "string", defaultValue: "#" },
    { name: "target", label: "Target", type: "string", options: [
      { value: "_self", label: "Same tab" }, { value: "_blank", label: "New tab" },
    ]},
  ],
}
