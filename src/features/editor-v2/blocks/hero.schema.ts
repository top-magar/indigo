import { defineBlock } from "../core/schema"
import { HeroRender } from "./hero"

const fields = {
  heading: { type: "text", label: "Heading", default: "Welcome to our store", group: "Content", content: true },
  subheading: { type: "text", label: "Subheading", default: "Discover amazing products", group: "Content", content: true, multiline: true },
  ctaText: { type: "text", label: "Button Text", default: "Shop Now", group: "Content", content: true },
  ctaHref: { type: "text", label: "Button Link", default: "/products", group: "Content", placeholder: "/products" },
  variant: { type: "enum", label: "Layout", default: "full" as const, group: "Layout", options: [{ value: "full" as const, label: "Full Width" }, { value: "split" as const, label: "Split" }, { value: "minimal" as const, label: "Minimal" }] },
  textAlign: { type: "enum", label: "Text Align", default: "center" as const, group: "Layout", options: [{ value: "left" as const, label: "Left" }, { value: "center" as const, label: "Center" }, { value: "right" as const, label: "Right" }] },
  image: { type: "image", label: "Background Image", default: "", group: "Style", content: true },
  backgroundColor: { type: "color", label: "Background", default: "#1a1a2e", group: "Style" },
  textColor: { type: "color", label: "Text Color", default: "#ffffff", group: "Style" },
  ctaColor: { type: "color", label: "Button Color", default: "#005bd3", group: "Style" },
  paddingTop: { type: "spacing", label: "Padding Top", default: 64, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 64, group: "Layout", min: 0, max: 120 },
  minHeight: { type: "number", label: "Min Height", default: 400, group: "Layout", min: 200, max: 800, unit: "px" },
} as const

export const HeroSchema = defineBlock({
  name: "Hero",
  category: "Sections",
  icon: "LayoutTemplate",
  description: "Full-width hero section with heading, subheading, and CTA",
  fields,
  presets: [
    { label: "Full Width", props: { variant: "full", textAlign: "center" } },
    { label: "Split", props: { variant: "split", textAlign: "left" } },
    { label: "Minimal", props: { variant: "minimal", textAlign: "center", minHeight: 200, paddingTop: 32, paddingBottom: 32 } },
  ],
  render: HeroRender,
})
