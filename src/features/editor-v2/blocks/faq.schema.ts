import { defineBlock } from "../core/schema"
import { FAQRender } from "./faq"

const fields = {
  heading: { type: "text", label: "Heading", default: "Frequently Asked Questions", group: "Content", content: true },
  items: { type: "text", label: "Items (Q|A, one per line)", default: "What is your return policy?|We offer 30-day returns on all items.\nHow long does shipping take?|Standard shipping takes 3-5 business days.\nDo you ship internationally?|Yes, we ship to over 50 countries.", group: "Content", content: true, multiline: true },
  backgroundColor: { type: "color", label: "Background", default: "", group: "Style" },
  accentColor: { type: "color", label: "Accent", default: "#005bd3", group: "Style" },
  paddingTop: { type: "spacing", label: "Padding Top", default: 48, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 48, group: "Layout", min: 0, max: 120 },
} as const

export const FAQSchema = defineBlock({
  name: "FAQ",
  category: "Content",
  icon: "HelpCircle",
  description: "Accordion-style FAQ section",
  fields,
  render: FAQRender,
})
