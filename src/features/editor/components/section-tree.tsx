"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useState, useCallback, useEffect, useRef } from "react"
import {
  ChevronRight, ChevronDown, Trash2,
  ArrowUp, ArrowDown, GripVertical,
} from "lucide-react"
import { cn } from "@/shared/utils"

interface TreeNode {
  id: string
  name: string
  children: string[]
  isCanvas: boolean
  hidden: boolean
  parent: string | null
}

export function SectionTree() {
  const { nodes, selectedId, actions, query } = useEditor((state) => {
    const nodeMap: Record<string, TreeNode> = {}
    for (const [id, node] of Object.entries(state.nodes)) {
      nodeMap[id] = {
        id,
        name: node.data.displayName || node.data.name || "Unknown",
        children: node.data.nodes || [],
        isCanvas: !!node.data.isCanvas,
        hidden: !!node.data.hidden,
        parent: node.data.parent ?? null,
      }
    }
    const [sel] = state.events.selected
    return { nodes: nodeMap, selectedId: sel || null }
  })

  const [dragState, setDragState] = useState<{
    dragging: string | null
    dragParent: string | null
    overTarget: string | null
    position: "before" | "after" | "inside" | null
  }>({ dragging: null, dragParent: null, overTarget: null, position: null })

  const rootNode = nodes[ROOT_NODE]
  if (!rootNode) return null

  const handleDragStart = (nodeId: string, parentId: string) => {
    setDragState({ dragging: nodeId, dragParent: parentId, overTarget: null, position: null })
  }

  const handleDragOver = (nodeId: string, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragState.dragging === nodeId) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    const third = rect.height / 3

    let position: "before" | "after" | "inside"
    if (y < third) position = "before"
    else if (y > third * 2) position = "after"
    else position = nodes[nodeId]?.isCanvas ? "inside" : "after"

    setDragState((s) => ({ ...s, overTarget: nodeId, position }))
  }

  const handleDrop = (targetId: string, targetParentId: string, targetIndex: number) => {
    const { dragging, dragParent, position } = dragState
    if (!dragging || !position || dragging === targetId) {
      setDragState({ dragging: null, dragParent: null, overTarget: null, position: null })
      return
    }

    try {
      if (position === "inside" && nodes[targetId]?.isCanvas) {
        actions.move(dragging, targetId, 0)
      } else {
        // Calculate correct index accounting for same-parent removal
        let insertIndex = position === "before" ? targetIndex : targetIndex + 1
        if (dragParent === targetParentId) {
          const dragIndex = nodes[targetParentId]?.children.indexOf(dragging) ?? -1
          if (dragIndex !== -1 && dragIndex < insertIndex) {
            insertIndex -= 1
          }
        }
        actions.move(dragging, targetParentId, insertIndex)
      }
    } catch { /* node may not be movable */ }

    setDragState({ dragging: null, dragParent: null, overTarget: null, position: null })
  }

  const handleDragEnd = () => {
    setDragState({ dragging: null, dragParent: null, overTarget: null, position: null })
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 pb-2 pt-4">
        <h2 className="text-[12px] font-semibold text-foreground">Sections</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Drag to reorder</p>
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        {rootNode.children.map((childId, index) => (
          <TreeItem
            key={childId}
            nodeId={childId}
            nodes={nodes}
            selectedId={selectedId}
            actions={actions}
            query={query}
            depth={0}
            index={index}
            siblingCount={rootNode.children.length}
            parentId={ROOT_NODE}
            dragState={dragState}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}
        {rootNode.children.length === 0 && (
          <p className="px-4 py-8 text-center text-[11px] text-muted-foreground/60">
            No sections yet. Click "Add Section" below.
          </p>
        )}
      </div>
    </div>
  )
}

interface TreeItemProps {
  nodeId: string
  nodes: Record<string, TreeNode>
  selectedId: string | null
  actions: any
  query: any
  depth: number
  index: number
  siblingCount: number
  parentId: string
  dragState: { dragging: string | null; dragParent: string | null; overTarget: string | null; position: "before" | "after" | "inside" | null }
  onDragStart: (id: string, parentId: string) => void
  onDragOver: (id: string, e: React.DragEvent) => void
  onDrop: (targetId: string, parentId: string, index: number) => void
  onDragEnd: () => void
}

function TreeItem({
  nodeId, nodes, selectedId, actions, query, depth, index, siblingCount, parentId,
  dragState, onDragStart, onDragOver, onDrop, onDragEnd,
}: TreeItemProps) {
  const [expanded, setExpanded] = useState(true)
  const [showActions, setShowActions] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)

  const node = nodes[nodeId]
  if (!node) return null

  const isSelected = selectedId === nodeId
  const hasChildren = node.children.length > 0
  const isDragging = dragState.dragging === nodeId
  const isDropTarget = dragState.overTarget === nodeId && dragState.dragging !== nodeId

  // Scroll into view when selected from canvas
  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [isSelected])

  const handleSelect = useCallback(() => {
    actions.selectNode(nodeId)
  }, [actions, nodeId])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    actions.delete(nodeId)
  }, [actions, nodeId])

  const handleMoveUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (index <= 0) return
    try { actions.move(nodeId, parentId, index - 1) } catch {}
  }, [actions, nodeId, parentId, index])

  const handleMoveDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (index >= siblingCount - 1) return
    try { actions.move(nodeId, parentId, index + 2) } catch {}
  }, [actions, nodeId, parentId, index, siblingCount])

  return (
    <div className={cn(isDragging && "opacity-30")}>
      {/* Drop indicator — before */}
      {isDropTarget && dragState.position === "before" && (
        <div className="mx-3 h-0.5 rounded-full bg-primary" style={{ marginLeft: 8 + depth * 16 }} />
      )}

      {/* Node row */}
      <div
        ref={rowRef}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move"
          onDragStart(nodeId, parentId)
        }}
        onDragOver={(e) => onDragOver(nodeId, e)}
        onDrop={() => onDrop(nodeId, parentId, index)}
        onDragEnd={onDragEnd}
        onClick={handleSelect}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        className={cn(
          "group flex items-center gap-0.5 rounded px-2 py-1.5 transition-colors cursor-pointer",
          isSelected
            ? "bg-primary/10 text-foreground"
            : "text-foreground/80 hover:bg-accent/50",
          isDropTarget && dragState.position === "inside" && "ring-2 ring-primary/40 bg-primary/5"
        )}
        style={{ paddingLeft: 4 + depth * 16 }}
      >
        {/* Drag handle */}
        <div className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-60 active:cursor-grabbing">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Expand/collapse */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          aria-label={expanded ? "Collapse" : "Expand"}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
            hasChildren ? "hover:bg-accent" : "invisible"
          )}
        >
          {hasChildren && (expanded
            ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
            : <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </button>

        {/* Name */}
        <span className={cn(
          "flex-1 truncate text-[11px]",
          isSelected ? "font-semibold" : "font-medium"
        )}>
          {node.name}
        </span>

        {/* Inline actions on hover */}
        {showActions && (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleMoveUp}
              disabled={index <= 0}
              className="rounded p-0.5 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground disabled:invisible"
              title="Move up"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              onClick={handleMoveDown}
              disabled={index >= siblingCount - 1}
              className="rounded p-0.5 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground disabled:invisible"
              title="Move down"
            >
              <ArrowDown className="h-3 w-3" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-0.5 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Drop indicator — after */}
      {isDropTarget && dragState.position === "after" && (
        <div className="mx-3 h-0.5 rounded-full bg-primary" style={{ marginLeft: 8 + depth * 16 }} />
      )}

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map((childId, i) => (
            <TreeItem
              key={childId}
              nodeId={childId}
              nodes={nodes}
              selectedId={selectedId}
              actions={actions}
              query={query}
              depth={depth + 1}
              index={i}
              siblingCount={node.children.length}
              parentId={nodeId}
              dragState={dragState}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  )
}
