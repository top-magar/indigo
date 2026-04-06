import { defineBlock } from "../core/schema"
import { HeaderRender } from "./header"

const fields = {
  logoText: { type: "text", label: "Logo", default: "Store", group: "Content", content: true },
  navItems: { type: "text", label: "Nav Items (comma-separated)", default: "Shop,Collections,About,Contact", group: "Content", content: true },
  sticky: { type: "boolean", label: "Sticky", default: true, group: "Layout" },
  backgroundColor: { type: "color", label: "Background", default: "#ffffff", group: "Style" },
  textColor: { type: "color", label: "Text Color", default: "#111827", group: "Style" },
  accentColor: { type: "color", label: "Accent", default: "#005bd3", group: "Style" },
} as const

export const HeaderSchema = defineBlock({
  name: "Header",
  category: "Navigation",
  icon: "PanelTop",
  description: "Site header with logo and navigation",
  fields,
  render: HeaderRender,
})
