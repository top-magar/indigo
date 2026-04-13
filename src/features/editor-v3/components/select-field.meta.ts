import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Select",
  category: "forms",
  icon: "chevron-down",
  tag: "select",
  contentModel: { category: "form-field", children: ["content"] },
  propsSchema: [
    { name: "name", label: "Name", type: "string" },
  ],
}
