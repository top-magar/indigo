import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Input",
  category: "forms",
  icon: "text-cursor-input",
  tag: "input",
  contentModel: { category: "form-field", children: [] },
  propsSchema: [
    { name: "type", label: "Type", type: "string", defaultValue: "text", options: [
      { value: "text", label: "Text" }, { value: "email", label: "Email" },
      { value: "password", label: "Password" }, { value: "number", label: "Number" },
    ]},
    { name: "placeholder", label: "Placeholder", type: "string" },
    { name: "name", label: "Name", type: "string" },
  ],
}
