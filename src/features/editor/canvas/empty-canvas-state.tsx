"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { Plus } from "lucide-react"

interface EmptyCanvasProps {
  onAddSection: () => void
}

export function EmptyCanvasState({ onAddSection }: EmptyCanvasProps) {
  const isEmpty = useEditor((state) => {
    // Check ROOT's direct children AND linked canvas nodes
    const root = state.nodes[ROOT_NODE]
    if (!root) return true
    const directChildren = root.data.nodes ?? []
    const linkedIds = Object.values(root.data.linkedNodes ?? {})
    // Check if any canvas container has children
    for (const id of [...directChildren, ...linkedIds]) {
      const node = state.nodes[id]
      if (node?.data.nodes && node.data.nodes.length > 0) return false
    }
    return directChildren.length === 0 && linkedIds.length === 0
  })

  if (!isEmpty) return null

  return (
    <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
      <button onClick={onAddSection}
        className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors hover:border-primary/40 hover:bg-primary/[0.02]"
        style={{ borderColor: "var(--editor-border)" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Plus className="size-4 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium">Add your first section</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Click here or press ⌘/</p>
        </div>
      </button>
    </div>
  )
}
