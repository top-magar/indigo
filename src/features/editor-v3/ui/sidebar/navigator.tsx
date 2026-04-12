"use client"
import { useState, useCallback, useRef } from "react"
import { ChevronRight, ChevronDown, GripVertical } from "lucide-react"
import type { InstanceId } from "../../types"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"
import { getMeta } from "../../registry/registry"

type DropPosition = "before" | "inside" | "after" | null

function TreeNode({ instanceId, depth }: { instanceId: InstanceId; depth: number }) {
  const s = useStore()
  const instance = s.instances.get(instanceId)
  const [expanded, setExpanded] = useState(true)
  const [dropPos, setDropPos] = useState<DropPosition>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  if (!instance) return null
  const childIds = instance.children.filter((c) => c.type === "id").map((c) => c.value)
  const hasChildren = childIds.length > 0
  const isSelected = s.selectedInstanceId === instanceId
  const isHovered = s.hoveredInstanceId === instanceId
  const meta = getMeta(instance.component)
  const label = instance.label ?? meta?.label ?? instance.component
  const tag = instance.tag ?? instance.component

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("instance-id")) return
    e.preventDefault()
    e.stopPropagation()
    const rect = rowRef.current?.getBoundingClientRect()
    if (!rect) return
    const y = e.clientY - rect.top
    const third = rect.height / 3
    if (y < third) setDropPos("before")
    else if (y > third * 2) setDropPos("after")
    else setDropPos("inside")
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const dragId = e.dataTransfer.getData("instance-id")
    if (!dragId || dragId === instanceId) { setDropPos(null); return }
    const st = useEditorV3Store.getState()
    if (dropPos === "inside") {
      st.moveInstance(dragId, instanceId, instance.children.length)
    } else {
      // Find parent and index
      for (const [pid, pinst] of st.instances) {
        const idx = pinst.children.findIndex((c) => c.type === "id" && c.value === instanceId)
        if (idx !== -1) {
          const insertIdx = dropPos === "before" ? idx : idx + 1
          st.moveInstance(dragId, pid, insertIdx)
          break
        }
      }
    }
    st.select(dragId)
    setDropPos(null)
  }, [instanceId, dropPos, instance.children.length])

  return (
    <div className="relative">
      {/* Indentation guide line */}
      {depth > 0 && (
        <div className="absolute top-0 bottom-0 border-l border-border/50" style={{ left: depth * 12 + 6 }} />
      )}
      {/* Drop indicator line — before */}
      {dropPos === "before" && (
        <div className="absolute left-0 right-0 top-0 h-0.5 bg-primary rounded-full z-10" style={{ marginLeft: depth * 12 + 4 }} />
      )}
      <div
        ref={rowRef}
        className={`flex items-center gap-0.5 py-[3px] pr-2 rounded-[3px] text-[11px] cursor-default group transition-colors
          ${isSelected ? "bg-accent text-accent-foreground" : isHovered ? "bg-accent/50" : "hover:bg-accent/30"}
          ${dropPos === "inside" ? "ring-1 ring-primary ring-inset" : ""}`}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={() => s.select(instanceId)}
        onMouseEnter={() => s.hover(instanceId)}
        onMouseLeave={() => s.hover(null)}
        draggable
        onDragStart={(e) => { e.dataTransfer.setData("instance-id", instanceId); e.dataTransfer.effectAllowed = "move" }}
        onDragOver={handleDragOver}
        onDragLeave={() => setDropPos(null)}
        onDrop={handleDrop}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }} className="shrink-0 p-0.5 -ml-0.5 rounded hover:bg-accent/50">
            {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </button>
        ) : <span className="w-4 shrink-0" />}
        <span className={`truncate ${isSelected ? "font-medium" : ""}`}>{label}</span>
        <span className={`ml-auto text-[9px] shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground/50"}`}>{tag}</span>
      </div>
      {/* Drop indicator line — after */}
      {dropPos === "after" && (
        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary rounded-full z-10" style={{ marginLeft: depth * 12 + 4 }} />
      )}
      {expanded && hasChildren && childIds.map((id) => <TreeNode key={id} instanceId={id} depth={depth + 1} />)}
    </div>
  )
}

export function Navigator() {
  const s = useStore()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined

  if (!page) return <div className="p-4 text-xs text-muted-foreground text-center">No page selected</div>

  return (
    <div className="py-1.5 px-1 overflow-y-auto">
      <TreeNode instanceId={page.rootInstanceId} depth={0} />
    </div>
  )
}
