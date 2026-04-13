import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Section",
  category: "layout",
  icon: "rows-3",
  tag: "section",
  contentModel: {
    category: "container",
    children: ["container", "content", "form", "form-field", "slot"],
  },
  propsSchema: [
    { name: "padding", label: "Padding", type: "string", defaultValue: "medium", options: [
      { value: "none", label: "None" }, { value: "small", label: "Small (40px)" },
      { value: "medium", label: "Medium (80px)" }, { value: "large", label: "Large (120px)" },
    ]},
  ],
}
