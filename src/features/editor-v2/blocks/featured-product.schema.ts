import { defineBlock } from "../core/schema"
import { FeaturedProductRender } from "./featured-product"

const fields = {
  title: { type: "text", label: "Product Name", default: "Premium Wireless Headphones", group: "Content", content: true },
  description: { type: "text", label: "Description", default: "Experience crystal-clear audio with our flagship headphones.", group: "Content", content: true, multiline: true },
  price: { type: "text", label: "Price", default: "$299.00", group: "Content", content: true },
  ctaText: { type: "text", label: "Button Text", default: "Add to Cart", group: "Content", content: true },
  image: { type: "image", label: "Image", default: "", group: "Content", content: true },
  layout: { type: "enum", label: "Layout", default: "left" as const, group: "Layout", options: [{ value: "left" as const, label: "Image Left" }, { value: "right" as const, label: "Image Right" }] },
  backgroundColor: { type: "color", label: "Background", default: "", group: "Style" },
  accentColor: { type: "color", label: "Button Color", default: "#005bd3", group: "Style" },
  paddingTop: { type: "spacing", label: "Padding Top", default: 48, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 48, group: "Layout", min: 0, max: 120 },
} as const

export const FeaturedProductSchema = defineBlock({
  name: "FeaturedProduct",
  category: "Commerce",
  icon: "Star",
  description: "Highlight a single product with image and details",
  fields,
  render: FeaturedProductRender,
})
