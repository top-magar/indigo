import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Checkbox",
  category: "forms",
  icon: "check-square",
  tag: "input",
  contentModel: { category: "form-field", children: [] },
  propsSchema: [
    { name: "name", label: "Name", type: "string" },
    { name: "value", label: "Value", type: "string" },
  ],
}
