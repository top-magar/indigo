import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Radio",
  category: "forms",
  icon: "circle-dot",
  tag: "input",
  contentModel: { category: "form-field", children: [] },
  propsSchema: [
    { name: "name", label: "Group Name", type: "string" },
    { name: "value", label: "Value", type: "string" },
  ],
}
