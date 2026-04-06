import { defineBlock } from "../core/schema"
import { TestimonialsRender } from "./testimonials"

const fields = {
  heading: { type: "text", label: "Heading", default: "What Our Customers Say", group: "Content", content: true },
  items: { type: "text", label: "Testimonials (name|quote, one per line)", default: "Sarah M.|Absolutely love the quality! Will definitely order again.\nJames K.|Fast shipping and the product exceeded my expectations.\nEmily R.|Best customer service I've ever experienced.", group: "Content", content: true, multiline: true },
  columns: { type: "number", label: "Columns", default: 3, group: "Layout", min: 1, max: 4, step: 1 },
  backgroundColor: { type: "color", label: "Background", default: "#f9fafb", group: "Style" },
  accentColor: { type: "color", label: "Accent", default: "#005bd3", group: "Style" },
  paddingTop: { type: "spacing", label: "Padding Top", default: 48, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 48, group: "Layout", min: 0, max: 120 },
} as const

export const TestimonialsSchema = defineBlock({
  name: "Testimonials",
  category: "Social Proof",
  icon: "Quote",
  description: "Customer testimonial cards",
  fields,
  render: TestimonialsRender,
})
