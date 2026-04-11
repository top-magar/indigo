"use client"

import { useEditorStore, type Section } from "../store"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Accessibility, ImageOff, Contrast, Heading, MousePointerClick } from "lucide-react"

function contrastRatio(hex1: string, hex2: string): number {
  const lum = (hex: string) => {
    const rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
    const [r, g, b] = rgb.map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const l1 = lum(hex1), l2 = lum(hex2)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

interface Issue { icon: React.ReactNode; desc: string; sectionId: string }

function audit(sections: Section[]): Issue[] {
  const issues: Issue[] = []
  const types: string[] = []
  for (const s of sections) {
    types.push(s.type)
    if (s.type === "image" && !s.props.alt) issues.push({ icon: <ImageOff className="size-3.5" />, desc: "Image missing alt text", sectionId: s.id })
    if (s.type === "button" && !s.props.text) issues.push({ icon: <MousePointerClick className="size-3.5" />, desc: "Button without text", sectionId: s.id })
    const tc = s.props.textColor as string | undefined, bg = s.props.backgroundColor as string | undefined
    if (tc?.startsWith("#") && bg?.startsWith("#") && contrastRatio(tc, bg) < 4.5)
      issues.push({ icon: <Contrast className="size-3.5" />, desc: `Low contrast (${contrastRatio(tc, bg).toFixed(1)}:1)`, sectionId: s.id })
  }
  const tags = sections.filter((s) => s.type === "text").map((s) => s.props.tagName as string)
  if (tags.includes("h2") && !tags.includes("h1")) issues.push({ icon: <Heading className="size-3.5" />, desc: "H2 without H1 — broken heading hierarchy", sectionId: sections.find((s) => s.props.tagName === "h2")!.id })
  return issues
}

export function A11yPanel() {
  const { sections, selectSection } = useEditorStore()
  const issues = audit(sections)
  const score = Math.max(0, Math.round(100 - issues.length * 15))
  const color = score >= 90 ? "text-green-400" : score >= 70 ? "text-yellow-400" : "text-red-400"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10">
          <Accessibility className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-72 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold">Accessibility Audit</span>
          <span className={`text-sm font-bold ${color}`}>{score}/100</span>
        </div>
        {issues.length === 0 ? (
          <p className="text-xs text-muted-foreground">No issues found ✓</p>
        ) : (
          <ul className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {issues.map((issue, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground shrink-0">{issue.icon}</span>
                <span className="flex-1 truncate">{issue.desc}</span>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => selectSection(issue.sectionId)}>Fix</Button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
