import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Button",
  category: "general",
  icon: "mouse-pointer-click",
  tag: "button",
  contentModel: { category: "content", children: ["content"] },
  propsSchema: [
    { name: "type", label: "Type", type: "string", defaultValue: "button", options: [
      { value: "button", label: "Button" }, { value: "submit", label: "Submit" }, { value: "reset", label: "Reset" },
    ]},
  ],
}
