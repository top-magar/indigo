import type { Instance, InstanceId, Prop, StyleDeclaration, StyleValue, StyleSourceSelection } from "./types"
import { getStyleDeclKey } from "./types"

/** Escape HTML special characters to prevent XSS in published output */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

/** Sanitize CSS values to prevent style tag breakout */
function escCSS(s: string): string {
  return s.replace(/<\//g, "<\\/").replace(/expression\s*\(/gi, "").replace(/javascript\s*:/gi, "")
}

interface PublishData {
  instances: Map<InstanceId, Instance>
  props: Map<string, Prop>
  styleSources: Map<string, { id: string; type: string }>
  styleSourceSelections: Map<InstanceId, StyleSourceSelection>
  styleDeclarations: Map<string, StyleDeclaration>
  breakpoints: Map<string, { id: string; label: string; minWidth?: number }>
  breakpointId: string
}

const tagMap: Record<string, string> = {
  Box: "div", Text: "span", Heading: "h2", Image: "img", Link: "a",
  Button: "button", Slot: "div", List: "ul", Form: "form", Input: "input",
  CodeBlock: "div", Container: "div", Section: "section",
  Navbar: "header",
  Paragraph: "p", Video: "video", Label: "label", Textarea: "textarea",
  Checkbox: "input", Radio: "input", SelectField: "select", Separator: "hr",
}

function styleValueToCSS(v: StyleValue): string {
  switch (v.type) {
    case "unit": return `${v.value}${v.unit}`
    case "keyword": return v.value
    case "rgb": return `rgba(${v.r},${v.g},${v.b},${v.a})`
    case "unparsed": return escCSS(v.value)
    case "var": return v.fallback ? `var(${v.value}, ${styleValueToCSS(v.fallback)})` : `var(${v.value})`
  }
}

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

function getInstanceProps(data: PublishData, instanceId: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const p of data.props.values()) {
    if (p.instanceId === instanceId) out[p.name] = p.value
  }
  return out
}

function getInstanceCSS(data: PublishData, instanceId: string): string {
  const sel = data.styleSourceSelections.get(instanceId)
  if (!sel) return ""
  const decls: string[] = []
  for (const ssId of sel.values) {
    for (const d of data.styleDeclarations.values()) {
      if (d.styleSourceId === ssId && d.breakpointId === data.breakpointId && !d.state) {
        decls.push(`${camelToKebab(d.property)}: ${styleValueToCSS(d.value)};`)
      }
    }
  }
  return decls.join(" ")
}

/** Collect ALL base styles as [data-ws-id] CSS rules */
function collectBaseCSS(data: PublishData): string {
  const rules: string[] = []
  for (const [instanceId, sel] of data.styleSourceSelections) {
    const decls: string[] = []
    for (const ssId of sel.values) {
      for (const d of data.styleDeclarations.values()) {
        if (d.styleSourceId === ssId && d.breakpointId === data.breakpointId && !d.state) {
          decls.push(`  ${camelToKebab(d.property)}: ${styleValueToCSS(d.value)};`)
        }
      }
    }
    if (decls.length > 0) {
      rules.push(`    [data-ws-id="${instanceId}"] {\n${decls.map(d => `    ${d}`).join("\n")}\n    }`)
    }
  }
  return rules.join("\n")
}

/** Collect all state-based CSS rules (hover/focus/active) for all instances */
function collectStateCSSRules(data: PublishData): string {
  const rules: string[] = []
  for (const [instanceId, sel] of data.styleSourceSelections) {
    const stateDecls = new Map<string, string[]>()
    for (const ssId of sel.values) {
      for (const d of data.styleDeclarations.values()) {
        if (d.styleSourceId === ssId && d.breakpointId === data.breakpointId && d.state) {
          const arr = stateDecls.get(d.state) ?? []
          arr.push(`${camelToKebab(d.property)}: ${styleValueToCSS(d.value)};`)
          stateDecls.set(d.state, arr)
        }
      }
    }
    for (const [state, decls] of stateDecls) {
      rules.push(`    [data-ws-id="${instanceId}"]:${state} { ${decls.join(" ")} }`)
    }
  }
  return rules.join("\n")
}

/** Generate @media blocks for responsive breakpoints (tablet, mobile) */
function collectResponsiveCSS(data: PublishData): string {
  // Get non-base breakpoints sorted by minWidth descending (desktop-first: max-width)
  const responsiveBps = [...data.breakpoints.values()]
    .filter((bp) => bp.minWidth != null && bp.id !== data.breakpointId)
    .sort((a, b) => (b.minWidth ?? 0) - (a.minWidth ?? 0))

  if (responsiveBps.length === 0) return ""

  const blocks: string[] = []
  for (const bp of responsiveBps) {
    const rules: string[] = []
    for (const [instanceId, sel] of data.styleSourceSelections) {
      const decls: string[] = []
      for (const ssId of sel.values) {
        for (const d of data.styleDeclarations.values()) {
          if (d.styleSourceId === ssId && d.breakpointId === bp.id && !d.state) {
            decls.push(`${camelToKebab(d.property)}: ${styleValueToCSS(d.value)};`)
          }
        }
      }
      if (decls.length > 0) {
        rules.push(`      [data-ws-id="${instanceId}"] { ${decls.join(" ")} }`)
      }
      // State styles within this breakpoint
      const stateDecls = new Map<string, string[]>()
      for (const ssId of sel.values) {
        for (const d of data.styleDeclarations.values()) {
          if (d.styleSourceId === ssId && d.breakpointId === bp.id && d.state) {
            const arr = stateDecls.get(d.state) ?? []
            arr.push(`${camelToKebab(d.property)}: ${styleValueToCSS(d.value)};`)
            stateDecls.set(d.state, arr)
          }
        }
      }
      for (const [state, sDecls] of stateDecls) {
        rules.push(`      [data-ws-id="${instanceId}"]:${state} { ${sDecls.join(" ")} }`)
      }
    }
    if (rules.length > 0) {
      blocks.push(`    @media (max-width: ${bp.minWidth! - 1}px) {\n${rules.join("\n")}\n    }`)
    }
  }
  return blocks.join("\n")
}

function renderInstance(data: PublishData, instanceId: string, indent: number): string {
  const inst = data.instances.get(instanceId)
  if (!inst) return ""

  const props = getInstanceProps(data, instanceId)
  const pad = "  ".repeat(indent)

  // Determine tag
  let tag = inst.tag ?? tagMap[inst.component] ?? "div"
  if (inst.component === "Heading") tag = `h${props.level ?? 2}`
  if (inst.component === "List" && props.ordered) tag = "ol"

  // Build attributes
  const attrs: string[] = []
  attrs.push(`data-ws-id="${instanceId}"`)
  if (props.htmlId) attrs.push(`id="${esc(String(props.htmlId))}"`)
  if (props.htmlClass) attrs.push(`class="${esc(String(props.htmlClass))}"`)
  if (props.ariaLabel) attrs.push(`aria-label="${esc(String(props.ariaLabel))}"`)
  if (props.role) attrs.push(`role="${esc(String(props.role))}"`)
  if (props.dataAttr) {
    for (const pair of String(props.dataAttr).split(",")) {
      const [k, v] = pair.split("=").map((s) => s.trim())
      if (k && v) attrs.push(`data-${esc(k)}="${esc(v)}"`)
    }
  }
  if (inst.component === "Link" && props.href) attrs.push(`href="${esc(String(props.href))}"`)
  if (inst.component === "Link" && props.target) attrs.push(`target="${esc(String(props.target))}"`)
  if (inst.component === "Image") { attrs.push(`src="${esc(String(props.src ?? ""))}"`, `alt="${esc(String(props.alt ?? ""))}"`) }
  if (inst.component === "Input") { attrs.push(`type="${esc(String(props.type ?? "text"))}"`, `name="${esc(String(props.name ?? ""))}"`, `placeholder="${esc(String(props.placeholder ?? ""))}"`) }
  if (inst.component === "Video") { if (props.src) attrs.push(`src="${esc(String(props.src))}"`); if (props.poster) attrs.push(`poster="${esc(String(props.poster))}"`); if (props.autoplay) attrs.push("autoplay"); if (props.loop) attrs.push("loop"); if (props.muted) attrs.push("muted"); if (props.controls !== false) attrs.push("controls") }
  if (inst.component === "Textarea") { attrs.push(`name="${esc(String(props.name ?? ""))}"`, `placeholder="${esc(String(props.placeholder ?? ""))}"`, `rows="${esc(String(props.rows ?? 4))}"`) }
  if (inst.component === "Checkbox") { attrs.push(`type="checkbox"`, `name="${esc(String(props.name ?? ""))}"`, `value="${esc(String(props.value ?? ""))}"`) }
  if (inst.component === "Radio") { attrs.push(`type="radio"`, `name="${esc(String(props.name ?? ""))}"`, `value="${esc(String(props.value ?? ""))}"`) }
  if (inst.component === "SelectField") { if (props.name) attrs.push(`name="${esc(String(props.name))}"`) }
  if (inst.component === "Label") { if (props.htmlFor) attrs.push(`for="${esc(String(props.htmlFor))}"`) }
  if (inst.component === "Button" && props.type) attrs.push(`type="${esc(String(props.type))}"`)
  if (inst.component === "Form") { if (props.action) attrs.push(`action="${esc(String(props.action))}"`); if (props.method) attrs.push(`method="${esc(String(props.method))}"`) }

  const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : ""

  // Self-closing tags
  if (tag === "img" || tag === "input" || tag === "hr") return `${pad}<${tag}${attrStr} />`

  // CodeBlock: render as iframe with srcdoc
  if (inst.component === "CodeBlock") {
    const html = String(props.html ?? "")
    const cssProp = String(props.css ?? "")
    const js = String(props.js ?? "")
    const srcdoc = `<!DOCTYPE html><html><head><style>${cssProp}</style></head><body>${html}<script>${js}<\/script></body></html>`
    return `${pad}<iframe data-ws-id="${instanceId}" srcdoc="${srcdoc.replace(/"/g, "&quot;")}" sandbox="allow-scripts" frameborder="0" width="100%"></iframe>`
  }

  // Children
  const childrenHTML = inst.children.map((child) => {
    if (child.type === "text") return `${pad}  ${esc(child.value)}`
    if (child.type === "id") return renderInstance(data, child.value, indent + 1)
    return ""
  }).filter(Boolean).join("\n")

  if (!childrenHTML) return `${pad}<${tag}${attrStr}></${tag}>`
  return `${pad}<${tag}${attrStr}>\n${childrenHTML}\n${pad}</${tag}>`
}

const SYSTEM_FONTS = new Set([
  "arial", "helvetica", "georgia", "times new roman", "courier new",
  "verdana", "trebuchet ms", "system-ui", "sans-serif", "serif", "monospace",
])

function extractGoogleFontLinks(data: PublishData): string {
  const fonts = new Set<string>()
  for (const decl of data.styleDeclarations.values()) {
    if (decl.property === "fontFamily" && decl.value.type === "keyword") {
      const primary = decl.value.value.split(",")[0].trim().replace(/['"]/g, "")
      if (primary && !SYSTEM_FONTS.has(primary.toLowerCase())) fonts.add(primary)
    }
  }
  if (fonts.size === 0) return ""
  return Array.from(fonts).map((f) =>
    `  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@300;400;500;600;700&display=swap" />`
  ).join("\n")
}

/** Generate a complete HTML document from the instance tree */
/** Sanitize user-injected code — allow analytics/tracking scripts but strip dangerous patterns */
function sanitizeInjectedCode(code: string): string {
  if (!code) return ""
  // Strip event handlers that could be injected
  return code
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript\s*:/gi, "")
}

export function generateHTML(data: PublishData, rootInstanceId: string, title = "My Store", meta?: { description?: string; ogImage?: string; headCode?: string; bodyCode?: string }): string {
  const body = renderInstance(data, rootInstanceId, 2)
  const fontLinks = extractGoogleFontLinks(data)
  const baseCSS = collectBaseCSS(data)
  const stateCSS = collectStateCSSRules(data)
  const responsiveCSS = collectResponsiveCSS(data)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
${meta?.description ? `  <meta name="description" content="${esc(meta.description)}" />\n` : ""}${meta?.ogImage ? `  <meta property="og:image" content="${esc(meta.ogImage)}" />\n` : ""}${title !== "My Store" ? `  <meta property="og:title" content="${esc(title)}" />\n` : ""}${fontLinks ? fontLinks + "\n" : ""}  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #0f172a; }
    a { color: inherit; text-decoration: none; }
    button { cursor: pointer; font: inherit; }
    img { max-width: 100%; height: auto; }
${baseCSS ? baseCSS + "\n" : ""}${stateCSS ? stateCSS + "\n" : ""}${responsiveCSS ? responsiveCSS + "\n" : ""}  </style>
${sanitizeInjectedCode(meta?.headCode ?? "")}</head>
<body>
${body}
${sanitizeInjectedCode(meta?.bodyCode ?? "")}</body>
</html>`
}

/** Convenience: generate HTML from the store state */
export function publishFromStore(store: StoreData): string | null {
  const page = store.currentPageId ? store.pages.get(store.currentPageId) : undefined
  if (!page) return null
  return generateHTML(toPublishData(store), page.rootInstanceId, page.title ?? page.name, { description: page.description, ogImage: page.ogImage, headCode: (page as Record<string, string>).headCode, bodyCode: (page as Record<string, string>).bodyCode })
}

interface StoreData {
  instances: Map<InstanceId, Instance>
  props: Map<string, Prop>
  styleSources: Map<string, { id: string; type: string }>
  styleSourceSelections: Map<InstanceId, StyleSourceSelection>
  styleDeclarations: Map<string, StyleDeclaration>
  breakpoints: Map<string, { id: string; label: string; minWidth?: number }>
  pages: Map<string, { id: string; name: string; path: string; rootInstanceId: string; title?: string; description?: string; ogImage?: string }>
  currentPageId: string | null
}

function toPublishData(store: StoreData): PublishData {
  return {
    instances: store.instances,
    props: store.props,
    styleSources: store.styleSources,
    styleSourceSelections: store.styleSourceSelections,
    styleDeclarations: store.styleDeclarations,
    breakpoints: store.breakpoints,
    breakpointId: "bp-base",
  }
}

/** Find global sections — instances whose label starts with @ */
function findGlobalSections(store: StoreData): { headers: string[]; footers: string[] } {
  const headers: string[] = []
  const footers: string[] = []
  for (const inst of store.instances.values()) {
    if (!inst.label?.startsWith("@")) continue
    const lower = inst.label.toLowerCase()
    if (lower.includes("header") || lower.includes("nav")) headers.push(inst.id)
    else footers.push(inst.id)
  }
  return { headers, footers }
}

/** Generate HTML for all pages, returns Map<filePath, html> */
export function publishAllPages(store: StoreData): Map<string, string> {
  const data = toPublishData(store)
  const { headers, footers } = findGlobalSections(store)
  const result = new Map<string, string>()

  for (const page of store.pages.values()) {
    const globalHeaderHTML = headers
      .filter((id) => !isDescendantOf(store.instances, id, page.rootInstanceId))
      .map((id) => renderInstance(data, id, 2)).join("\n")
    const globalFooterHTML = footers
      .filter((id) => !isDescendantOf(store.instances, id, page.rootInstanceId))
      .map((id) => renderInstance(data, id, 2)).join("\n")

    const pageBody = renderInstance(data, page.rootInstanceId, 2)
    const body = [globalHeaderHTML, pageBody, globalFooterHTML].filter(Boolean).join("\n")
    const fontLinks = extractGoogleFontLinks(data)
    const baseCSS = collectBaseCSS(data)
    const stateCSS = collectStateCSSRules(data)
    const responsiveCSS = collectResponsiveCSS(data)

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(page.title ?? page.name)}</title>
${page.description ? `  <meta name="description" content="${esc(page.description)}" />\n` : ""}${page.ogImage ? `  <meta property="og:image" content="${esc(page.ogImage)}" />\n` : ""}${page.title ? `  <meta property="og:title" content="${esc(page.title)}" />\n` : ""}${fontLinks ? fontLinks + "\n" : ""}  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #0f172a; }
    a { color: inherit; text-decoration: none; }
    button { cursor: pointer; font: inherit; }
    img { max-width: 100%; height: auto; }
${baseCSS ? baseCSS + "\n" : ""}${stateCSS ? stateCSS + "\n" : ""}${responsiveCSS ? responsiveCSS + "\n" : ""}  </style>
</head>
<body>
${body}
</body>
</html>`

    const filePath = page.path === "/" ? "index.html" : `${page.path.replace(/^\//, "")}/index.html`
    result.set(filePath, html)
  }
  return result
}

/** Check if instanceId is a descendant of ancestorId */
function isDescendantOf(instances: Map<InstanceId, Instance>, instanceId: InstanceId, ancestorId: InstanceId): boolean {
  const ancestor = instances.get(ancestorId)
  if (!ancestor) return false
  for (const child of ancestor.children) {
    if (child.type === "id") {
      if (child.value === instanceId) return true
      if (isDescendantOf(instances, instanceId, child.value)) return true
    }
  }
  return false
}
