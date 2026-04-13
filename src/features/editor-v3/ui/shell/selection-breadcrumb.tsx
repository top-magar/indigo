"use client"
import { ChevronRight } from "lucide-react"
import type { InstanceId } from "../../types"
import { useStore } from "../use-store"
import { getMeta } from "../../registry/registry"
import { buildParentIndex } from "../../stores/indexes"
import { useEditorV3Store } from "../../stores/store"

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

const MAX_VISIBLE = 4

export function SelectionBreadcrumb() {
  const s = useStore()
  if (!s.selectedInstanceId) return null

  const fullChain = getAncestorChain(s.selectedInstanceId)
  if (fullChain.length === 0) return null

  const truncated = fullChain.length > MAX_VISIBLE
  const chain = truncated ? fullChain.slice(-MAX_VISIBLE) : fullChain

  return (
    <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground overflow-x-auto scrollbar-none min-w-0">
      {truncated && (
        <span className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => s.select(fullChain[0].id)} className="px-1 py-0.5 rounded hover:text-foreground hover:bg-accent text-muted-foreground/40">…</button>
          <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
        </span>
      )}
      {chain.map((item, i) => {
        const isLast = i === chain.length - 1
        return (
          <span key={item.id} className="flex items-center gap-0.5 shrink-0">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/30" />}
            <button
              onClick={() => s.select(item.id)}
              className={`px-1 py-0.5 rounded transition-colors max-w-[100px] truncate ${isLast ? "text-primary font-medium" : "hover:text-foreground hover:bg-accent"}`}
            >
              {item.label}
            </button>
          </span>
        )
      })}
    </div>
  )
}
