"use client"
import { useRef, useState, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import type { InstanceId, StyleValue } from "../../types"
import { useEditorV3Store } from "../../stores/store"
import { getComponent, getMeta } from "../../registry/registry"

function styleValueToCSS(v: StyleValue): string {
  switch (v.type) {
    case "unit": return `${v.value}${v.unit}`
    case "keyword": return v.value
    case "rgb": return `rgba(${v.r},${v.g},${v.b},${v.a})`
    case "unparsed": return v.value
    case "var": return v.fallback ? `var(${v.value}, ${styleValueToCSS(v.fallback)})` : `var(${v.value})`
  }
}

/** Lightweight read-only renderer for preview — no selection/hover/drag */
function PreviewInstance({ instanceId, breakpointId }: { instanceId: InstanceId; breakpointId: string }) {
  const s = useEditorV3Store.getState()
  const instance = s.instances.get(instanceId)
  if (!instance) return null
  const Component = getComponent(instance.component)
  if (!Component) return null

  const props: Record<string, unknown> = {}
  for (const p of s.props.values()) { if (p.instanceId === instanceId) props[p.name] = p.value }

  // Cascade styles: apply from largest breakpoint down to current
  const bpOrder = ["bp-large", "bp-laptop", "bp-base", "bp-tablet", "bp-mobile-land", "bp-mobile"]
  const bpIdx = bpOrder.indexOf(breakpointId)
  const applicableBps = bpOrder.slice(0, bpIdx + 1)

  const selection = s.styleSourceSelections.get(instanceId)
  let style: React.CSSProperties | undefined
  if (selection) {
    const css: Record<string, string> = {}
    for (const ssId of selection.values) {
      for (const decl of s.styleDeclarations.values()) {
        if (decl.styleSourceId === ssId && applicableBps.includes(decl.breakpointId) && !decl.state) {
          css[decl.property] = styleValueToCSS(decl.value)
        }
      }
    }
    // Apply in order: larger breakpoints first, smaller override
    if (Object.keys(css).length > 0) style = css as React.CSSProperties
  }

  const children = instance.children.map((child, i) => {
    if (child.type === "id") return <PreviewInstance key={child.value} instanceId={child.value} breakpointId={breakpointId} />
    if (child.type === "text") return <span key={i}>{child.value}</span>
    return null
  })

  return <Component {...props} style={style}>{children.length > 0 ? children : undefined}</Component>
}

const SRCDOC = `<!DOCTYPE html><html><head><style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif}</style></head><body><div id="root"></div></body></html>`

function PreviewFrame({ width, label, rootId, breakpointId }: { width: number; label: string; rootId: string; breakpointId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [root, setRoot] = useState<HTMLElement | null>(null)

  const handleLoad = useCallback(() => {
    const el = iframeRef.current?.contentDocument?.getElementById("root")
    if (el) setRoot(el)
  }, [])

  const scale = Math.min(1, 320 / width)

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="text-[10px] text-muted-foreground font-medium">{label} — {width}px</div>
      <div style={{ width: width * scale, height: 500 * scale, overflow: "hidden", borderRadius: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)" }}>
        <iframe ref={iframeRef} srcDoc={SRCDOC} onLoad={handleLoad}
          style={{ width, height: 500, transform: `scale(${scale})`, transformOrigin: "top left", border: "none", background: "#fff" }} />
      </div>
      {root && createPortal(<PreviewInstance instanceId={rootId} breakpointId={breakpointId} />, root)}
    </div>
  )
}

export function ResponsivePreview() {
  const s = useEditorV3Store.getState()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  if (!page) return null

  return (
    <div className="flex-1 overflow-auto p-6 flex items-start justify-center gap-6" style={{
      background: "#f8f9fa",
      backgroundImage: "radial-gradient(circle, #e5e7eb 0.5px, transparent 0.5px)",
      backgroundSize: "16px 16px",
    }}>
      <PreviewFrame width={1280} label="Desktop" rootId={page.rootInstanceId} breakpointId="bp-base" />
      <PreviewFrame width={768} label="Tablet" rootId={page.rootInstanceId} breakpointId="bp-tablet" />
      <PreviewFrame width={375} label="Mobile" rootId={page.rootInstanceId} breakpointId="bp-mobile" />
    </div>
  )
}
