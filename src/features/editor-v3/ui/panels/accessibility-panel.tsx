"use client"
import { useMemo } from "react"
import { AlertTriangle, CheckCircle2, ImageIcon, Link2, FormInput, Type } from "lucide-react"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"
import type { InstanceId } from "../../types"

interface Issue {
  instanceId: InstanceId
  label: string
  severity: "error" | "warning"
  message: string
  icon: typeof AlertTriangle
}

function runChecks(s: ReturnType<typeof useStore>): Issue[] {
  const issues: Issue[] = []
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  if (!page) return issues

  for (const [id, inst] of s.instances) {
    const label = inst.label ?? inst.component

    // Image: missing alt text
    if (inst.component === "Image") {
      let hasAlt = false
      for (const p of s.props.values()) {
        if (p.instanceId === id && p.name === "alt" && p.value && String(p.value).trim()) hasAlt = true
      }
      if (!hasAlt) {
        issues.push({ instanceId: id, label, severity: "error", message: "Missing alt text", icon: ImageIcon })
      }
    }

    // Link: missing href or empty text
    if (inst.component === "Link") {
      let hasHref = false
      for (const p of s.props.values()) {
        if (p.instanceId === id && p.name === "href" && p.value && String(p.value).trim()) hasHref = true
      }
      if (!hasHref) {
        issues.push({ instanceId: id, label, severity: "error", message: "Missing href attribute", icon: Link2 })
      }
      const hasContent = inst.children.length > 0
      if (!hasContent) {
        issues.push({ instanceId: id, label, severity: "warning", message: "Empty link — no visible text", icon: Link2 })
      }
    }

    // Button: empty
    if (inst.component === "Button") {
      const hasText = inst.children.some((c) => c.type === "text" && c.value.trim())
      const hasChildren = inst.children.some((c) => c.type === "id")
      if (!hasText && !hasChildren) {
        issues.push({ instanceId: id, label, severity: "warning", message: "Empty button — no visible label", icon: Type })
      }
    }

    // Input: missing name
    if (inst.component === "Input") {
      let hasName = false
      for (const p of s.props.values()) {
        if (p.instanceId === id && p.name === "name" && p.value && String(p.value).trim()) hasName = true
      }
      if (!hasName) {
        issues.push({ instanceId: id, label, severity: "warning", message: "Missing name attribute", icon: FormInput })
      }
    }

    // Heading: empty
    if (inst.component === "Heading") {
      const hasText = inst.children.some((c) => c.type === "text" && c.value.trim())
      if (!hasText) {
        issues.push({ instanceId: id, label, severity: "warning", message: "Empty heading", icon: Type })
      }
    }
  }

  return issues
}

export function AccessibilityPanel() {
  const s = useStore()
  const issues = useMemo(() => runChecks(s), [s])

  const errors = issues.filter((i) => i.severity === "error")
  const warnings = issues.filter((i) => i.severity === "warning")

  return (
    <div className="p-2 space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 font-medium">Accessibility</div>

      {issues.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <CheckCircle2 className="size-8 text-green-500" />
          <div className="text-[11px] font-medium text-green-700">All checks passed</div>
          <div className="text-[9px] text-muted-foreground">No accessibility issues found</div>
        </div>
      ) : (
        <>
          <div className="flex gap-3 px-1">
            <div className="text-[10px]"><span className="font-bold text-red-600">{errors.length}</span> errors</div>
            <div className="text-[10px]"><span className="font-bold text-amber-600">{warnings.length}</span> warnings</div>
          </div>
          <div className="space-y-0.5">
            {issues.map((issue, i) => (
              <button key={i} onClick={() => useEditorV3Store.getState().select(issue.instanceId)}
                className="w-full flex items-start gap-2 px-2 py-1.5 rounded hover:bg-accent/50 transition-colors text-left">
                <issue.icon className={`size-3 mt-0.5 shrink-0 ${issue.severity === "error" ? "text-red-500" : "text-amber-500"}`} />
                <div className="min-w-0">
                  <div className="text-[10px] font-medium truncate">{issue.label}</div>
                  <div className="text-[9px] text-muted-foreground">{issue.message}</div>
                </div>
                <AlertTriangle className={`size-2.5 mt-1 shrink-0 ${issue.severity === "error" ? "text-red-400" : "text-amber-400"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
