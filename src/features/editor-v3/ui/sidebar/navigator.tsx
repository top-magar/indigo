"use client"
import { useState, useCallback, useRef } from "react"
import { ChevronRight, ChevronDown, GripVertical, Square, Type, Heading1, ImageIcon, Link2, MousePointerClick, Layers, List, FileInput, TextCursorInput, Code2, Search, BoxSelect, Rows3, Navigation, Pilcrow, Play, Tag, TextIcon, CheckSquare, CircleDot, ListFilter, Minus } from "lucide-react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import type { InstanceId } from "../../types"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"
import { getMeta } from "../../registry/registry"
import { buildParentIndex } from "../../stores/indexes"
import { copyStyles, pasteStyles } from "../shell/keyboard-shortcuts"
import { generateId } from "../../id"

import type { ComponentType } from "react"

const NODE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Box: Square, Text: Type, Heading: Heading1, Image: ImageIcon, Link: Link2,
  Button: MousePointerClick, Slot: Layers, List: List, Form: FileInput, Input: TextCursorInput, CodeBlock: Code2, Container: BoxSelect, Section: Rows3,
  Navbar: Navigation,
  Paragraph: Pilcrow, Video: Play, Label: Tag, Textarea: TextIcon,
  Checkbox: CheckSquare, Radio: CircleDot, SelectField: ListFilter, Separator: Minus,
}

type DropPosition = "before" | "inside" | "after" | null

let clipboard: InstanceId | null = null

function duplicateInstance(sourceId: InstanceId): void {
  const s = useEditorV3Store.getState()
  const source = s.instances.get(sourceId)
  if (!source) return
  const parentIndex = buildParentIndex(s)
  const parentId = parentIndex.get(sourceId)
  if (!parentId) return
  const parent = s.instances.get(parentId)
  if (!parent) return
  const idx = parent.children.findIndex((c) => c.type === "id" && c.value === sourceId)

  const idMap = new Map<InstanceId, InstanceId>()
  const collect = (id: InstanceId) => {
    idMap.set(id, generateId())
    const inst = s.instances.get(id)
    if (inst) for (const c of inst.children) { if (c.type === "id") collect(c.value) }
  }
  collect(sourceId)

  useEditorV3Store.setState((draft) => {
    for (const [oldId, newId] of idMap) {
      const orig = draft.instances.get(oldId)
      if (!orig) continue
      draft.instances.set(newId, {
        id: newId, component: orig.component, tag: orig.tag,
        label: orig.label ? `${orig.label} copy` : undefined,
        children: orig.children.map((c) => c.type === "id" ? { type: "id" as const, value: idMap.get(c.value) ?? c.value } : { ...c }),
      })
    }
    const p = draft.instances.get(parentId)
    if (p) p.children.splice(idx + 1, 0, { type: "id", value: idMap.get(sourceId)! })
    for (const prop of draft.props.values()) {
      const newInstId = idMap.get(prop.instanceId)
      if (newInstId) draft.props.set(generateId(), { ...prop, id: generateId(), instanceId: newInstId } as typeof prop)
    }
    for (const [oldId, newId] of idMap) {
      const sel = draft.styleSourceSelections.get(oldId)
      if (!sel) continue
      const newSsIds: string[] = []
      for (const ssId of sel.values) {
        const newSsId = generateId()
        newSsIds.push(newSsId)
        const ss = draft.styleSources.get(ssId)
        if (ss) draft.styleSources.set(newSsId, { ...ss, id: newSsId })
        for (const decl of draft.styleDeclarations.values()) {
          if (decl.styleSourceId === ssId) {
            const key = `${newSsId}:${decl.breakpointId}:${decl.property}:${decl.state ?? ""}`
            draft.styleDeclarations.set(key, { ...decl, styleSourceId: newSsId })
          }
        }
      }
      draft.styleSourceSelections.set(newId, { instanceId: newId, values: newSsIds })
    }
    draft.selectedInstanceId = idMap.get(sourceId) ?? null
  })
}

function wrapInDiv(instanceId: InstanceId): void {
  const s = useEditorV3Store.getState()
  const parentIndex = buildParentIndex(s)
  const parentId = parentIndex.get(instanceId)
  if (!parentId) return
  const wrapperId = generateId()
  useEditorV3Store.setState((draft) => {
    const parent = draft.instances.get(parentId)
    if (!parent) return
    const idx = parent.children.findIndex((c) => c.type === "id" && c.value === instanceId)
    if (idx === -1) return
    draft.instances.set(wrapperId, { id: wrapperId, component: "Box", tag: "div", label: "Wrapper", children: [{ type: "id", value: instanceId }] })
    parent.children[idx] = { type: "id", value: wrapperId }
    draft.selectedInstanceId = wrapperId
  })
}

function unwrap(instanceId: InstanceId): void {
  const s = useEditorV3Store.getState()
  const inst = s.instances.get(instanceId)
  if (!inst) return
  const parentIndex = buildParentIndex(s)
  const parentId = parentIndex.get(instanceId)
  if (!parentId) return
  useEditorV3Store.setState((draft) => {
    const parent = draft.instances.get(parentId)
    if (!parent) return
    const idx = parent.children.findIndex((c) => c.type === "id" && c.value === instanceId)
    if (idx === -1) return
    const children = inst.children.filter((c) => c.type === "id")
    parent.children.splice(idx, 1, ...children)
    draft.instances.delete(instanceId)
    draft.selectedInstanceId = children[0]?.value ?? parentId
  })
}

function TreeNode({ instanceId, depth, filter }: { instanceId: InstanceId; depth: number; filter?: string }) {
  const s = useStore()
  const instance = s.instances.get(instanceId)
  const [expanded, setExpanded] = useState(true)
  const [dropPos, setDropPos] = useState<DropPosition>(null)
  const [renaming, setRenaming] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)

  if (!instance) return null
  const childIds = instance.children.filter((c) => c.type === "id").map((c) => c.value)
  const hasChildren = childIds.length > 0
  const isSelected = s.selectedInstanceId === instanceId
  const isHovered = s.hoveredInstanceId === instanceId
  const meta = getMeta(instance.component)
  const label = instance.label ?? meta?.label ?? instance.component
  const typeSuffix = instance.label ? instance.component : null

  // Filter: show node if it matches or any descendant matches
  const matchesSelf = !filter || label.toLowerCase().includes(filter) || instance.component.toLowerCase().includes(filter)
  const hasMatchingChild = filter ? childIds.some((id) => {
    const check = (cid: InstanceId): boolean => {
      const ci = s.instances.get(cid)
      if (!ci) return false
      const cl = ci.label ?? getMeta(ci.component)?.label ?? ci.component
      if (cl.toLowerCase().includes(filter) || ci.component.toLowerCase().includes(filter)) return true
      return ci.children.some((c) => c.type === "id" && check(c.value))
    }
    return check(id)
  }) : false
  if (filter && !matchesSelf && !hasMatchingChild) return null

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
    <ContextMenu>
      <ContextMenuTrigger asChild>
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
        {(() => { const Icon = NODE_ICONS[instance.component] ?? Square; return <Icon className="w-3 h-3 text-muted-foreground/60 shrink-0" /> })()}
        {renaming ? (
          <input autoFocus className="flex-1 px-0.5 text-[11px] bg-transparent border-b border-primary outline-none min-w-0"
            defaultValue={label}
            onBlur={(e) => { useEditorV3Store.getState().setInstanceLabel(instanceId, e.target.value); setRenaming(false) }}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setRenaming(false) }}
            onClick={(e) => e.stopPropagation()} />
        ) : (
          <span className={`truncate ${isSelected ? "font-medium" : ""}`} onDoubleClick={(e) => { e.stopPropagation(); setRenaming(true) }}>{label}</span>
        )}
        <span className={`ml-auto text-[9px] shrink-0 ${isSelected ? "text-primary/60" : "text-muted-foreground/40"}`}>{typeSuffix}</span>
      </div>
      {/* Drop indicator line — after */}
      {dropPos === "after" && (
        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary rounded-full z-10" style={{ marginLeft: depth * 12 + 4 }} />
      )}
      {expanded && hasChildren && childIds.map((id) => <TreeNode key={id} instanceId={id} depth={depth + 1} filter={filter} />)}
    </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => { clipboard = instanceId }}>
          Copy<ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { if (clipboard) duplicateInstance(clipboard) }} disabled={!clipboard}>
          Paste<ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => duplicateInstance(instanceId)}>
          Duplicate<ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => wrapInDiv(instanceId)}>
          Wrap in Div
        </ContextMenuItem>
        <ContextMenuItem onClick={() => unwrap(instanceId)} disabled={!hasChildren}>
          Unwrap children
        </ContextMenuItem>
        <ContextMenuItem onClick={() => {
          const name = prompt("Component name:")
          if (name) useEditorV3Store.getState().saveUserComponent(name, instanceId)
        }}>
          Save as Component
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => copyStyles(instanceId)}>
          Copy Styles<ContextMenuShortcut>⌥C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => pasteStyles(instanceId)}>
          Paste Styles<ContextMenuShortcut>⌥V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => {
          const st = useEditorV3Store.getState()
          const parentIndex = buildParentIndex(st)
          const parentId = parentIndex.get(instanceId)
          st.removeInstance(instanceId)
          st.select(parentId ?? null)
        }}>
          Delete<ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function Navigator() {
  const s = useStore()
  const [search, setSearch] = useState("")
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined

  if (!page) return <div className="p-4 text-xs text-muted-foreground text-center">No page selected</div>

  return (
    <div className="flex flex-col">
      <div className="px-2 pt-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/50" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter elements..." className="h-7 text-[11px] pl-7" />
        </div>
        <div className="text-[9px] text-muted-foreground/50 mt-1 px-1">{s.instances.size} elements</div>
      </div>
      <div className="py-1 px-1 overflow-y-auto">
        <TreeNode instanceId={page.rootInstanceId} depth={0} filter={search.toLowerCase()} />
      </div>
    </div>
  )
}
