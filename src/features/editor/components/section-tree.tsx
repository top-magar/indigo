"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useState, useCallback, useEffect, useRef } from "react"
import {
  ChevronRight, ChevronDown, Trash2,
  ArrowUp, ArrowDown, GripVertical,
  Type, ImageIcon, MousePointer, BoxIcon, ColumnsIcon,
  Sparkles, PanelTop, PanelBottom, FileText, ShoppingBag,
  Star, Shield, Mail, Megaphone, HelpCircle, Package,
  Play, Grid, MapPin, type LucideIcon,
} from "lucide-react"
import { cn } from "@/shared/utils"

const blockIconMap: Record<string, LucideIcon> = {
  Container: BoxIcon,
  Columns: ColumnsIcon,
  "Text": Type,
  "Rich Text": FileText,
  Image: ImageIcon,
  Button: MousePointer,
  Hero: Sparkles,
  Header: PanelTop,
  Footer: PanelBottom,
  "Product Grid": ShoppingBag,
  "Featured Product": Package,
  Testimonials: Star,
  "Trust Signals": Shield,
  Newsletter: Mail,
  "Promo Banner": Megaphone,
  FAQ: HelpCircle,
  Video: Play,
  Gallery: Grid,
  "Contact Info": MapPin,
}

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
    <div className="flex flex-col flex-1">
      <div className="px-4 pb-2 pt-4">
        <h2 style={{ fontSize: 13, fontWeight: 650, color: 'var(--editor-text)' }}>Sections</h2>
        <p style={{ marginTop: 2, fontSize: 12, color: 'var(--editor-text-secondary)' }}>Drag to reorder</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
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
          <p style={{ padding: '32px 16px', textAlign: 'center', fontSize: 13, color: 'var(--editor-text-disabled)' }}>
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
        <div style={{ height: 2, borderRadius: 1, background: 'var(--editor-accent)', marginLeft: 8 + depth * 16, marginRight: 8 }} />
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
        className="tree-item group"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '6px 8px',
          paddingLeft: 8 + depth * 16,
          borderRadius: 'var(--editor-radius)',
          cursor: 'pointer',
          transition: 'background 0.1s',
          fontSize: 13,
          fontWeight: isSelected ? 600 : 500,
          color: isSelected ? 'var(--editor-accent)' : 'var(--editor-text)',
          background: isSelected
            ? 'var(--editor-surface-selected)'
            : isDropTarget && dragState.position === "inside"
              ? 'var(--editor-accent-light)'
              : undefined,
        }}
      >
        {/* Drag handle */}
        <div className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-60 active:cursor-grabbing">
          <GripVertical className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
        </div>

        {/* Expand/collapse */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          aria-label={expanded ? "Collapse" : "Expand"}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded",
            hasChildren ? "hover:bg-[var(--editor-surface-hover)]" : "invisible"
          )}
        >
          {hasChildren && (expanded
            ? <ChevronDown className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
            : <ChevronRight className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
          )}
        </button>

        {/* Icon + Name */}
        {(() => {
          const Icon = blockIconMap[node.name]
          return Icon ? <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: isSelected ? 'var(--editor-accent)' : 'var(--editor-icon-secondary)' }} /> : null
        })()}
        <span className="flex-1 truncate" style={{ fontSize: 13 }}>
          {node.name}
        </span>

        {/* Inline actions on hover */}
        {showActions && (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleMoveUp}
              disabled={index <= 0}
              className="rounded p-0.5 transition-colors disabled:invisible"
              style={{ color: 'var(--editor-icon-secondary)' }}
              title="Move up"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              onClick={handleMoveDown}
              disabled={index >= siblingCount - 1}
              className="rounded p-0.5 transition-colors disabled:invisible"
              style={{ color: 'var(--editor-icon-secondary)' }}
              title="Move down"
            >
              <ArrowDown className="h-3 w-3" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-0.5 transition-colors hover:text-red-600"
              style={{ color: 'var(--editor-icon-secondary)' }}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Drop indicator — after */}
      {isDropTarget && dragState.position === "after" && (
        <div style={{ height: 2, borderRadius: 1, background: 'var(--editor-accent)', marginLeft: 8 + depth * 16, marginRight: 8 }} />
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
