import { generateId } from "./id"
import type { Instance, Prop, StyleSource, StyleSourceSelection, StyleDeclaration, InstanceId } from "./types"

interface ImportResult {
  instances: Map<string, Instance>
  props: Map<string, Prop>
  styleSources: Map<string, StyleSource>
  styleSourceSelections: Map<string, StyleSourceSelection>
  styleDeclarations: Map<string, StyleDeclaration>
  rootId: InstanceId
}

/** Strip dangerous URI protocols */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:text/html") || trimmed.startsWith("vbscript:")) return ""
  return url
}

const TAG_TO_COMPONENT: Record<string, string> = {
  div: "Box", section: "Box", article: "Box", main: "Box", aside: "Box", nav: "Box", footer: "Box", header: "Box",
  p: "Text", span: "Text", label: "Text",
  h1: "Heading", h2: "Heading", h3: "Heading", h4: "Heading", h5: "Heading", h6: "Heading",
  img: "Image", a: "Link", button: "Button", ul: "List", ol: "List",
  form: "Form", input: "Input", textarea: "Input",
}

const HEADING_LEVELS: Record<string, number> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }

function cssToStyleDeclarations(cssText: string, ssId: string, bpId: string): Map<string, StyleDeclaration> {
  const decls = new Map<string, StyleDeclaration>()
  if (!cssText) return decls
  const el = document.createElement("div")
  el.style.cssText = cssText
  for (let i = 0; i < el.style.length; i++) {
    const prop = el.style[i]
    const val = el.style.getPropertyValue(prop)
    if (!val) continue
    // Convert kebab-case to camelCase
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    const key = `${ssId}:${bpId}:${camel}:`
    decls.set(key, { styleSourceId: ssId, breakpointId: bpId, property: camel, value: { type: "unparsed", value: val } })
  }
  return decls
}

function processNode(node: Node, bpId: string, result: ImportResult): Instance["children"][number] | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim()
    if (!text) return null
    return { type: "text" as const, value: text }
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()
  const component = TAG_TO_COMPONENT[tag] ?? "Box"
  const id = generateId()

  const children: Instance["children"] = []
  for (const child of el.childNodes) {
    const c = processNode(child, bpId, result)
    if (c) children.push(c)
  }

  const instance: Instance = { id, component, children }
  if (tag === "section" || tag === "article" || tag === "nav" || tag === "aside" || tag === "header" || tag === "footer") {
    instance.tag = tag
  }
  result.instances.set(id, instance)

  // Props
  if (component === "Image") {
    const src = el.getAttribute("src")
    const alt = el.getAttribute("alt")
    if (src) { const pid = generateId(); result.props.set(pid, { id: pid, instanceId: id, name: "src", type: "string", value: sanitizeUrl(src) }) }
    if (alt) { const pid = generateId(); result.props.set(pid, { id: pid, instanceId: id, name: "alt", type: "string", value: alt }) }
  }
  if (component === "Link") {
    const href = el.getAttribute("href")
    if (href) { const pid = generateId(); result.props.set(pid, { id: pid, instanceId: id, name: "href", type: "string", value: sanitizeUrl(href) }) }
  }
  if (component === "Heading" && HEADING_LEVELS[tag]) {
    const pid = generateId()
    result.props.set(pid, { id: pid, instanceId: id, name: "level", type: "number", value: HEADING_LEVELS[tag] })
  }
  if (component === "Input") {
    const placeholder = el.getAttribute("placeholder")
    const type = el.getAttribute("type")
    if (placeholder) { const pid = generateId(); result.props.set(pid, { id: pid, instanceId: id, name: "placeholder", type: "string", value: placeholder }) }
    if (type) { const pid = generateId(); result.props.set(pid, { id: pid, instanceId: id, name: "type", type: "string", value: type }) }
  }

  // Inline styles
  const cssText = el.getAttribute("style")
  if (cssText) {
    const ssId = generateId()
    result.styleSources.set(ssId, { id: ssId, type: "local" })
    result.styleSourceSelections.set(id, { instanceId: id, values: [ssId] })
    const decls = cssToStyleDeclarations(cssText, ssId, bpId)
    for (const [k, v] of decls) result.styleDeclarations.set(k, v)
  }

  return { type: "id" as const, value: id }
}

export function importHTML(html: string, breakpointId: string): ImportResult {
  const result: ImportResult = {
    instances: new Map(),
    props: new Map(),
    styleSources: new Map(),
    styleSourceSelections: new Map(),
    styleDeclarations: new Map(),
    rootId: "",
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const body = doc.body

  // If body has a single child, use it as root; otherwise wrap in a Box
  const childNodes = [...body.childNodes].filter((n) =>
    n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
  )

  if (childNodes.length === 1 && childNodes[0].nodeType === Node.ELEMENT_NODE) {
    const child = processNode(childNodes[0], breakpointId, result)
    if (child?.type === "id") result.rootId = child.value
  } else {
    // Wrap in a Box
    const wrapperId = generateId()
    const children: Instance["children"] = []
    for (const node of childNodes) {
      const c = processNode(node, breakpointId, result)
      if (c) children.push(c)
    }
    result.instances.set(wrapperId, { id: wrapperId, component: "Box", children })
    result.rootId = wrapperId
  }

  return result
}
