"use client"

import { useState } from "react"
import { useEditorStore } from "../store"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

const PROP_MAP: Record<string, string> = {
  paddingTop: "padding-top", paddingBottom: "padding-bottom", paddingLeft: "padding-left", paddingRight: "padding-right",
  marginTop: "margin-top", marginBottom: "margin-bottom", maxWidth: "max-width",
  backgroundColor: "background-color", textColor: "color", fontSize: "font-size",
  textAlign: "text-align", borderRadius: "border-radius", borderWidth: "border-width",
  borderColor: "border-color", opacity: "opacity", gap: "gap",
  flexDirection: "flex-direction", alignItems: "align-items", justifyContent: "justify-content",
}

const PX_PROPS = new Set(["padding-top", "padding-bottom", "padding-left", "padding-right", "margin-top", "margin-bottom", "max-width", "font-size", "border-radius", "border-width", "gap"])

function buildCSS(props: Record<string, unknown>): string {
  const lines: string[] = []
  for (const [key, val] of Object.entries(props)) {
    if (!key.startsWith("_") || val === undefined || val === "" || val === 0 || val === "none") continue
    const name = key.slice(1)
    const cssProp = PROP_MAP[name]
    if (!cssProp) continue
    const unit = PX_PROPS.has(cssProp) ? "px" : ""
    const v = cssProp === "opacity" ? `${(val as number) / 100}` : `${val}${unit}`
    lines.push(`  ${cssProp}: ${v};`)
  }
  return lines.length ? `.section {\n${lines.join("\n")}\n}` : "/* no styles */"
}

export function InspectPanel({ sectionId }: { sectionId: string }) {
  const [copied, setCopied] = useState(false)
  const props = useEditorStore((s) => s.sections.find((x) => x.id === sectionId)?.props ?? {})
  const css = buildCSS(props)

  const copy = () => { navigator.clipboard.writeText(css); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className="p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium">Computed CSS</span>
        <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={copy}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy CSS"}
        </Button>
      </div>
      <pre className="text-[11px] font-mono bg-muted/50 rounded-md p-3 overflow-auto whitespace-pre text-muted-foreground">{css}</pre>
    </div>
  )
}
