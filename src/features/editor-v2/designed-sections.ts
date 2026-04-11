import { nanoid } from "nanoid"
import type { Section } from "./store"

export interface DesignedSection {
  id: string
  name: string
  description: string
  category: string
  build: () => Section
}

const sec = (type: string, props: Record<string, unknown>, children?: Record<string, Section[]>): Section => ({
  id: nanoid(), type, props, children,
})

const stack = (items: Section[]): Section =>
  sec("stack", { direction: "vertical", gap: 12, align: "start" }, { content: items })

const centeredStack = (items: Section[]): Section =>
  sec("stack", { direction: "vertical", gap: 16, align: "center" }, { content: items })

const h = (text: string, level = "h2", alignment = "left") =>
  sec("headingBlock", { text, level, alignment })

const p = (text: string, alignment = "left") =>
  sec("paragraphBlock", { text, alignment })

const btn = (text: string, variant = "solid") =>
  sec("button", { text, href: "#", variant, size: "md", color: "#000000" })

const img = (alt = "Image") =>
  sec("image", { src: "", alt, objectFit: "cover", borderRadius: 8, maxHeight: 400, caption: "" })

export const designedSections: DesignedSection[] = [
  {
    id: "hero-split",
    name: "Hero Split",
    description: "Image + text side by side",
    category: "welcome",
    build: () => sec("columns", { columns: 2, gap: 32 }, {
      col_0: [stack([h("Welcome to our store", "h1"), p("Discover amazing products and start shopping today."), btn("Shop Now")])],
      col_1: [img("Hero image")],
    }),
  },
  {
    id: "hero-centered",
    name: "Hero Centered",
    description: "Centered heading with CTA",
    category: "welcome",
    build: () => sec("stack", { direction: "vertical", gap: 16, align: "center" }, {
      content: [h("Welcome to our store", "h1", "center"), p("Discover amazing products and start shopping today.", "center"), btn("Get Started")],
    }),
  },
  {
    id: "features-3col",
    name: "Features 3-Column",
    description: "Three feature cards",
    category: "features",
    build: () => sec("columns", { columns: 3, gap: 24 }, {
      col_0: [stack([h("Fast Shipping", "h3"), p("Get your orders delivered quickly and reliably.")])],
      col_1: [stack([h("Secure Payments", "h3"), p("Shop with confidence using encrypted checkout.")])],
      col_2: [stack([h("24/7 Support", "h3"), p("Our team is here to help you anytime.")])],
    }),
  },
  {
    id: "testimonials-grid",
    name: "Testimonials Grid",
    description: "Customer quotes grid",
    category: "social-proof",
    build: () => sec("columns", { columns: 3, gap: 24 }, {
      col_0: [stack([p('"Absolutely love the quality and fast delivery!"'), h("Sarah M.", "h4")])],
      col_1: [stack([p('"Best shopping experience I\'ve ever had."'), h("James K.", "h4")])],
      col_2: [stack([p('"Great products at amazing prices. Highly recommend!"'), h("Emily R.", "h4")])],
    }),
  },
  {
    id: "cta-banner",
    name: "CTA Banner",
    description: "Dark call-to-action banner",
    category: "cta",
    build: () => sec("container", { layout: "flex-col", gap: 16, alignItems: "center", justifyContent: "center", wrap: false, _backgroundColor: "#111827", _paddingTop: "48", _paddingBottom: "48" }, {
      content: [h("Ready to get started?", "h2", "center"), p("Join thousands of happy customers today.", "center"), btn("Sign Up Now")],
    }),
  },
  {
    id: "stats-row",
    name: "Stats Row",
    description: "Numbers that impress",
    category: "social-proof",
    build: () => sec("columns", { columns: 4, gap: 16 }, {
      col_0: [centeredStack([h("10K+", "h2", "center"), p("Customers", "center")])],
      col_1: [centeredStack([h("500+", "h2", "center"), p("Products", "center")])],
      col_2: [centeredStack([h("99%", "h2", "center"), p("Satisfaction", "center")])],
      col_3: [centeredStack([h("24/7", "h2", "center"), p("Support", "center")])],
    }),
  },
  {
    id: "image-text",
    name: "Image + Text",
    description: "Image with text content",
    category: "content",
    build: () => sec("columns", { columns: 2, gap: 32 }, {
      col_0: [img("Feature image")],
      col_1: [stack([h("Why choose us", "h2"), p("We provide the best products with exceptional quality and service."), btn("Learn More", "outline")])],
    }),
  },
  {
    id: "contact-split",
    name: "Contact Split",
    description: "Contact info + form",
    category: "contact",
    build: () => sec("columns", { columns: 2, gap: 32 }, {
      col_0: [stack([
        h("Get in touch", "h2"),
        p("We'd love to hear from you. Reach out anytime."),
        sec("socialIcons", { links: JSON.stringify([{ platform: "twitter", url: "#" }, { platform: "instagram", url: "#" }, { platform: "facebook", url: "#" }]) }),
      ])],
      col_1: [sec("form", { heading: "Contact Us", buttonText: "Send Message", successMessage: "Thanks! We'll be in touch.", recipientEmail: "", fields: JSON.stringify([{ label: "Name", type: "text" }, { label: "Email", type: "email" }, { label: "Message", type: "textarea" }]) })],
    }),
  },
]
