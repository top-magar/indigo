import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Textarea",
  category: "forms",
  icon: "text",
  tag: "textarea",
  contentModel: { category: "form-field", children: [] },
  propsSchema: [
    { name: "placeholder", label: "Placeholder", type: "string" },
    { name: "name", label: "Name", type: "string" },
    { name: "rows", label: "Rows", type: "number", defaultValue: 4 },
  ],
}
