import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Box",
  category: "layout",
  icon: "square",
  tag: "div",
  contentModel: {
    category: "container",
    children: ["container", "content", "form", "form-field", "slot"],
  },
  propsSchema: [
    { name: "tag", label: "Tag", type: "string", defaultValue: "div", options: [
      { value: "div", label: "div" }, { value: "header", label: "header" }, { value: "footer", label: "footer" },
      { value: "nav", label: "nav" }, { value: "main", label: "main" }, { value: "section", label: "section" },
      { value: "article", label: "article" }, { value: "aside", label: "aside" },
    ]},
  ],
  presetStyle: {
    div: [{ property: "boxSizing", value: { type: "keyword", value: "border-box" } }],
  },
}
