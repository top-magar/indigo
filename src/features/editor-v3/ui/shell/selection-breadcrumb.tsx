"use client"
import { ChevronRight } from "lucide-react"
import type { InstanceId } from "../../types"
import { useStore } from "../use-store"
import { getMeta } from "../../registry/registry"
import { buildParentIndex } from "../../stores/indexes"
import { useEditorV3Store } from "../../stores/store"

/** Build ancestor chain from root → selected (inclusive) */
function getAncestorChain(instanceId: InstanceId): { id: InstanceId; label: string }[] {
  const s = useEditorV3Store.getState()
  const parentIndex = buildParentIndex(s)
  const chain: { id: InstanceId; label: string }[] = []
  let current: InstanceId | undefined = instanceId
  while (current) {
    const inst = s.instances.get(current)
    if (!inst) break
    const meta = getMeta(inst.component)
    chain.unshift({ id: current, label: inst.label ?? meta?.label ?? inst.component })
    current = parentIndex.get(current)
  }
  return chain
}

export function SelectionBreadcrumb() {
  const s = useStore()
  if (!s.selectedInstanceId) return null

  const chain = getAncestorChain(s.selectedInstanceId)
  if (chain.length === 0) return null

  return (
    <div className="flex items-center gap-0.5 px-3 py-1 border-b bg-background text-[11px] text-muted-foreground overflow-x-auto scrollbar-none">
      {chain.map((item, i) => {
        const isLast = i === chain.length - 1
        return (
          <span key={item.id} className="flex items-center gap-0.5 shrink-0">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
            <button
              onClick={() => s.select(item.id)}
              className={`px-1 py-0.5 rounded transition-colors ${isLast ? "text-primary font-medium" : "hover:text-foreground hover:bg-accent"}`}
            >
              {item.label}
            </button>
          </span>
        )
      })}
    </div>
  )
}
