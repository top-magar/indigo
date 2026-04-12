"use client"

import { useMemo } from "react"
import { useEditorStore, type Section } from "../../store"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Accessibility, ImageOff, Contrast, Heading, MousePointerClick, Link2, Code, Tag, Type, LayoutList, Languages } from "lucide-react"

function luminance(hex: string): number {
  const rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
  const [r, g, b] = rgb.map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1), l2 = luminance(hex2)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

interface Issue { icon: React.ReactNode; desc: string; sectionId: string; severity: "error" | "warning"; wcag?: string }

function auditDeep(sections: Section[], issues: Issue[], theme: Record<string, unknown>): void {
  const themeBg = (theme.backgroundColor as string) || "#ffffff"
  const themeText = (theme.textColor as string) || "#0f172a"
  const themePrimary = (theme.primaryColor as string) || "#000000"

  for (const s of sections) {
    const p = s.props

    // 1.1.1 — Image alt text (Level A)
    if (s.type === "image" && !p.alt) {
      issues.push({ icon: <ImageOff className="size-3.5" />, desc: "Image missing alt text", sectionId: s.id, severity: "error", wcag: "1.1.1" })
    }

    // 1.1.1 — Logo without alt
    if (s.type === "logo" && p.src && !p.alt) {
      issues.push({ icon: <ImageOff className="size-3.5" />, desc: "Logo missing alt text", sectionId: s.id, severity: "error", wcag: "1.1.1" })
    }

    // 1.4.3 — Contrast minimum (Level AA, 4.5:1 for normal text, 3:1 for large)
    const tc = (p._textColor as string) || (p.textColor as string)
    const bg = (p._backgroundColor as string) || (p.backgroundColor as string)
    if (tc?.startsWith("#") && bg?.startsWith("#")) {
      const ratio = contrastRatio(tc, bg)
      const fontSize = (p._fontSize as number) || 16
      const threshold = fontSize >= 24 ? 3 : 4.5
      if (ratio < threshold) {
        issues.push({ icon: <Contrast className="size-3.5" />, desc: `Low contrast ${ratio.toFixed(1)}:1 (need ${threshold}:1)`, sectionId: s.id, severity: "error", wcag: "1.4.3" })
      }
    }

    // 1.4.3 — Theme-level contrast check (primary on background)
    if (s.type === "button" && !bg) {
      const ratio = contrastRatio(themePrimary, themeBg)
      if (ratio < 3) {
        issues.push({ icon: <Contrast className="size-3.5" />, desc: `Button contrast ${ratio.toFixed(1)}:1 on theme bg`, sectionId: s.id, severity: "warning", wcag: "1.4.3" })
      }
    }

    // 2.4.2 — Page needs at least one heading
    // (checked at top level below)

    // 2.4.4 — Link purpose: generic link text
    if (s.type === "button" && p.href) {
      const text = (p.text as string || "").toLowerCase()
      if (["click here", "read more", "learn more", "here", "link"].includes(text)) {
        issues.push({ icon: <Link2 className="size-3.5" />, desc: `Generic link text "${p.text}"`, sectionId: s.id, severity: "warning", wcag: "2.4.4" })
      }
    }

    // 4.1.2 — Button without accessible name
    if (s.type === "button" && !p.text) {
      issues.push({ icon: <MousePointerClick className="size-3.5" />, desc: "Button without text", sectionId: s.id, severity: "error", wcag: "4.1.2" })
    }
    if (s.type === "iconButton" && !p.label) {
      issues.push({ icon: <MousePointerClick className="size-3.5" />, desc: "Icon button without label", sectionId: s.id, severity: "error", wcag: "4.1.2" })
    }

    // 1.3.1 — Semantic HTML: sections using div when semantic tag is better
    if (["hero", "header", "footer", "faq", "newsletter", "form"].includes(s.type) && !p._htmlTag) {
      issues.push({ icon: <Tag className="size-3.5" />, desc: `"${s.type}" uses <div> — consider semantic tag`, sectionId: s.id, severity: "warning", wcag: "1.3.1" })
    }

    // 1.4.4 — Text too small (< 12px)
    const fontSize = p._fontSize as number
    if (fontSize && fontSize < 12) {
      issues.push({ icon: <Type className="size-3.5" />, desc: `Font size ${fontSize}px is below 12px minimum`, sectionId: s.id, severity: "warning", wcag: "1.4.4" })
    }

    // Custom code — potential a11y concern
    if (s.type === "customCode" && (p.html as string)) {
      issues.push({ icon: <Code className="size-3.5" />, desc: "Custom HTML — verify accessibility", sectionId: s.id, severity: "warning" })
    }

    // Video without captions field
    if (s.type === "video" && !p.captionUrl) {
      issues.push({ icon: <Languages className="size-3.5" />, desc: "Video without captions", sectionId: s.id, severity: "warning", wcag: "1.2.2" })
    }

    // Recurse into children
    if (s.children) {
      for (const slot of Object.values(s.children)) auditDeep(slot, issues, theme)
    }
  }
}

function audit(sections: Section[], theme: Record<string, unknown>): Issue[] {
  const issues: Issue[] = []
  auditDeep(sections, issues, theme)

  // 1.3.1 — Heading hierarchy
  const allSections: Section[] = []
  const collect = (ss: Section[]) => { for (const s of ss) { allSections.push(s); if (s.children) for (const slot of Object.values(s.children)) collect(slot) } }
  collect(sections)

  const headingLevels = allSections
    .filter((s) => s.type === "headingBlock" || s.type === "text")
    .map((s) => ({ id: s.id, level: (s.props.level as string) || (s.props.tagName as string) || "p" }))
    .filter((h) => h.level.startsWith("h"))
    .map((h) => ({ ...h, num: parseInt(h.level.slice(1)) }))

  // No h1 at all
  if (headingLevels.length > 0 && !headingLevels.some((h) => h.num === 1)) {
    const first = headingLevels[0]
    issues.push({ icon: <Heading className="size-3.5" />, desc: "Page has no H1 heading", sectionId: first.id, severity: "error", wcag: "1.3.1" })
  }

  // Skipped heading levels (h1 → h3, missing h2)
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i].num > headingLevels[i - 1].num + 1) {
      issues.push({ icon: <Heading className="size-3.5" />, desc: `Heading jumps from H${headingLevels[i - 1].num} to H${headingLevels[i].num}`, sectionId: headingLevels[i].id, severity: "warning", wcag: "1.3.1" })
    }
  }

  // No landmarks — check if header/footer exist
  const hasHeader = sections.some((s) => s.type === "header" || s.type === "headerContainer")
  const hasFooter = sections.some((s) => s.type === "footer" || s.type === "footerContainer")
  if (!hasHeader) {
    issues.push({ icon: <LayoutList className="size-3.5" />, desc: "Page has no header landmark", sectionId: sections[0]?.id || "", severity: "warning", wcag: "1.3.1" })
  }
  if (!hasFooter && sections.length > 0) {
    issues.push({ icon: <LayoutList className="size-3.5" />, desc: "Page has no footer landmark", sectionId: sections[sections.length - 1]?.id || "", severity: "warning", wcag: "1.3.1" })
  }

  return issues
}

export function A11yPanel() {
  const sections = useEditorStore(s => s.sections)
  const theme = useEditorStore(s => s.theme)
  const selectSection = useEditorStore(s => s.selectSection)

  const issues = useMemo(() => audit(sections, theme), [sections, theme])
  const errors = issues.filter((i) => i.severity === "error")
  const warnings = issues.filter((i) => i.severity === "warning")
  const score = Math.max(0, Math.round(100 - errors.length * 15 - warnings.length * 5))
  const color = score >= 90 ? "text-green-400" : score >= 70 ? "text-yellow-400" : "text-red-400"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 relative">
          <Accessibility className="h-3.5 w-3.5" />
          {errors.length > 0 && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold">WCAG AA Audit</span>
          <div className="flex items-center gap-2">
            {errors.length > 0 && <span className="text-[10px] text-red-400">{errors.length} error{errors.length !== 1 ? "s" : ""}</span>}
            {warnings.length > 0 && <span className="text-[10px] text-yellow-400">{warnings.length} warning{warnings.length !== 1 ? "s" : ""}</span>}
            <span className={`text-sm font-bold ${color}`}>{score}</span>
          </div>
        </div>
        {issues.length === 0 ? (
          <p className="text-xs text-green-400">All checks passed ✓</p>
        ) : (
          <ul className="flex flex-col gap-1.5 max-h-56 overflow-y-auto" role="list">
            {issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className={`shrink-0 mt-0.5 ${issue.severity === "error" ? "text-red-400" : "text-yellow-400"}`}>{issue.icon}</span>
                <span className="flex-1">
                  {issue.desc}
                  {issue.wcag && <span className="text-[9px] text-muted-foreground ml-1">({issue.wcag})</span>}
                </span>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 shrink-0" onClick={() => selectSection(issue.sectionId)}>Fix</Button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
