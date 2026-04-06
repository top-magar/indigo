import { defineBlock } from "../core/schema"
import { ButtonRender } from "./button"

const fields = {
  text: { type: "text", label: "Label", default: "Click me", group: "Content", content: true },
  href: { type: "text", label: "Link", default: "#", group: "Content", placeholder: "/page" },
  variant: { type: "enum", label: "Style", default: "solid" as const, group: "Style", options: [{ value: "solid" as const, label: "Solid" }, { value: "outline" as const, label: "Outline" }, { value: "ghost" as const, label: "Ghost" }] },
  size: { type: "enum", label: "Size", default: "md" as const, group: "Style", options: [{ value: "sm" as const, label: "Small" }, { value: "md" as const, label: "Medium" }, { value: "lg" as const, label: "Large" }] },
  alignment: { type: "enum", label: "Align", default: "left" as const, group: "Layout", options: [{ value: "left" as const, label: "Left" }, { value: "center" as const, label: "Center" }, { value: "right" as const, label: "Right" }] },
  color: { type: "color", label: "Color", default: "#005bd3", group: "Style" },
  textColor: { type: "color", label: "Text Color", default: "#ffffff", group: "Style" },
  fullWidth: { type: "boolean", label: "Full Width", default: false, group: "Layout" },
} as const

export const ButtonSchema = defineBlock({
  name: "Button",
  category: "Content",
  icon: "MousePointerClick",
  description: "Call-to-action button with variants",
  fields,
  presets: [
    { label: "Primary", props: { variant: "solid", color: "#005bd3" } },
    { label: "Outline", props: { variant: "outline", color: "#005bd3" } },
    { label: "Ghost", props: { variant: "ghost" } },
  ],
  render: ButtonRender,
})
