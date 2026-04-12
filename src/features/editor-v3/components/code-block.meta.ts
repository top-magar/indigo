import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Code Block",
  category: "media",
  icon: "code",
  tag: "div",
  contentModel: { category: "content", children: [] },
  propsSchema: [
    { name: "html", label: "HTML", type: "string", defaultValue: "", multiline: true },
    { name: "css", label: "CSS", type: "string", defaultValue: "", multiline: true },
    { name: "js", label: "JavaScript", type: "string", defaultValue: "", multiline: true },
  ],
}
