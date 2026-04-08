"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useEffect, useState, useMemo } from "react"
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface A11yIssue {
  severity: "error" | "warning"
  message: string
  nodeId: string
  nodeName: string
}

function runChecks(nodes: Record<string, { data: { name?: string; displayName?: string; props?: Record<string, unknown>; nodes?: string[] } }>): A11yIssue[] {
  const issues: A11yIssue[] = []
  const headingOrder: { level: number; nodeId: string; name: string }[] = []

  for (const [id, node] of Object.entries(nodes)) {
    if (id === ROOT_NODE || !node.data) continue
    const name = node.data.displayName || node.data.name || id
    const props = node.data.props ?? {}

    // Missing alt text on images
    if ((name === "Image" || name === "ImageBlock") && !props.alt) {
      issues.push({ severity: "error", message: "Image missing alt text", nodeId: id, nodeName: name })
    }

    // Empty links
    if (name === "Link" || name === "ButtonBlock") {
      if (!props.href && !props.url) {
        issues.push({ severity: "warning", message: "Link has no URL", nodeId: id, nodeName: name })
      }
    }

    // Track heading levels
    if (name === "Heading" || name === "HeadingBlock") {
      const level = Number(props.level ?? String(props.tag ?? "h2").replace("h", ""))
      headingOrder.push({ level, nodeId: id, name })
    }

    // Low contrast text (basic check — white text on light bg)
    if (props.color && props.backgroundColor) {
      const c = String(props.color).toLowerCase()
      const bg = String(props.backgroundColor).toLowerCase()
      if ((c === "#ffffff" || c === "white") && (bg === "#ffffff" || bg === "white" || bg === "#f9fafb" || bg === "#f3f4f6")) {
        issues.push({ severity: "error", message: "Text may have insufficient contrast", nodeId: id, nodeName: name })
      }
    }
  }

  // Heading order check
  for (let i = 1; i < headingOrder.length; i++) {
    if (headingOrder[i].level > headingOrder[i - 1].level + 1) {
      issues.push({
        severity: "warning",
        message: `Heading level skipped (h${headingOrder[i - 1].level} → h${headingOrder[i].level})`,
        nodeId: headingOrder[i].nodeId,
        nodeName: headingOrder[i].name,
      })
    }
  }

  return issues
}

export function AccessibilityPanel() {
  const { actions } = useEditor()
  const nodesRaw = useEditor((s) => s.nodes)
  const [issues, setIssues] = useState<A11yIssue[]>([])

  // Debounced check
  useEffect(() => {
    const t = setTimeout(() => {
      const simplified: Record<string, { data: { name?: string; displayName?: string; props?: Record<string, unknown>; nodes?: string[] } }> = {}
      for (const [id, node] of Object.entries(nodesRaw)) {
        simplified[id] = { data: { name: (node as any).data?.name, displayName: (node as any).data?.displayName, props: (node as any).data?.props, nodes: (node as any).data?.nodes } }
      }
      setIssues(runChecks(simplified))
    }, 1000)
    return () => clearTimeout(t)
  }, [nodesRaw])

  const errors = useMemo(() => issues.filter((i) => i.severity === "error"), [issues])
  const warnings = useMemo(() => issues.filter((i) => i.severity === "warning"), [issues])

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        {issues.length === 0 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
        Accessibility
      </div>

      {issues.length === 0 && <p className="text-xs text-muted-foreground">No issues found ✓</p>}

      {errors.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-destructive">{errors.length} error{errors.length > 1 ? "s" : ""}</p>
          {errors.map((issue, i) => (
            <Button key={i} variant="ghost" className="w-full justify-start h-auto py-1.5 px-2 text-xs" onClick={() => actions.selectNode(issue.nodeId)}>
              <AlertCircle className="h-3 w-3 text-destructive mr-2 shrink-0" />
              <span className="truncate">{issue.message} — <span className="text-muted-foreground">{issue.nodeName}</span></span>
            </Button>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-amber-600">{warnings.length} warning{warnings.length > 1 ? "s" : ""}</p>
          {warnings.map((issue, i) => (
            <Button key={i} variant="ghost" className="w-full justify-start h-auto py-1.5 px-2 text-xs" onClick={() => actions.selectNode(issue.nodeId)}>
              <AlertTriangle className="h-3 w-3 text-amber-500 mr-2 shrink-0" />
              <span className="truncate">{issue.message} — <span className="text-muted-foreground">{issue.nodeName}</span></span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
