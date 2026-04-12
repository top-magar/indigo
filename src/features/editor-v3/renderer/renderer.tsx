import React from "react"
import type { InstanceId, StyleValue, Prop } from "../types"
import { useEditorV3Store } from "../stores/store"
import { buildPropsIndex, buildResolvedStyles } from "../stores/indexes"
import { getComponent } from "../registry/registry"

/** Convert typed StyleValue to CSS string */
function styleValueToCSS(v: StyleValue): string {
  switch (v.type) {
    case "unit": return `${v.value}${v.unit}`
    case "keyword": return v.value
    case "rgb": return `rgba(${v.r},${v.g},${v.b},${v.a})`
    case "unparsed": return v.value
    case "var": return v.fallback ? `var(${v.value}, ${styleValueToCSS(v.fallback)})` : `var(${v.value})`
  }
}

/** Convert resolved styles map to React CSSProperties */
function toReactStyle(styles: Record<string, StyleValue> | undefined): React.CSSProperties | undefined {
  if (!styles) return undefined
  const css: Record<string, string> = {}
  for (const [prop, val] of Object.entries(styles)) {
    css[prop] = styleValueToCSS(val)
  }
  return css as React.CSSProperties
}

/** Convert Prop[] to a plain props object */
function resolveProps(props: Prop[] | undefined): Record<string, unknown> {
  if (!props) return {}
  const out: Record<string, unknown> = {}
  for (const p of props) out[p.name] = p.value
  return out
}

function RenderInstance({ instanceId }: { instanceId: InstanceId }) {
  const instance = useEditorV3Store((s) => s.instances.get(instanceId))
  const propsIndex = useEditorV3Store(buildPropsIndex)
  const breakpointId = useEditorV3Store((s) => s.currentBreakpointId)
  const stylesIndex = useEditorV3Store((s) => buildResolvedStyles(s, breakpointId))

  if (!instance) return null

  const Component = getComponent(instance.component)
  if (!Component) return <div data-unknown={instance.component} />

  const props = resolveProps(propsIndex.get(instanceId))
  const style = toReactStyle(stylesIndex.get(instanceId))

  const children = instance.children.map((child, i) => {
    if (child.type === "id") return <RenderInstance key={child.value} instanceId={child.value} />
    if (child.type === "text") return <React.Fragment key={i}>{child.value}</React.Fragment>
    return null
  })

  return <Component {...props} style={style}>{children.length > 0 ? children : undefined}</Component>
}

export function Renderer({ rootInstanceId }: { rootInstanceId: InstanceId }) {
  return <RenderInstance instanceId={rootInstanceId} />
}
