"use client"
import { useState, useCallback } from "react"
import { ChevronRight, ChevronDown, GripVertical } from "lucide-react"
import type { InstanceId } from "../../types"
import { useStore } from "../use-store"
import { getMeta } from "../../registry/registry"

function TreeNode({ instanceId, depth }: { instanceId: InstanceId; depth: number }) {
  const s = useStore()
  const instance = s.instances.get(instanceId)
  const [expanded, setExpanded] = useState(true)

  if (!instance) return null
  const childIds = instance.children.filter((c) => c.type === "id").map((c) => c.value)
  const hasChildren = childIds.length > 0
  const isSelected = s.selectedInstanceId === instanceId
  const meta = getMeta(instance.component)
  const label = instance.label ?? meta?.label ?? instance.component

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 px-1 rounded text-xs cursor-pointer group ${isSelected ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
        style={{ paddingLeft: depth * 16 + 4 }}
        onClick={() => s.select(instanceId)}
        draggable
        onDragStart={(e) => { e.dataTransfer.setData("instance-id", instanceId); e.dataTransfer.effectAllowed = "move" }}
      >
        <GripVertical className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }} className="shrink-0">
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : <span className="w-3" />}
        <span className="truncate">{label}</span>
        <span className="ml-auto text-[10px] text-gray-400">{instance.tag ?? instance.component}</span>
      </div>
      {expanded && hasChildren && childIds.map((id) => <TreeNode key={id} instanceId={id} depth={depth + 1} />)}
    </div>
  )
}

export function Navigator() {
  const s = useStore()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined

  if (!page) return <div className="p-3 text-xs text-gray-400">No page</div>

  return (
    <div className="p-2 overflow-y-auto text-sm">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 px-1">Navigator</div>
      <TreeNode instanceId={page.rootInstanceId} depth={0} />
    </div>
  )
}
