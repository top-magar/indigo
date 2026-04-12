import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Form",
  category: "forms",
  icon: "file-text",
  tag: "form",
  contentModel: { category: "form", children: ["form-field", "content", "container"] },
  propsSchema: [
    { name: "action", label: "Action URL", type: "string" },
    { name: "method", label: "Method", type: "string", defaultValue: "post", options: [
      { value: "get", label: "GET" }, { value: "post", label: "POST" },
    ]},
  ],
}
