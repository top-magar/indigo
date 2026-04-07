"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import {
  ChevronRight, ChevronDown, Trash2,
  ArrowUp, ArrowDown, GripVertical,
  Eye, EyeOff, Lock, Unlock,
  Search,
  Type, ImageIcon, MousePointer, BoxIcon, ColumnsIcon,
  Sparkles, PanelTop, PanelBottom, FileText, ShoppingBag,
  Star, Shield, Mail, Megaphone, HelpCircle, Package,
  Play, Grid, MapPin, Layers, type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useOverlayStore } from "../overlay-store"

const INDENT = 20

const blockIconMap: Record<string, LucideIcon> = {
  Container: BoxIcon, Columns: ColumnsIcon, "Text": Type, "Rich Text": FileText,
  Image: ImageIcon, Button: MousePointer, Hero: Sparkles, Header: PanelTop,
  Footer: PanelBottom, "Product Grid": ShoppingBag, "Featured Product": Package,
  Testimonials: Star, "Trust Signals": Shield, Newsletter: Mail,
  "Promo Banner": Megaphone, FAQ: HelpCircle, Video: Play, Gallery: Grid,
  "Contact Info": MapPin,
}

interface TreeNode { id: string; name: string; children: string[]; isCanvas: boolean; hidden: boolean; locked: boolean; parent: string | null }

export function SectionTree() {
  // Split into two selectors: selection (changes often) and nodes (changes rarely)
  const { selectedId } = useEditor((state) => {
    const [sel] = state.events.selected
    return { selectedId: sel || null }
  })
  const { actions, query } = useEditor(() => ({}))

  // Memoize node map — only rebuild when node structure changes
  const nodesRaw = useEditor((state) => state.nodes) as Record<string, { data: { custom?: Record<string, unknown>; displayName?: string; name?: string; nodes?: string[]; isCanvas?: boolean; hidden?: boolean; parent?: string | null } }>
  const cacheRef = useRef<{ key: string; map: Record<string, TreeNode> }>({ key: "", map: {} })
  const nodes = useMemo(() => {
    const parts: string[] = []
    for (const [id, node] of Object.entries(nodesRaw)) {
      parts.push(`${id}:${(node.data.custom?.displayName as string) || node.data.displayName || node.data.name}:${(node.data.nodes || []).length}:${node.data.hidden ? 1 : 0}:${node.data.custom?.locked ? 1 : 0}`)
    }
    const key = parts.join("|")
    if (key === cacheRef.current.key) return cacheRef.current.map

    const nodeMap: Record<string, TreeNode> = {}
    for (const [id, node] of Object.entries(nodesRaw)) {
      nodeMap[id] = {
        id, name: (node.data.custom?.displayName as string) || node.data.displayName || node.data.name || "Unknown",
        children: node.data.nodes || [], isCanvas: !!node.data.isCanvas,
        hidden: !!node.data.hidden, locked: !!node.data.custom?.locked, parent: node.data.parent ?? null,
      }
    }
    cacheRef.current = { key, map: nodeMap }
    return nodeMap
  }, [nodesRaw])

  const [dragState, setDragState] = useState<{
    dragging: string | null; dragParent: string | null; overTarget: string | null; position: "before" | "after" | "inside" | null
  }>({ dragging: null, dragParent: null, overTarget: null, position: null })

  const overlayStore = useOverlayStore()
  const [search, setSearch] = useState("")

  const rootNode = nodes[ROOT_NODE]
  if (!rootNode) return null

  // Recursive filter: show node if it or any descendant matches
  const matchesSearch = (nodeId: string): boolean => {
    const n = nodes[nodeId]
    if (!n) return false
    if (n.name.toLowerCase().includes(search.toLowerCase())) return true
    return n.children.some(matchesSearch)
  }

  const filteredChildren = search
    ? rootNode.children.filter(matchesSearch)
    : rootNode.children

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

    // Show drop zone on canvas overlay
    const targetEl = document.querySelector(`[data-craft-node-id="${nodeId}"]`) as HTMLElement | null
    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    if (targetEl && canvas) {
      let zoom = 1
      const zoomed = canvas.querySelector("[style*='zoom']") as HTMLElement | null
      if (zoomed) { const z = parseFloat(zoomed.style.zoom || "1"); if (z > 0) zoom = z }
      const tr = targetEl.getBoundingClientRect()
      const cr = canvas.getBoundingClientRect()
      const dropY = position === "before"
        ? (tr.top - cr.top + canvas.scrollTop) / zoom
        : (tr.bottom - cr.top + canvas.scrollTop) / zoom
      const dropLeft = (tr.left - cr.left + canvas.scrollLeft) / zoom
      const dropWidth = tr.width / zoom
      overlayStore.setDropZones([{ y: dropY, left: dropLeft, width: dropWidth }])
    }
  }

  const handleDrop = (targetId: string, targetParentId: string, targetIndex: number) => {
    const { dragging, dragParent, position } = dragState
    if (!dragging || !position || dragging === targetId) { setDragState({ dragging: null, dragParent: null, overTarget: null, position: null }); overlayStore.setDropZones([]); return }
    try {
      if (position === "inside" && nodes[targetId]?.isCanvas) {
        actions.move(dragging, targetId, 0)
      } else {
        // Craft.js move() uses $$ markers for same-parent moves — 
        // it handles index shifting internally, so we pass the raw target index
        const insertAt = position === "before" ? targetIndex : targetIndex + 1
        actions.move(dragging, targetParentId, insertAt)
      }
    } catch {}
    setDragState({ dragging: null, dragParent: null, overTarget: null, position: null })
    overlayStore.setDropZones([])
  }

  const handleDragEnd = () => { setDragState({ dragging: null, dragParent: null, overTarget: null, position: null }); overlayStore.setDropZones([]) }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 h-11 px-3 shrink-0">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <span className="text-[13px] font-semibold text-foreground">Layers</span>
        <span className="ml-auto text-[11px] text-muted-foreground">Drag to reorder</span>
      </div>
      <Separator />
      <div className="px-2 py-1.5 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter layers…"
            className="w-full h-7 pl-6 pr-2 text-[12px] rounded-md border border-border bg-background outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0 px-1 pt-1">
        {filteredChildren.map((childId, index) => (
          <TreeItem key={childId} nodeId={childId} nodes={nodes} selectedId={selectedId}
            actions={actions} query={query} depth={0} index={index}
            siblingCount={filteredChildren.length} parentId={ROOT_NODE}
            dragState={dragState} onDragStart={handleDragStart}
            onDragOver={handleDragOver} onDrop={handleDrop} onDragEnd={handleDragEnd} />
        ))}
        {filteredChildren.length === 0 && (
          <p className="py-8 px-3 text-center text-xs text-muted-foreground">
            {search ? "No matching layers" : "No sections yet. Click \"Add Section\" below."}
          </p>
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
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const rowRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleStartRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setEditName(node?.name ?? "")
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }, [node?.name])

  const handleCommitRename = useCallback(() => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== node?.name) {
      actions.setCustom(nodeId, (custom: Record<string, unknown>) => { custom.displayName = trimmed })
    }
    setEditing(false)
  }, [editName, node?.name, actions, nodeId])

  const handleRenameKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCommitRename()
    if (e.key === "Escape") setEditing(false)
  }, [handleCommitRename])

  const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    actions.setHidden(nodeId, !node?.hidden)
  }, [actions, nodeId, node?.hidden])

  const handleToggleLock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    actions.setCustom(nodeId, (custom: Record<string, unknown>) => { custom.locked = !custom.locked })
  }, [actions, nodeId])

  const Icon = blockIconMap[node.name]

  return (
    <div style={{ opacity: isDragging ? 0.3 : 1 }}>
      {isDropTarget && dragState.position === "before" && (
        <div className="h-0.5 rounded-full mx-2" style={{ background: '#2563eb', marginLeft: 8 + depth * INDENT }} />
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
          opacity: node.hidden ? 0.4 : 1,
          color: isSelected ? 'var(--editor-accent)' : 'var(--editor-text)',
          background: isSelected ? 'var(--editor-surface-selected)'
            : isDropTarget && dragState.position === "inside" ? 'var(--editor-accent-light)'
            : hovered ? 'var(--editor-surface-hover)' : 'transparent',
        }}>
        {/* Drag handle */}
        <GripVertical className="w-3 h-3 shrink-0 cursor-grab text-muted-foreground transition-opacity duration-100" style={{ opacity: hovered ? 0.5 : 0 }} />

        {/* Expand/collapse */}
        <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </Button>

        {/* Block icon */}
        {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-blue-600" : "text-muted-foreground"}`} />}

        {/* Name */}
        {editing ? (
          <input ref={inputRef} value={editName} onChange={(e) => setEditName(e.target.value)}
            onBlur={handleCommitRename} onKeyDown={handleRenameKey}
            className="flex-1 min-w-0 bg-transparent border-b border-blue-400 outline-none text-[13px] px-0 py-0"
            onClick={(e) => e.stopPropagation()} />
        ) : (
          <span className="flex-1 truncate" onDoubleClick={handleStartRename}>{node.name}</span>
        )}

        {/* Hover actions */}
        {(hovered || node.hidden || node.locked) && (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            {(hovered || node.hidden) && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleToggleVisibility}>
                {node.hidden ? <EyeOff className="w-3 h-3 text-muted-foreground/50" /> : <Eye className="w-3 h-3" />}
              </Button></TooltipTrigger><TooltipContent>{node.hidden ? "Show" : "Hide"}</TooltipContent></Tooltip>
            )}
            {(hovered || node.locked) && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleToggleLock}>
                {node.locked ? <Lock className="w-3 h-3 text-orange-500" /> : <Unlock className="w-3 h-3" />}
              </Button></TooltipTrigger><TooltipContent>{node.locked ? "Unlock" : "Lock"}</TooltipContent></Tooltip>
            )}
            {hovered && index > 0 && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleMoveUp}><ArrowUp className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Move up</TooltipContent></Tooltip>
            )}
            {hovered && index < siblingCount - 1 && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleMoveDown}><ArrowDown className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Move down</TooltipContent></Tooltip>
            )}
            {hovered && <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 hover:text-destructive" onClick={handleDelete}><Trash2 className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>}
          </div>
        )}
      </div>

      {isDropTarget && dragState.position === "after" && (
        <div className="h-0.5 rounded-full mx-2" style={{ background: '#2563eb', marginLeft: 8 + depth * INDENT }} />
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
