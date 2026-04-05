"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useState, useCallback, useEffect, useRef } from "react"
import {
  ChevronRight, ChevronDown, Trash2,
  ArrowUp, ArrowDown, GripVertical,
  Type, ImageIcon, MousePointer, BoxIcon, ColumnsIcon,
  Sparkles, PanelTop, PanelBottom, FileText, ShoppingBag,
  Star, Shield, Mail, Megaphone, HelpCircle, Package,
  Play, Grid, MapPin, Layers, type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const INDENT = 20

const blockIconMap: Record<string, LucideIcon> = {
  Container: BoxIcon, Columns: ColumnsIcon, "Text": Type, "Rich Text": FileText,
  Image: ImageIcon, Button: MousePointer, Hero: Sparkles, Header: PanelTop,
  Footer: PanelBottom, "Product Grid": ShoppingBag, "Featured Product": Package,
  Testimonials: Star, "Trust Signals": Shield, Newsletter: Mail,
  "Promo Banner": Megaphone, FAQ: HelpCircle, Video: Play, Gallery: Grid,
  "Contact Info": MapPin,
}

interface TreeNode { id: string; name: string; children: string[]; isCanvas: boolean; hidden: boolean; parent: string | null }

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
    if (!dragging || !position || dragging === targetId) { setDragState({ dragging: null, dragParent: null, overTarget: null, position: null }); return }
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

  const handleDragEnd = () => { setDragState({ dragging: null, dragParent: null, overTarget: null, position: null }) }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 h-11 px-3 shrink-0">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <span className="text-[13px] font-semibold text-foreground">Layers</span>
        <span className="ml-auto text-[11px] text-muted-foreground">Drag to reorder</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 min-h-0 px-1">
        {rootNode.children.map((childId, index) => (
          <TreeItem key={childId} nodeId={childId} nodes={nodes} selectedId={selectedId}
            actions={actions} query={query} depth={0} index={index}
            siblingCount={rootNode.children.length} parentId={ROOT_NODE}
            dragState={dragState} onDragStart={handleDragStart}
            onDragOver={handleDragOver} onDrop={handleDrop} onDragEnd={handleDragEnd} />
        ))}
        {rootNode.children.length === 0 && (
          <p className="py-8 px-3 text-center text-xs text-muted-foreground">No sections yet. Click "Add Section" below.</p>
        )}
      </ScrollArea>
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

function TreeItem({ nodeId, nodes, selectedId, actions, query, depth, index, siblingCount, parentId, dragState, onDragStart, onDragOver, onDrop, onDragEnd }: TreeItemProps) {
  const [expanded, setExpanded] = useState(true)
  const [hovered, setHovered] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)

  const node = nodes[nodeId]
  if (!node) return null

  const isSelected = selectedId === nodeId
  const hasChildren = node.children.length > 0
  const isDragging = dragState.dragging === nodeId
  const isDropTarget = dragState.overTarget === nodeId && dragState.dragging !== nodeId

  useEffect(() => { if (isSelected && rowRef.current) rowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" }) }, [isSelected])

  const handleSelect = useCallback(() => { actions.selectNode(nodeId) }, [actions, nodeId])
  const handleDelete = useCallback((e: React.MouseEvent) => { e.stopPropagation(); actions.delete(nodeId) }, [actions, nodeId])
  const handleMoveUp = useCallback((e: React.MouseEvent) => { e.stopPropagation(); if (index > 0) try { actions.move(nodeId, parentId, index - 1) } catch {} }, [actions, nodeId, parentId, index])
  const handleMoveDown = useCallback((e: React.MouseEvent) => { e.stopPropagation(); if (index < siblingCount - 1) try { actions.move(nodeId, parentId, index + 2) } catch {} }, [actions, nodeId, parentId, index, siblingCount])

  const Icon = blockIconMap[node.name]

  return (
    <div style={{ opacity: isDragging ? 0.3 : 1 }}>
      {isDropTarget && dragState.position === "before" && (
        <div className="h-0.5 rounded-full mx-2" style={{ background: 'var(--editor-accent)', marginLeft: 8 + depth * INDENT }} />
      )}

      <div ref={rowRef} draggable
        onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(nodeId, parentId) }}
        onDragOver={(e) => onDragOver(nodeId, e)}
        onDrop={() => onDrop(nodeId, parentId, index)}
        onDragEnd={onDragEnd}
        onClick={handleSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center gap-0.5 h-7 pr-2 rounded cursor-pointer transition-colors text-[13px]"
        style={{
          paddingLeft: 8 + depth * INDENT,
          fontWeight: isSelected ? 600 : 400,
          color: isSelected ? 'var(--editor-accent)' : 'var(--editor-text)',
          background: isSelected ? 'var(--editor-surface-selected)'
            : isDropTarget && dragState.position === "inside" ? 'var(--editor-accent-light)'
            : hovered ? 'var(--editor-surface-hover)' : 'transparent',
        }}>
        {/* Drag handle */}
        <GripVertical className="w-3 h-3 shrink-0 cursor-grab" style={{ opacity: hovered ? 0.5 : 0, color: 'var(--editor-icon-secondary)', transition: 'opacity 0.1s' }} />

        {/* Expand/collapse */}
        <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </Button>

        {/* Block icon */}
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: isSelected ? 'var(--editor-accent)' : 'var(--editor-icon-secondary)' }} />}

        {/* Name */}
        <span className="flex-1 truncate">{node.name}</span>

        {/* Hover actions */}
        {hovered && (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            {index > 0 && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleMoveUp}><ArrowUp className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Move up</TooltipContent></Tooltip>
            )}
            {index < siblingCount - 1 && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleMoveDown}><ArrowDown className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Move down</TooltipContent></Tooltip>
            )}
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 hover:text-destructive" onClick={handleDelete}><Trash2 className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
          </div>
        )}
      </div>

      {isDropTarget && dragState.position === "after" && (
        <div className="h-0.5 rounded-full mx-2" style={{ background: 'var(--editor-accent)', marginLeft: 8 + depth * INDENT }} />
      )}

      {expanded && hasChildren && node.children.map((childId, i) => (
        <TreeItem key={childId} nodeId={childId} nodes={nodes} selectedId={selectedId}
          actions={actions} query={query} depth={depth + 1} index={i}
          siblingCount={node.children.length} parentId={nodeId}
          dragState={dragState} onDragStart={onDragStart}
          onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} />
      ))}
    </div>
  )
}
