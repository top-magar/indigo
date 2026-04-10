"use client"

import { useEditorStore } from "../store"
import { Button } from "@/components/ui/button"
import { Download, Copy, FileCode } from "lucide-react"

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement("a"), { href: url, download: name }).click()
  URL.revokeObjectURL(url)
}

export function exportAsJSON() {
  const { sections, theme } = useEditorStore.getState()
  download(new Blob([JSON.stringify({ sections, theme }, null, 2)], { type: "application/json" }), "page.json")
}

export function exportAsHTML() {
  const { sections } = useEditorStore.getState()
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${sections.map((s) => `<section data-type="${s.type}">${JSON.stringify(s.props)}</section>`).join("")}</body></html>`
  download(new Blob([html], { type: "text/html" }), "page.html")
}

export function ExportPanel() {
  const sections = useEditorStore((s) => s.sections)
  const theme = useEditorStore((s) => s.theme)

  const copyJSON = () => navigator.clipboard.writeText(JSON.stringify({ sections, theme }, null, 2))

  return (
    <div className="p-3 space-y-2">
      <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={exportAsHTML}><FileCode className="h-3.5 w-3.5" />Export as HTML</Button>
      <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={exportAsJSON}><Download className="h-3.5 w-3.5" />Export as JSON</Button>
      <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={copyJSON}><Copy className="h-3.5 w-3.5" />Copy JSON</Button>
    </div>
  )
}
