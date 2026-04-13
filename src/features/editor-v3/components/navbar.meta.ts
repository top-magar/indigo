import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Navbar",
  category: "navigation",
  icon: "navigation",
  contentModel: { category: "none", children: [] },
  propsSchema: [
    { name: "storeName", label: "Store Name", type: "string", defaultValue: "My Store" },
    { name: "links", label: "Nav Links", type: "json", defaultValue: [{ label: "Shop", href: "/products" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
    { name: "layout", label: "Layout", type: "string", defaultValue: "logo-left", options: [{ value: "logo-left", label: "Logo Left" }, { value: "logo-center", label: "Logo Center" }, { value: "minimal", label: "Minimal" }] },
    { name: "ctaText", label: "CTA Text", type: "string", defaultValue: "Get Started" },
    { name: "ctaHref", label: "CTA Link", type: "string", defaultValue: "#" },
    { name: "sticky", label: "Sticky", type: "boolean", defaultValue: true },
    { name: "showCart", label: "Show Cart", type: "boolean", defaultValue: true },
  ],
  tag: "header",
}
