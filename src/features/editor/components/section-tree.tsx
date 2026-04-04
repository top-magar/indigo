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

/*
 * 4px grid tokens (matching top-bar system)
 * Row height: 28px | Indent: 20px per level | Icon: 14px (block), 12px (action)
 */
const R = 4 // radius for tree items
const INDENT = 20 // px per depth level
const ICON = { block: 14, action: 12, chevron: 12, grip: 12 }

const blockIconMap: Record<string, LucideIcon> = {
  Container: BoxIcon, Columns: ColumnsIcon, "Text": Type, "Rich Text": FileText,
  Image: ImageIcon, Button: MousePointer, Hero: Sparkles, Header: PanelTop,
  Footer: PanelBottom, "Product Grid": ShoppingBag, "Featured Product": Package,
  Testimonials: Star, "Trust Signals": Shield, Newsletter: Mail,
  "Promo Banner": Megaphone, FAQ: HelpCircle, Video: Play, Gallery: Grid,
  "Contact Info": MapPin,
}

interface TreeNode {
  id: string; name: string; children: string[]; isCanvas: boolean; hidden: boolean; parent: string | null
}

export function SectionTree() {
  const { nodes, selectedId, actions, query } = useEditor((state) => {
    const nodeMap: Record<string, TreeNode> = {}
    for (const [id, node] of Object.entries(state.nodes)) {
      nodeMap[id] = {
        id, name: node.data.displayName || node.data.name || "Unknown",
        children: node.data.nodes || [], isCanvas: !!node.data.isCanvas,
        hidden: !!node.data.hidden, parent: node.data.parent ?? null,
      }
    }
    const [sel] = state.events.selected
    return { nodes: nodeMap, selectedId: sel || null }
  })

  const [dragState, setDragState] = useState<{
    dragging: string | null; dragParent: string | null; overTarget: string | null; position: "before" | "after" | "inside" | null
  }>({ dragging: null, dragParent: null, overTarget: null, position: null })

  const rootNode = nodes[ROOT_NODE]
  if (!rootNode) return null

  const handleDragStart = (nodeId: string, parentId: string) => {
    setDragState({ dragging: nodeId, dragParent: parentId, overTarget: null, position: null })
  }

  const handleDragOver = (nodeId: string, e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
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
      setDragState({ dragging: null, dragParent: null, overTarget: null, position: null }); return
    }
    try {
      if (position === "inside" && nodes[targetId]?.isCanvas) {
        actions.move(dragging, targetId, 0)
      } else {
        let insertIndex = position === "before" ? targetIndex : targetIndex + 1
        if (dragParent === targetParentId) {
          const dragIndex = nodes[targetParentId]?.children.indexOf(dragging) ?? -1
          if (dragIndex !== -1 && dragIndex < insertIndex) insertIndex -= 1
        }
        actions.move(dragging, targetParentId, insertIndex)
      }
    } catch {}
    setDragState({ dragging: null, dragParent: null, overTarget: null, position: null })
  }

  const handleDragEnd = () => {
    setDragState({ dragging: null, dragParent: null, overTarget: null, position: null })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: '12px 12px 8px' }}>
        <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--editor-text)' }}>Sections</h2>
        <p style={{ marginTop: 2, fontSize: 11, color: 'var(--editor-text-disabled)' }}>Drag to reorder</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
        {rootNode.children.map((childId, index) => (
          <TreeItem
            key={childId} nodeId={childId} nodes={nodes} selectedId={selectedId}
            actions={actions} query={query} depth={0} index={index}
            siblingCount={rootNode.children.length} parentId={ROOT_NODE}
            dragState={dragState} onDragStart={handleDragStart}
            onDragOver={handleDragOver} onDrop={handleDrop} onDragEnd={handleDragEnd}
          />
        ))}
        {rootNode.children.length === 0 && (
          <p style={{ padding: '32px 12px', textAlign: 'center', fontSize: 12, color: 'var(--editor-text-disabled)' }}>
            No sections yet. Click "Add Section" below.
          </p>
        )}
      </div>
    </div>
  )
}

interface TreeItemProps {
  nodeId: string; nodes: Record<string, TreeNode>; selectedId: string | null
  actions: ReturnType<typeof useEditor>["actions"]; query: ReturnType<typeof useEditor>["query"]
  depth: number; index: number; siblingCount: number; parentId: string
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
  const [hovered, setHovered] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)

  const node = nodes[nodeId]
  if (!node) return null

  const isSelected = selectedId === nodeId
  const hasChildren = node.children.length > 0
  const isDragging = dragState.dragging === nodeId
  const isDropTarget = dragState.overTarget === nodeId && dragState.dragging !== nodeId

  useEffect(() => {
    if (isSelected && rowRef.current) rowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [isSelected])

  const handleSelect = useCallback(() => { actions.selectNode(nodeId) }, [actions, nodeId])
  const handleDelete = useCallback((e: React.MouseEvent) => { e.stopPropagation(); actions.delete(nodeId) }, [actions, nodeId])
  const handleMoveUp = useCallback((e: React.MouseEvent) => { e.stopPropagation(); if (index > 0) try { actions.move(nodeId, parentId, index - 1) } catch {} }, [actions, nodeId, parentId, index])
  const handleMoveDown = useCallback((e: React.MouseEvent) => { e.stopPropagation(); if (index < siblingCount - 1) try { actions.move(nodeId, parentId, index + 2) } catch {} }, [actions, nodeId, parentId, index, siblingCount])

  const smallBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, borderRadius: R, border: 'none', background: 'none',
    cursor: 'pointer', color: 'var(--editor-icon-secondary)', padding: 0,
    transition: 'color 0.1s',
  }

  return (
    <div style={{ opacity: isDragging ? 0.3 : 1 }}>
      {/* Drop indicator — before */}
      {isDropTarget && dragState.position === "before" && (
        <div style={{ height: 2, borderRadius: 1, background: 'var(--editor-accent)', marginLeft: 8 + depth * INDENT, marginRight: 8 }} />
      )}

      {/* Node row */}
      <div
        ref={rowRef}
        draggable
        onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(nodeId, parentId) }}
        onDragOver={(e) => onDragOver(nodeId, e)}
        onDrop={() => onDrop(nodeId, parentId, index)}
        onDragEnd={onDragEnd}
        onClick={handleSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 2,
          height: 28, padding: '0 8px', paddingLeft: 8 + depth * INDENT,
          borderRadius: R, cursor: 'pointer',
          transition: 'background 0.1s',
          fontSize: 13, fontWeight: isSelected ? 600 : 400,
          color: isSelected ? 'var(--editor-accent)' : 'var(--editor-text)',
          background: isSelected
            ? 'var(--editor-surface-selected)'
            : isDropTarget && dragState.position === "inside"
              ? 'var(--editor-accent-light)'
              : hovered ? 'var(--editor-surface-hover)' : 'transparent',
        }}
      >
        {/* Drag handle */}
        <div style={{ ...smallBtn, cursor: 'grab', opacity: hovered ? 0.5 : 0, transition: 'opacity 0.1s' }}>
          <GripVertical style={{ width: ICON.grip, height: ICON.grip }} />
        </div>

        {/* Expand/collapse */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          aria-label={expanded ? "Collapse" : "Expand"}
          style={{ ...smallBtn, visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {expanded
            ? <ChevronDown style={{ width: ICON.chevron, height: ICON.chevron }} />
            : <ChevronRight style={{ width: ICON.chevron, height: ICON.chevron }} />
          }
        </button>

        {/* Block icon */}
        {(() => {
          const Icon = blockIconMap[node.name]
          return Icon ? <Icon style={{ width: ICON.block, height: ICON.block, flexShrink: 0, color: isSelected ? 'var(--editor-accent)' : 'var(--editor-icon-secondary)' }} /> : null
        })()}

        {/* Name */}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.name}
        </span>

        {/* Inline actions on hover */}
        {hovered && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={handleMoveUp} disabled={index <= 0} style={{ ...smallBtn, visibility: index <= 0 ? 'hidden' : 'visible' }} title="Move up">
              <ArrowUp style={{ width: ICON.action, height: ICON.action }} />
            </button>
            <button onClick={handleMoveDown} disabled={index >= siblingCount - 1} style={{ ...smallBtn, visibility: index >= siblingCount - 1 ? 'hidden' : 'visible' }} title="Move down">
              <ArrowDown style={{ width: ICON.action, height: ICON.action }} />
            </button>
            <button
              onClick={handleDelete} title="Delete"
              style={{ ...smallBtn }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#c70a24' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--editor-icon-secondary)' }}
            >
              <Trash2 style={{ width: ICON.action, height: ICON.action }} />
            </button>
          </div>
        )}
      </div>

      {/* Drop indicator — after */}
      {isDropTarget && dragState.position === "after" && (
        <div style={{ height: 2, borderRadius: 1, background: 'var(--editor-accent)', marginLeft: 8 + depth * INDENT, marginRight: 8 }} />
      )}

      {/* Children */}
      {expanded && hasChildren && node.children.map((childId, i) => (
        <TreeItem
          key={childId} nodeId={childId} nodes={nodes} selectedId={selectedId}
          actions={actions} query={query} depth={depth + 1} index={i}
          siblingCount={node.children.length} parentId={nodeId}
          dragState={dragState} onDragStart={onDragStart}
          onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
        />
      ))}
    </div>
  )
}
