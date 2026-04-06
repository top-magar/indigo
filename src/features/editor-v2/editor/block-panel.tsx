"use client"

import { listByCategory } from "../core/registry"
import { getDefaults } from "../core/schema"
import { useEditorStore } from "./store"
import type { Operation } from "../core/operations"

export function BlockPanel() {
  const apply = useEditorStore((s) => s.apply)
  const rootId = useEditorStore((s) => s.document.rootId)
  const categories = listByCategory()

  const addBlock = (blockName: string, defaults: Record<string, unknown>) => {
    const op: Operation = { type: "add_node", nodeType: blockName, props: defaults, parentId: rootId }
    apply(op)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[12px] font-semibold">Add Block</span>
      </div>
      {Array.from(categories).map(([category, blocks]) => (
        <div key={category} className="px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5">{category}</p>
          <div className="grid grid-cols-2 gap-1">
            {blocks.map((b) => (
              <button key={b.schema.name} onClick={() => addBlock(b.schema.name, b.defaults)}
                className="flex flex-col items-center gap-1 p-2 rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-[11px] font-medium cursor-pointer">
                {b.schema.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
