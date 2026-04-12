import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Image",
  category: "media",
  icon: "image",
  tag: "img",
  contentModel: { category: "content", children: [] },
  propsSchema: [
    { name: "src", label: "Source", type: "asset" },
    { name: "alt", label: "Alt Text", type: "string", defaultValue: "" },
  ],
}
