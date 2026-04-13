import type { Instance, StyleDeclaration, Prop, StyleSource, StyleSourceSelection } from "./types"
import { generateId } from "./id"

interface TemplateNode {
  component: string
  tag?: string
  label?: string
  props?: Record<string, { type: Prop["type"]; value: Prop["value"] }>
  styles?: Record<string, { type: "unit"; value: number; unit: string } | { type: "keyword"; value: string } | { type: "rgb"; r: number; g: number; b: number; a: number } | { type: "unparsed"; value: string }>
  text?: string
  children?: TemplateNode[]
}

export interface BlockTemplate {
  id: string
  name: string
  category: string
  description: string
  build: () => { instances: Instance[]; props: Prop[]; styleSources: StyleSource[]; styleSourceSelections: StyleSourceSelection[]; styleDeclarations: StyleDeclaration[]; rootId: string }
}

/** Recursively build flat instances + props + styles from a template tree */
function buildTree(node: TemplateNode, parentId: string | null, position: number, breakpointId: string) {
  const id = generateId()
  const instances: Instance[] = []
  const props: Prop[] = []
  const styleSources: StyleSource[] = []
  const styleSourceSelections: StyleSourceSelection[] = []
  const styleDeclarations: StyleDeclaration[] = []

  const children: Instance["children"] = []
  if (node.text) children.push({ type: "text", value: node.text })

  instances.push({ id, component: node.component, tag: node.tag, label: node.label, children })

  // Props
  if (node.props) {
    for (const [name, p] of Object.entries(node.props)) {
      const propId = generateId()
      props.push({ id: propId, instanceId: id, name, type: p.type, value: p.value } as Prop)
    }
  }

  // Styles
  if (node.styles && Object.keys(node.styles).length > 0) {
    const ssId = generateId()
    styleSources.push({ id: ssId, type: "local" })
    styleSourceSelections.push({ instanceId: id, values: [ssId] })
    for (const [property, value] of Object.entries(node.styles)) {
      styleDeclarations.push({ styleSourceId: ssId, breakpointId, property, value: value as StyleDeclaration["value"] })
    }
  }

  // Children
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const child = buildTree(node.children[i], id, i, breakpointId)
      children.push({ type: "id", value: child.rootId })
      instances.push(...child.instances)
      props.push(...child.props)
      styleSources.push(...child.styleSources)
      styleSourceSelections.push(...child.styleSourceSelections)
      styleDeclarations.push(...child.styleDeclarations)
    }
  }

  return { instances, props, styleSources, styleSourceSelections, styleDeclarations, rootId: id }
}

function template(id: string, name: string, category: string, description: string, tree: TemplateNode): BlockTemplate {
  return { id, name, category, description, build: () => buildTree(tree, null, 0, "bp-base") }
}

// ── Shorthand helpers ──────────────────────────────────────────────────────────

const flex = (dir: string = "row", gap = 16, align = "center", justify = "space-between") => ({
  display: { type: "keyword" as const, value: "flex" },
  flexDirection: { type: "keyword" as const, value: dir },
  gap: { type: "unit" as const, value: gap, unit: "px" },
  alignItems: { type: "keyword" as const, value: align },
  justifyContent: { type: "keyword" as const, value: justify },
})

const pad = (v: number) => ({ padding: { type: "unit" as const, value: v, unit: "px" } })
const bg = (r: number, g: number, b: number) => ({ backgroundColor: { type: "rgb" as const, r, g, b, a: 1 } })
const color = (r: number, g: number, b: number) => ({ color: { type: "rgb" as const, r, g, b, a: 1 } })
const fontSize = (v: number) => ({ fontSize: { type: "unit" as const, value: v, unit: "px" } })
const bold = { fontWeight: { type: "keyword" as const, value: "700" } }
const center = { textAlign: { type: "keyword" as const, value: "center" } }
const radius = (v: number) => ({ borderRadius: { type: "unit" as const, value: v, unit: "px" } })
const border = (c: string) => ({ borderBottom: { type: "unparsed" as const, value: `1px solid ${c}` } })
const maxW = (v: number) => ({ maxWidth: { type: "unit" as const, value: v, unit: "px" }, margin: { type: "unparsed" as const, value: "0 auto" } })

// ── Templates ──────────────────────────────────────────────────────────────────

export const blockTemplates: BlockTemplate[] = [
  template("header-simple", "Header — Simple", "navigation", "Logo + nav links + CTA", {
    component: "Box", tag: "header", label: "Header",
    styles: { ...flex("row", 16), ...pad(16), ...border("#e5e7eb") },
    children: [
      { component: "Heading", label: "Logo", text: "My Store", props: { level: { type: "number", value: 1 } }, styles: { ...fontSize(20) } },
      { component: "Box", tag: "nav", label: "Nav", styles: { ...flex("row", 24, "center", "flex-end"), flex: { type: "keyword", value: "1" } }, children: [
        { component: "Link", text: "Shop", props: { href: { type: "string", value: "#" } } },
        { component: "Link", text: "About", props: { href: { type: "string", value: "#" } } },
        { component: "Link", text: "Contact", props: { href: { type: "string", value: "#" } } },
      ]},
      { component: "Button", text: "Shop Now", styles: { ...bg(0, 0, 0), ...color(255, 255, 255), ...pad(12), ...radius(8), border: { type: "keyword", value: "none" } } },
    ],
  }),

  template("header-centered", "Header — Centered", "navigation", "Nav left, logo center, CTA right", {
    component: "Box", tag: "header", label: "Header",
    styles: { ...flex("row", 16), ...pad(16), ...border("#e5e7eb") },
    children: [
      { component: "Box", tag: "nav", styles: { ...flex("row", 16, "center", "flex-start"), flex: { type: "keyword", value: "1" } }, children: [
        { component: "Link", text: "Shop", props: { href: { type: "string", value: "#" } } },
        { component: "Link", text: "About", props: { href: { type: "string", value: "#" } } },
      ]},
      { component: "Heading", label: "Logo", text: "My Store", props: { level: { type: "number", value: 1 } }, styles: { ...fontSize(22) } },
      { component: "Box", styles: { ...flex("row", 16, "center", "flex-end"), flex: { type: "keyword", value: "1" } }, children: [
        { component: "Link", text: "Blog", props: { href: { type: "string", value: "#" } } },
        { component: "Button", text: "Get Started", styles: { ...bg(0, 0, 0), ...color(255, 255, 255), ...pad(10), ...radius(6), border: { type: "keyword", value: "none" } } },
      ]},
    ],
  }),

  template("hero-centered", "Hero — Centered", "sections", "Centered heading + description + CTA", {
    component: "Box", tag: "section", label: "Hero",
    styles: { ...pad(80), ...center, ...flex("column", 20, "center", "center") },
    children: [
      { component: "Heading", text: "Welcome to My Store", props: { level: { type: "number", value: 1 } }, styles: { ...fontSize(48), ...bold } },
      { component: "Text", text: "Discover amazing products at great prices.", styles: { ...fontSize(18), ...color(107, 114, 128) } },
      { component: "Button", text: "Shop Now", styles: { ...bg(0, 0, 0), ...color(255, 255, 255), padding: { type: "unparsed", value: "14px 36px" }, ...radius(8), ...fontSize(16), border: { type: "keyword", value: "none" } } },
    ],
  }),

  template("hero-split", "Hero — Split", "sections", "Text left + image right", {
    component: "Box", tag: "section", label: "Hero",
    styles: { ...flex("row", 48), ...pad(64), alignItems: { type: "keyword", value: "center" } },
    children: [
      { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...flex("column", 16, "flex-start", "center") }, children: [
        { component: "Heading", text: "Build your dream store", props: { level: { type: "number", value: 1 } }, styles: { ...fontSize(42), ...bold } },
        { component: "Text", text: "Everything you need to sell online. Start your journey today.", styles: { ...fontSize(18), ...color(107, 114, 128) } },
        { component: "Button", text: "Get Started", styles: { ...bg(0, 0, 0), ...color(255, 255, 255), padding: { type: "unparsed", value: "14px 32px" }, ...radius(8), border: { type: "keyword", value: "none" } } },
      ]},
      { component: "Image", label: "Hero Image", props: { src: { type: "string", value: "https://placehold.co/600x400/f3f4f6/9ca3af?text=Hero+Image" }, alt: { type: "string", value: "Hero" } }, styles: { flex: { type: "keyword", value: "1" }, ...radius(12), width: { type: "unit", value: 100, unit: "%" }, maxHeight: { type: "unit", value: 400, unit: "px" }, objectFit: { type: "keyword", value: "cover" } } },
    ],
  }),

  template("features-3col", "Features — 3 Column", "sections", "Three feature cards", {
    component: "Box", tag: "section", label: "Features",
    styles: { ...pad(64), ...maxW(1200) },
    children: [
      { component: "Heading", text: "Why Choose Us", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(32), ...bold, ...center, marginBottom: { type: "unit", value: 32, unit: "px" } } },
      { component: "Box", styles: { ...flex("row", 24) }, children: [
        { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...center, ...pad(24) }, children: [
          { component: "Heading", text: "Fast Shipping", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(20), ...bold } },
          { component: "Text", text: "Get your orders delivered quickly and reliably.", styles: { ...color(107, 114, 128) } },
        ]},
        { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...center, ...pad(24) }, children: [
          { component: "Heading", text: "Secure Payments", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(20), ...bold } },
          { component: "Text", text: "Shop with confidence using encrypted checkout.", styles: { ...color(107, 114, 128) } },
        ]},
        { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...center, ...pad(24) }, children: [
          { component: "Heading", text: "24/7 Support", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(20), ...bold } },
          { component: "Text", text: "Our team is here to help you anytime.", styles: { ...color(107, 114, 128) } },
        ]},
      ]},
    ],
  }),

  template("newsletter", "Newsletter — CTA", "sections", "Email signup section", {
    component: "Box", tag: "section", label: "Newsletter",
    styles: { ...pad(64), ...center, ...bg(249, 250, 251) },
    children: [
      { component: "Heading", text: "Stay Updated", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(28), ...bold } },
      { component: "Text", text: "Subscribe to our newsletter for the latest products and deals.", styles: { ...color(107, 114, 128), marginBottom: { type: "unit", value: 24, unit: "px" } } },
      { component: "Form", label: "Newsletter Form", styles: { ...flex("row", 8, "center", "center"), ...maxW(480) }, children: [
        { component: "Input", props: { type: { type: "string", value: "email" }, placeholder: { type: "string", value: "you@example.com" }, name: { type: "string", value: "email" } }, styles: { flex: { type: "keyword", value: "1" }, padding: { type: "unparsed", value: "10px 16px" }, ...radius(8), border: { type: "unparsed", value: "1px solid #d1d5db" } } },
        { component: "Button", text: "Subscribe", props: { type: { type: "string", value: "submit" } }, styles: { ...bg(0, 0, 0), ...color(255, 255, 255), padding: { type: "unparsed", value: "10px 24px" }, ...radius(8), border: { type: "keyword", value: "none" } } },
      ]},
    ],
  }),

  template("footer-columns", "Footer — Columns", "navigation", "Brand + link columns + copyright", {
    component: "Box", tag: "footer", label: "Footer",
    styles: { ...bg(17, 24, 39), ...color(249, 250, 251), ...pad(48) },
    children: [
      { component: "Box", styles: { ...flex("row", 48), ...maxW(1200), marginBottom: { type: "unit", value: 32, unit: "px" } }, children: [
        { component: "Box", styles: { flex: { type: "keyword", value: "1" } }, children: [
          { component: "Heading", text: "My Store", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(18), ...bold, marginBottom: { type: "unit", value: 8, unit: "px" } } },
          { component: "Text", text: "Your one-stop shop for amazing products.", styles: { ...color(156, 163, 175), ...fontSize(14) } },
        ]},
        { component: "Box", styles: { ...flex("column", 8, "flex-start", "flex-start") }, children: [
          { component: "Heading", text: "Shop", props: { level: { type: "number", value: 4 } }, styles: { ...fontSize(14), ...bold, marginBottom: { type: "unit", value: 4, unit: "px" } } },
          { component: "Link", text: "All Products", props: { href: { type: "string", value: "#" } }, styles: { ...color(156, 163, 175), ...fontSize(14) } },
          { component: "Link", text: "New Arrivals", props: { href: { type: "string", value: "#" } }, styles: { ...color(156, 163, 175), ...fontSize(14) } },
          { component: "Link", text: "Sale", props: { href: { type: "string", value: "#" } }, styles: { ...color(156, 163, 175), ...fontSize(14) } },
        ]},
        { component: "Box", styles: { ...flex("column", 8, "flex-start", "flex-start") }, children: [
          { component: "Heading", text: "Company", props: { level: { type: "number", value: 4 } }, styles: { ...fontSize(14), ...bold, marginBottom: { type: "unit", value: 4, unit: "px" } } },
          { component: "Link", text: "About", props: { href: { type: "string", value: "#" } }, styles: { ...color(156, 163, 175), ...fontSize(14) } },
          { component: "Link", text: "Blog", props: { href: { type: "string", value: "#" } }, styles: { ...color(156, 163, 175), ...fontSize(14) } },
          { component: "Link", text: "Contact", props: { href: { type: "string", value: "#" } }, styles: { ...color(156, 163, 175), ...fontSize(14) } },
        ]},
        { component: "Box", styles: { ...flex("column", 8, "flex-start", "flex-start") }, children: [
          { component: "Heading", text: "Help", props: { level: { type: "number", value: 4 } }, styles: { ...fontSize(14), ...bold, marginBottom: { type: "unit", value: 4, unit: "px" } } },
          { component: "Link", text: "FAQ", props: { href: { type: "string", value: "#" } }, styles: { ...color(156, 163, 175), ...fontSize(14) } },
          { component: "Link", text: "Shipping", props: { href: { type: "string", value: "#" } }, styles: { ...color(156, 163, 175), ...fontSize(14) } },
          { component: "Link", text: "Returns", props: { href: { type: "string", value: "#" } }, styles: { ...color(156, 163, 175), ...fontSize(14) } },
        ]},
      ]},
      { component: "Text", text: "© 2026 My Store. All rights reserved.", styles: { ...color(107, 114, 128), ...fontSize(12), ...center, borderTop: { type: "unparsed", value: "1px solid #374151" }, paddingTop: { type: "unit", value: 24, unit: "px" } } },
    ],
  }),

  template("product-card", "Product Card", "commerce", "Image + title + price + button", {
    component: "Box", label: "Product Card",
    styles: { ...flex("column", 12, "stretch", "flex-start"), ...radius(12), overflow: { type: "keyword", value: "hidden" }, border: { type: "unparsed", value: "1px solid #e5e7eb" } },
    children: [
      { component: "Image", label: "Product Image", props: { src: { type: "string", value: "https://placehold.co/400x400/f3f4f6/9ca3af?text=Product" }, alt: { type: "string", value: "Product" } }, styles: { width: { type: "unit", value: 100, unit: "%" }, height: { type: "unit", value: 240, unit: "px" } } },
      { component: "Box", styles: { ...pad(16), ...flex("column", 8, "flex-start", "flex-start") }, children: [
        { component: "Heading", text: "Product Name", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(16), ...bold } },
        { component: "Text", text: "$49.99", styles: { ...fontSize(18), ...bold } },
        { component: "Button", text: "Add to Cart", styles: { ...bg(0, 0, 0), ...color(255, 255, 255), padding: { type: "unparsed", value: "10px 20px" }, ...radius(6), border: { type: "keyword", value: "none" }, width: { type: "unit", value: 100, unit: "%" } } },
      ]},
    ],
  }),

  // ── New Templates ──────────────────────────────────────────────────────────

  template("testimonials", "Testimonials", "sections", "3 customer testimonial cards", {
    component: "Box", tag: "section", label: "Testimonials",
    styles: { ...pad(64), ...maxW(1200) },
    children: [
      { component: "Heading", text: "What Our Customers Say", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(32), ...bold, ...center, marginBottom: { type: "unit", value: 32, unit: "px" } } },
      { component: "Box", styles: { ...flex("row", 24) }, children: [
        { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...pad(24), ...radius(12), ...bg(249, 250, 251), ...flex("column", 12, "flex-start", "flex-start") }, children: [
          { component: "Text", text: "\"Absolutely love the quality. Will definitely order again!\"", styles: { ...fontSize(14), ...color(55, 65, 81), fontStyle: { type: "keyword", value: "italic" } } },
          { component: "Text", text: "— Sarah J.", styles: { ...fontSize(13), ...bold } },
        ]},
        { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...pad(24), ...radius(12), ...bg(249, 250, 251), ...flex("column", 12, "flex-start", "flex-start") }, children: [
          { component: "Text", text: "\"Fast shipping and great customer service. Highly recommend.\"", styles: { ...fontSize(14), ...color(55, 65, 81), fontStyle: { type: "keyword", value: "italic" } } },
          { component: "Text", text: "— Mike R.", styles: { ...fontSize(13), ...bold } },
        ]},
        { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...pad(24), ...radius(12), ...bg(249, 250, 251), ...flex("column", 12, "flex-start", "flex-start") }, children: [
          { component: "Text", text: "\"Best online shopping experience I've had in years.\"", styles: { ...fontSize(14), ...color(55, 65, 81), fontStyle: { type: "keyword", value: "italic" } } },
          { component: "Text", text: "— Lisa K.", styles: { ...fontSize(13), ...bold } },
        ]},
      ]},
    ],
  }),

  template("pricing-table", "Pricing Table", "sections", "3-tier pricing cards", {
    component: "Box", tag: "section", label: "Pricing",
    styles: { ...pad(64), ...maxW(1200) },
    children: [
      { component: "Heading", text: "Simple Pricing", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(32), ...bold, ...center, marginBottom: { type: "unit", value: 32, unit: "px" } } },
      { component: "Box", styles: { ...flex("row", 24, "stretch", "center") }, children: [
        { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...pad(32), ...radius(12), border: { type: "unparsed", value: "1px solid #e5e7eb" }, ...flex("column", 16, "center", "flex-start"), ...center }, children: [
          { component: "Heading", text: "Starter", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(18), ...bold } },
          { component: "Text", text: "$9/mo", styles: { ...fontSize(36), ...bold } },
          { component: "Text", text: "Perfect for getting started", styles: { ...fontSize(14), ...color(107, 114, 128) } },
          { component: "Button", text: "Choose Plan", styles: { ...bg(255, 255, 255), ...color(0, 0, 0), padding: { type: "unparsed", value: "10px 24px" }, ...radius(8), border: { type: "unparsed", value: "1px solid #000" }, width: { type: "unit", value: 100, unit: "%" } } },
        ]},
        { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...pad(32), ...radius(12), ...bg(0, 0, 0), ...color(255, 255, 255), ...flex("column", 16, "center", "flex-start"), ...center }, children: [
          { component: "Heading", text: "Pro", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(18), ...bold, ...color(255, 255, 255) } },
          { component: "Text", text: "$29/mo", styles: { ...fontSize(36), ...bold, ...color(255, 255, 255) } },
          { component: "Text", text: "Best for growing businesses", styles: { ...fontSize(14), ...color(156, 163, 175) } },
          { component: "Button", text: "Choose Plan", styles: { ...bg(255, 255, 255), ...color(0, 0, 0), padding: { type: "unparsed", value: "10px 24px" }, ...radius(8), border: { type: "keyword", value: "none" }, width: { type: "unit", value: 100, unit: "%" } } },
        ]},
        { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...pad(32), ...radius(12), border: { type: "unparsed", value: "1px solid #e5e7eb" }, ...flex("column", 16, "center", "flex-start"), ...center }, children: [
          { component: "Heading", text: "Enterprise", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(18), ...bold } },
          { component: "Text", text: "$99/mo", styles: { ...fontSize(36), ...bold } },
          { component: "Text", text: "For large-scale operations", styles: { ...fontSize(14), ...color(107, 114, 128) } },
          { component: "Button", text: "Contact Sales", styles: { ...bg(255, 255, 255), ...color(0, 0, 0), padding: { type: "unparsed", value: "10px 24px" }, ...radius(8), border: { type: "unparsed", value: "1px solid #000" }, width: { type: "unit", value: 100, unit: "%" } } },
        ]},
      ]},
    ],
  }),

  template("product-grid", "Product Grid — 3 Up", "commerce", "3-column product card grid", {
    component: "Box", tag: "section", label: "Product Grid",
    styles: { ...pad(48), ...maxW(1200) },
    children: [
      { component: "Heading", text: "Featured Products", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(28), ...bold, ...center, marginBottom: { type: "unit", value: 32, unit: "px" } } },
      { component: "Box", styles: { ...flex("row", 24) }, children: [1, 2, 3].map((i) => ({
        component: "Box", label: `Product ${i}`,
        styles: { flex: { type: "keyword" as const, value: "1" }, ...radius(12), overflow: { type: "keyword" as const, value: "hidden" }, border: { type: "unparsed" as const, value: "1px solid #e5e7eb" }, ...flex("column", 0, "stretch", "flex-start") },
        children: [
          { component: "Image", props: { src: { type: "string" as const, value: `https://placehold.co/400x300/f3f4f6/9ca3af?text=Product+${i}` }, alt: { type: "string" as const, value: `Product ${i}` } }, styles: { width: { type: "unit" as const, value: 100, unit: "%" }, height: { type: "unit" as const, value: 200, unit: "px" } } },
          { component: "Box", styles: { ...pad(16), ...flex("column", 8, "flex-start", "flex-start") }, children: [
            { component: "Heading", text: `Product ${i}`, props: { level: { type: "number" as const, value: 3 } }, styles: { ...fontSize(16), ...bold } },
            { component: "Text", text: `$${(19.99 + i * 10).toFixed(2)}`, styles: { ...fontSize(18), ...bold } },
            { component: "Button", text: "Add to Cart", styles: { ...bg(0, 0, 0), ...color(255, 255, 255), padding: { type: "unparsed" as const, value: "8px 16px" }, ...radius(6), border: { type: "keyword" as const, value: "none" }, width: { type: "unit" as const, value: 100, unit: "%" }, ...fontSize(14) } },
          ]},
        ],
      })) as TemplateNode[]},
    ],
  }),

  template("faq", "FAQ Section", "sections", "Expandable question/answer pairs", {
    component: "Box", tag: "section", label: "FAQ",
    styles: { ...pad(64), ...maxW(720) },
    children: [
      { component: "Heading", text: "Frequently Asked Questions", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(32), ...bold, ...center, marginBottom: { type: "unit", value: 32, unit: "px" } } },
      ...["How long does shipping take?|Most orders ship within 2-3 business days and arrive within 5-7 days.",
        "What is your return policy?|We offer a 30-day money-back guarantee on all products. No questions asked.",
        "Do you ship internationally?|Yes! We ship to over 50 countries worldwide. Shipping rates vary by location.",
        "How can I track my order?|Once your order ships, you'll receive an email with a tracking number and link."
      ].map((qa) => {
        const [q, a] = qa.split("|")
        return {
          component: "Box" as const, styles: { borderBottom: { type: "unparsed" as const, value: "1px solid #e5e7eb" }, ...pad(16) },
          children: [
            { component: "Heading", text: q, props: { level: { type: "number" as const, value: 3 } }, styles: { ...fontSize(16), ...bold } },
            { component: "Text", text: a, styles: { ...fontSize(14), ...color(107, 114, 128), marginTop: { type: "unit" as const, value: 8, unit: "px" } } },
          ],
        }
      }),
    ],
  }),

  // ── Section > Container templates ──

  template("about-section", "About Section", "sections", "Section with heading, text, and image", {
    component: "Box", tag: "section", label: "About",
    styles: { ...pad(80) },
    children: [
      { component: "Container", children: [
        { component: "Box", styles: { ...flex("row", 48), alignItems: { type: "keyword", value: "center" } }, children: [
          { component: "Box", styles: { flex: { type: "keyword", value: "1" }, ...flex("column", 16, "flex-start", "center") }, children: [
            { component: "Text", text: "About Us", styles: { ...fontSize(14), ...color(107, 114, 128), textTransform: { type: "keyword", value: "uppercase" }, letterSpacing: { type: "unit", value: 2, unit: "px" } } },
            { component: "Heading", text: "We build amazing products", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(36), ...bold } },
            { component: "Text", text: "Our team is passionate about creating tools that help businesses grow. We believe in simplicity, quality, and putting our customers first.", styles: { ...fontSize(16), ...color(107, 114, 128), lineHeight: { type: "unit", value: 1.7, unit: "em" } } },
          ]},
          { component: "Image", props: { src: { type: "string", value: "https://placehold.co/500x400/f3f4f6/9ca3af?text=About" }, alt: { type: "string", value: "About" } }, styles: { flex: { type: "keyword", value: "1" }, ...radius(12), width: { type: "unit", value: 100, unit: "%" } } },
        ]},
      ]},
    ],
  }),

  template("contact-section", "Contact Section", "sections", "Contact form with info sidebar", {
    component: "Box", tag: "section", label: "Contact",
    styles: { ...pad(80), ...bg(249, 250, 251) },
    children: [
      { component: "Container", children: [
        { component: "Box", styles: { ...center, ...flex("column", 12, "center", "center"), marginBottom: { type: "unit", value: 48, unit: "px" } }, children: [
          { component: "Heading", text: "Get in Touch", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(36), ...bold } },
          { component: "Text", text: "We'd love to hear from you. Send us a message and we'll respond as soon as possible.", styles: { ...fontSize(16), ...color(107, 114, 128), ...maxW(600) } },
        ]},
        { component: "Form", styles: { ...maxW(600), ...flex("column", 16, "stretch", "flex-start") }, children: [
          { component: "Input", props: { placeholder: { type: "string", value: "Your name" }, name: { type: "string", value: "name" } }, styles: { padding: { type: "unparsed", value: "12px 16px" }, border: { type: "unparsed", value: "1px solid #d1d5db" }, ...radius(8), ...fontSize(14) } },
          { component: "Input", props: { placeholder: { type: "string", value: "Your email" }, name: { type: "string", value: "email" }, type: { type: "string", value: "email" } }, styles: { padding: { type: "unparsed", value: "12px 16px" }, border: { type: "unparsed", value: "1px solid #d1d5db" }, ...radius(8), ...fontSize(14) } },
          { component: "Button", text: "Send Message", styles: { ...bg(0, 0, 0), ...color(255, 255, 255), padding: { type: "unparsed", value: "14px 32px" }, ...radius(8), border: { type: "keyword", value: "none" }, ...fontSize(14) } },
        ]},
      ]},
    ],
  }),

  template("newsletter-section", "Newsletter CTA", "sections", "Email signup with heading", {
    component: "Box", tag: "section", label: "Newsletter",
    styles: { ...pad(80), ...bg(17, 24, 39) },
    children: [
      { component: "Container", children: [
        { component: "Box", styles: { ...center, ...flex("column", 20, "center", "center") }, children: [
          { component: "Heading", text: "Stay in the loop", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(32), ...bold, ...color(255, 255, 255) } },
          { component: "Text", text: "Subscribe to our newsletter for updates, tips, and exclusive offers.", styles: { ...fontSize(16), ...color(156, 163, 175) } },
          { component: "Box", styles: { ...flex("row", 8, "center", "center") }, children: [
            { component: "Input", props: { placeholder: { type: "string", value: "Enter your email" }, type: { type: "string", value: "email" } }, styles: { padding: { type: "unparsed", value: "12px 20px" }, ...radius(8), border: { type: "keyword", value: "none" }, ...fontSize(14), width: { type: "unit", value: 300, unit: "px" } } },
            { component: "Button", text: "Subscribe", styles: { ...bg(59, 130, 246), ...color(255, 255, 255), padding: { type: "unparsed", value: "12px 24px" }, ...radius(8), border: { type: "keyword", value: "none" }, ...fontSize(14) } },
          ]},
        ]},
      ]},
    ],
  }),

  template("stats-section", "Stats Section", "sections", "Key metrics in a row", {
    component: "Box", tag: "section", label: "Stats",
    styles: { ...pad(64), ...bg(249, 250, 251) },
    children: [
      { component: "Container", children: [
        { component: "Box", styles: { display: { type: "keyword", value: "grid" }, gridTemplateColumns: { type: "unparsed", value: "repeat(4, 1fr)" }, gap: { type: "unit", value: 32, unit: "px" } }, children: [
          { component: "Box", styles: { ...center }, children: [
            { component: "Heading", text: "10K+", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(36), ...bold } },
            { component: "Text", text: "Customers", styles: { ...fontSize(14), ...color(107, 114, 128) } },
          ]},
          { component: "Box", styles: { ...center }, children: [
            { component: "Heading", text: "50M+", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(36), ...bold } },
            { component: "Text", text: "Revenue", styles: { ...fontSize(14), ...color(107, 114, 128) } },
          ]},
          { component: "Box", styles: { ...center }, children: [
            { component: "Heading", text: "99.9%", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(36), ...bold } },
            { component: "Text", text: "Uptime", styles: { ...fontSize(14), ...color(107, 114, 128) } },
          ]},
          { component: "Box", styles: { ...center }, children: [
            { component: "Heading", text: "24/7", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(36), ...bold } },
            { component: "Text", text: "Support", styles: { ...fontSize(14), ...color(107, 114, 128) } },
          ]},
        ]},
      ]},
    ],
  }),

  template("team-section", "Team Section", "sections", "Team member cards grid", {
    component: "Box", tag: "section", label: "Team",
    styles: { ...pad(80) },
    children: [
      { component: "Container", children: [
        { component: "Box", styles: { ...center, marginBottom: { type: "unit", value: 48, unit: "px" } }, children: [
          { component: "Heading", text: "Meet Our Team", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(36), ...bold } },
        ]},
        { component: "Box", styles: { display: { type: "keyword", value: "grid" }, gridTemplateColumns: { type: "unparsed", value: "repeat(3, 1fr)" }, gap: { type: "unit", value: 32, unit: "px" } }, children: [
          { component: "Box", styles: { ...center, ...flex("column", 12, "center", "center") }, children: [
            { component: "Image", props: { src: { type: "string", value: "https://placehold.co/200x200/e5e7eb/9ca3af?text=Photo" }, alt: { type: "string", value: "Team member" } }, styles: { width: { type: "unit", value: 120, unit: "px" }, height: { type: "unit", value: 120, unit: "px" }, ...radius(999), objectFit: { type: "keyword", value: "cover" } } },
            { component: "Heading", text: "Jane Smith", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(18), ...bold } },
            { component: "Text", text: "CEO & Founder", styles: { ...fontSize(14), ...color(107, 114, 128) } },
          ]},
          { component: "Box", styles: { ...center, ...flex("column", 12, "center", "center") }, children: [
            { component: "Image", props: { src: { type: "string", value: "https://placehold.co/200x200/e5e7eb/9ca3af?text=Photo" }, alt: { type: "string", value: "Team member" } }, styles: { width: { type: "unit", value: 120, unit: "px" }, height: { type: "unit", value: 120, unit: "px" }, ...radius(999), objectFit: { type: "keyword", value: "cover" } } },
            { component: "Heading", text: "John Doe", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(18), ...bold } },
            { component: "Text", text: "CTO", styles: { ...fontSize(14), ...color(107, 114, 128) } },
          ]},
          { component: "Box", styles: { ...center, ...flex("column", 12, "center", "center") }, children: [
            { component: "Image", props: { src: { type: "string", value: "https://placehold.co/200x200/e5e7eb/9ca3af?text=Photo" }, alt: { type: "string", value: "Team member" } }, styles: { width: { type: "unit", value: 120, unit: "px" }, height: { type: "unit", value: 120, unit: "px" }, ...radius(999), objectFit: { type: "keyword", value: "cover" } } },
            { component: "Heading", text: "Sarah Lee", props: { level: { type: "number", value: 3 } }, styles: { ...fontSize(18), ...bold } },
            { component: "Text", text: "Head of Design", styles: { ...fontSize(14), ...color(107, 114, 128) } },
          ]},
        ]},
      ]},
    ],
  }),

  template("gallery-section", "Gallery Grid", "sections", "Image gallery in a grid", {
    component: "Box", tag: "section", label: "Gallery",
    styles: { ...pad(64) },
    children: [
      { component: "Container", children: [
        { component: "Box", styles: { ...center, marginBottom: { type: "unit", value: 40, unit: "px" } }, children: [
          { component: "Heading", text: "Gallery", props: { level: { type: "number", value: 2 } }, styles: { ...fontSize(36), ...bold } },
        ]},
        { component: "Box", styles: { display: { type: "keyword", value: "grid" }, gridTemplateColumns: { type: "unparsed", value: "repeat(3, 1fr)" }, gap: { type: "unit", value: 16, unit: "px" } }, children: [
          { component: "Image", props: { src: { type: "string", value: "https://placehold.co/400x300/e5e7eb/9ca3af?text=1" }, alt: { type: "string", value: "Gallery 1" } }, styles: { width: { type: "unit", value: 100, unit: "%" }, ...radius(8), aspectRatio: { type: "unparsed", value: "4/3" }, objectFit: { type: "keyword", value: "cover" } } },
          { component: "Image", props: { src: { type: "string", value: "https://placehold.co/400x300/e5e7eb/9ca3af?text=2" }, alt: { type: "string", value: "Gallery 2" } }, styles: { width: { type: "unit", value: 100, unit: "%" }, ...radius(8), aspectRatio: { type: "unparsed", value: "4/3" }, objectFit: { type: "keyword", value: "cover" } } },
          { component: "Image", props: { src: { type: "string", value: "https://placehold.co/400x300/e5e7eb/9ca3af?text=3" }, alt: { type: "string", value: "Gallery 3" } }, styles: { width: { type: "unit", value: 100, unit: "%" }, ...radius(8), aspectRatio: { type: "unparsed", value: "4/3" }, objectFit: { type: "keyword", value: "cover" } } },
          { component: "Image", props: { src: { type: "string", value: "https://placehold.co/400x300/e5e7eb/9ca3af?text=4" }, alt: { type: "string", value: "Gallery 4" } }, styles: { width: { type: "unit", value: 100, unit: "%" }, ...radius(8), aspectRatio: { type: "unparsed", value: "4/3" }, objectFit: { type: "keyword", value: "cover" } } },
          { component: "Image", props: { src: { type: "string", value: "https://placehold.co/400x300/e5e7eb/9ca3af?text=5" }, alt: { type: "string", value: "Gallery 5" } }, styles: { width: { type: "unit", value: 100, unit: "%" }, ...radius(8), aspectRatio: { type: "unparsed", value: "4/3" }, objectFit: { type: "keyword", value: "cover" } } },
          { component: "Image", props: { src: { type: "string", value: "https://placehold.co/400x300/e5e7eb/9ca3af?text=6" }, alt: { type: "string", value: "Gallery 6" } }, styles: { width: { type: "unit", value: 100, unit: "%" }, ...radius(8), aspectRatio: { type: "unparsed", value: "4/3" }, objectFit: { type: "keyword", value: "cover" } } },
        ]},
      ]},
    ],
  }),
]
