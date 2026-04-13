import type { Instance, StyleDeclaration, Prop, StyleSource, StyleSourceSelection } from "./types"
import { generateId } from "./id"

export interface TemplateNode {
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

/** Recursively build flat instances + props + styles from a template tree — exported for programmatic use */
export function buildTree(node: TemplateNode, parentId: string | null, position: number, breakpointId: string) {
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
  template("header", "Header", "navigation", "Logo + nav links + CTA button", {
    component: "Box", tag: "header", label: "Header",
    styles: {
      display: { type: "keyword", value: "flex" },
      flexDirection: { type: "keyword", value: "row" },
      alignItems: { type: "keyword", value: "center" },
      justifyContent: { type: "keyword", value: "space-between" },
      padding: { type: "unparsed", value: "16px 32px" },
      borderBottom: { type: "unparsed", value: "1px solid #e5e7eb" },
    },
    children: [
      { component: "Heading", label: "Logo", text: "Indigo", props: { level: { type: "number", value: 1 } }, styles: { fontSize: { type: "unit", value: 20, unit: "px" }, fontWeight: { type: "keyword", value: "700" } } },
      { component: "Box", tag: "nav", label: "Nav Links", styles: { display: { type: "keyword", value: "flex" }, gap: { type: "unit", value: 32, unit: "px" }, alignItems: { type: "keyword", value: "center" } }, children: [
        { component: "Link", text: "Home", props: { href: { type: "string", value: "/" } }, styles: { fontSize: { type: "unit", value: 14, unit: "px" }, color: { type: "rgb", r: 55, g: 65, b: 81, a: 1 } } },
        { component: "Link", text: "Products", props: { href: { type: "string", value: "/products" } }, styles: { fontSize: { type: "unit", value: 14, unit: "px" }, color: { type: "rgb", r: 55, g: 65, b: 81, a: 1 } } },
        { component: "Link", text: "About", props: { href: { type: "string", value: "/about" } }, styles: { fontSize: { type: "unit", value: 14, unit: "px" }, color: { type: "rgb", r: 55, g: 65, b: 81, a: 1 } } },
        { component: "Link", text: "Contact", props: { href: { type: "string", value: "/contact" } }, styles: { fontSize: { type: "unit", value: 14, unit: "px" }, color: { type: "rgb", r: 55, g: 65, b: 81, a: 1 } } },
      ]},
      { component: "Button", text: "Get Started", styles: {
        backgroundColor: { type: "rgb", r: 0, g: 0, b: 0, a: 1 },
        color: { type: "rgb", r: 255, g: 255, b: 255, a: 1 },
        padding: { type: "unparsed", value: "10px 24px" },
        borderRadius: { type: "unit", value: 8, unit: "px" },
        border: { type: "keyword", value: "none" },
        fontSize: { type: "unit", value: 14, unit: "px" },
        fontWeight: { type: "keyword", value: "500" },
      }},
    ],
  }),
]
