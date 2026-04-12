"use client"
import { useState } from "react"
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
  const isHovered = s.hoveredInstanceId === instanceId
  const meta = getMeta(instance.component)
  const label = instance.label ?? meta?.label ?? instance.component
  const tag = instance.tag ?? instance.component

  return (
    <div className="relative">
      {/* Indentation guide line */}
      {depth > 0 && (
        <div className="absolute top-0 bottom-0 border-l border-gray-100" style={{ left: depth * 12 + 6 }} />
      )}
      <div
        className={`flex items-center gap-0.5 py-[3px] pr-2 rounded-[3px] text-[11px] cursor-default group transition-colors
          ${isSelected ? "bg-blue-500/10 text-blue-700" : isHovered ? "bg-gray-100" : "hover:bg-gray-50"}`}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={() => s.select(instanceId)}
        onMouseEnter={() => s.hover(instanceId)}
        onMouseLeave={() => s.hover(null)}
        draggable
        onDragStart={(e) => { e.dataTransfer.setData("instance-id", instanceId); e.dataTransfer.effectAllowed = "move" }}
      >
        <GripVertical className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }} className="shrink-0 p-0.5 -ml-0.5 rounded hover:bg-gray-200/60">
            {expanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
          </button>
        ) : <span className="w-4 shrink-0" />}
        <span className={`truncate ${isSelected ? "font-medium" : ""}`}>{label}</span>
        <span className={`ml-auto text-[9px] shrink-0 ${isSelected ? "text-blue-400" : "text-gray-300"}`}>{tag}</span>
      </div>
      {expanded && hasChildren && childIds.map((id) => <TreeNode key={id} instanceId={id} depth={depth + 1} />)}
    </div>
  )
}

export function Navigator() {
  const s = useStore()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined

  if (!page) return <div className="p-4 text-xs text-gray-400 text-center">No page selected</div>

  return (
    <div className="py-1.5 px-1 overflow-y-auto">
      <TreeNode instanceId={page.rootInstanceId} depth={0} />
    </div>
  )
}
