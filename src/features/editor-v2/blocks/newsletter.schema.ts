import { defineBlock } from "../core/schema"
import { NewsletterRender } from "./newsletter"

const fields = {
  heading: { type: "text", label: "Heading", default: "Stay in the loop", group: "Content", content: true },
  subheading: { type: "text", label: "Subheading", default: "Subscribe for exclusive deals and new arrivals.", group: "Content", content: true },
  buttonText: { type: "text", label: "Button Text", default: "Subscribe", group: "Content", content: true },
  placeholder: { type: "text", label: "Placeholder", default: "Enter your email", group: "Content" },
  backgroundColor: { type: "color", label: "Background", default: "#f9fafb", group: "Style" },
  accentColor: { type: "color", label: "Button Color", default: "#005bd3", group: "Style" },
  paddingTop: { type: "spacing", label: "Padding Top", default: 48, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 48, group: "Layout", min: 0, max: 120 },
} as const

export const NewsletterSchema = defineBlock({
  name: "Newsletter",
  category: "Commerce",
  icon: "Mail",
  description: "Email signup form",
  fields,
  render: NewsletterRender,
})
