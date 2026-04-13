import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Container",
  category: "layout",
  icon: "box-select",
  tag: "div",
  contentModel: {
    category: "container",
    children: ["container", "content", "form", "form-field", "slot"],
  },
  propsSchema: [
    { name: "maxWidth", label: "Max Width", type: "string", defaultValue: "1280px" },
  ],
  presetStyle: {
    div: [
      { property: "maxWidth", value: { type: "unit", value: 1280, unit: "px" } },
      { property: "marginLeft", value: { type: "keyword", value: "auto" } },
      { property: "marginRight", value: { type: "keyword", value: "auto" } },
      { property: "paddingLeft", value: { type: "unit", value: 24, unit: "px" } },
      { property: "paddingRight", value: { type: "unit", value: 24, unit: "px" } },
      { property: "width", value: { type: "unit", value: 100, unit: "%" } },
    ],
  },
}
