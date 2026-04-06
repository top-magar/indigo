import { defineBlock } from "../core/schema"
import { FooterRender } from "./footer"

const fields = {
  companyName: { type: "text", label: "Company", default: "Store Inc.", group: "Content", content: true },
  copyright: { type: "text", label: "Copyright", default: "© 2026 All rights reserved.", group: "Content", content: true },
  col1Title: { type: "text", label: "Column 1 Title", default: "Shop", group: "Content" },
  col1Links: { type: "text", label: "Column 1 Links", default: "All Products,New Arrivals,Best Sellers", group: "Content" },
  col2Title: { type: "text", label: "Column 2 Title", default: "Company", group: "Content" },
  col2Links: { type: "text", label: "Column 2 Links", default: "About,Contact,Careers", group: "Content" },
  backgroundColor: { type: "color", label: "Background", default: "#111827", group: "Style" },
  textColor: { type: "color", label: "Text Color", default: "#d1d5db", group: "Style" },
  paddingTop: { type: "spacing", label: "Padding Top", default: 48, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 48, group: "Layout", min: 0, max: 120 },
} as const

export const FooterSchema = defineBlock({
  name: "Footer",
  category: "Navigation",
  icon: "PanelBottom",
  description: "Site footer with link columns and copyright",
  fields,
  render: FooterRender,
})
