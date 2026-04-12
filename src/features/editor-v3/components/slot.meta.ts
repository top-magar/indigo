import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Slot",
  category: "general",
  icon: "layers",
  contentModel: {
    category: "slot",
    children: ["container", "content", "form", "form-field", "slot"],
  },
  propsSchema: [],
}
