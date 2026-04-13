import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Footer",
  category: "navigation",
  icon: "panel-bottom",
  contentModel: { category: "none", children: [] },
  propsSchema: [
    { name: "storeName", label: "Store Name", type: "string", defaultValue: "My Store" },
    { name: "description", label: "Description", type: "string", defaultValue: "Quality products for everyone.", multiline: true },
    { name: "columns", label: "Link Columns", type: "json", defaultValue: [{ title: "Shop", links: "All Products\nNew Arrivals\nSale" }, { title: "Company", links: "About\nCareers\nContact" }, { title: "Support", links: "FAQ\nShipping\nReturns" }] },
    { name: "layout", label: "Layout", type: "string", defaultValue: "columns", options: [{ value: "columns", label: "Columns" }, { value: "minimal", label: "Minimal" }, { value: "centered", label: "Centered" }] },
    { name: "showNewsletter", label: "Newsletter", type: "boolean", defaultValue: true },
    { name: "socialLinks", label: "Social Links", type: "json", defaultValue: [{ platform: "instagram", url: "#" }, { platform: "twitter", url: "#" }] },
    { name: "copyright", label: "Copyright", type: "string", defaultValue: "" },
  ],
  tag: "footer",
}
