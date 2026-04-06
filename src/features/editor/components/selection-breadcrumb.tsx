"use client"

import { useEditor } from "@craftjs/core"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SelectionBreadcrumb() {
  const { path, actions } = useEditor((state) => {
    const selected = [...state.events.selected]
    if (selected.length === 0) return { path: [{ id: "ROOT", name: "Page" }] }
    if (selected.length > 1) return { path: [{ id: "ROOT", name: "Page" }, { id: "", name: `${selected.length} selected` }] }

    const nodeId = selected[0]
    const trail: { id: string; name: string }[] = []
    let current: string | undefined = nodeId
    while (current && current !== "ROOT") {
      try {
        const node = state.nodes[current] as { data: { displayName?: string; name?: string; parent?: string } } | undefined
        if (!node) break
        trail.unshift({ id: current, name: node.data.displayName || node.data.name || current })
        current = node.data.parent ?? undefined
      } catch { break }
    }
    return { path: [{ id: "ROOT", name: "Page" }, ...trail] }
  })

  return (
    <div className="flex items-center gap-0.5 h-7 px-3 border-t shrink-0 text-xs" style={{ borderColor: 'var(--editor-border)' }}>
      {path.map((item, i) => (
        <span key={item.id} className="flex items-center gap-0.5">
          {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/60" />}
          <Button variant="ghost" size="sm" className={`h-5 px-1 text-xs ${i === path.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}
            onClick={() => { if (item.id !== "ROOT") actions.selectNode(item.id) }}>
            {item.name}
          </Button>
        </span>
      ))}
    </div>
  )
}
