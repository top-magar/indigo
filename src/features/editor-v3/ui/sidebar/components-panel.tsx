"use client"
import { useMemo, useState } from "react"
import { Square, Type, Heading1, ImageIcon, Link2, MousePointerClick, Layers, List, FileInput, TextCursorInput, Code2, BoxSelect, Rows3, Pilcrow, Play, Tag, TextIcon, CheckSquare, CircleDot, ListFilter, Minus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useStore } from "../use-store"
import { getAllMetas } from "../../registry/registry"
import { canAcceptChild } from "../../registry/content-model"
import type { ComponentType } from "react"

const COMPONENT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Box: Square, Text: Type, Heading: Heading1, Image: ImageIcon, Link: Link2,
  Button: MousePointerClick, Slot: Layers, List: List, Form: FileInput, Input: TextCursorInput, CodeBlock: Code2, Container: BoxSelect, Section: Rows3,
  Paragraph: Pilcrow, Video: Play, Label: Tag, Textarea: TextIcon,
  Checkbox: CheckSquare, Radio: CircleDot, SelectField: ListFilter, Separator: Minus,
}

export function ComponentsPanel() {
  const s = useStore()
  const [search, setSearch] = useState("")
  const selectedComponent = s.selectedInstanceId ? s.instances.get(s.selectedInstanceId)?.component : undefined

  // Find page root as fallback parent
  const pageRoot = s.currentPageId ? s.pages.get(s.currentPageId)?.rootInstanceId : undefined

  const grouped = useMemo(() => {
    const groups = new Map<string, { name: string; label: string; icon: string; disabled: boolean }[]>()
    for (const [name, meta] of getAllMetas()) {
      if (search && !meta.label.toLowerCase().includes(search.toLowerCase())) continue
      const disabled = selectedComponent ? !canAcceptChild(selectedComponent, name) : false
      const list = groups.get(meta.category) ?? []
      list.push({ name, label: meta.label, icon: meta.icon, disabled })
      groups.set(meta.category, list)
    }
    return groups
  }, [selectedComponent, search])

  const handleAdd = (component: string) => {
    const parentId = s.selectedInstanceId ?? pageRoot
    if (!parentId) return
    const parent = s.instances.get(parentId)
    if (!parent) return
    const id = s.addInstance(parentId, parent.children.length, component)
    s.select(id)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..." className="h-7 text-[11px] pl-7" />
        </div>
      </div>
      <div className="p-2 overflow-y-auto flex-1">
        {!s.selectedInstanceId && (
          <div className="text-[10px] text-muted-foreground/60 mb-2 px-1">Adding to page root</div>
        )}
        {[...grouped].map(([category, items]) => (
          <div key={category} className="mb-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 px-1 font-medium">{category}</div>
            <div className="grid grid-cols-2 gap-1">
              {items.map((item) => {
                const Icon = COMPONENT_ICONS[item.name] ?? Square
                return (
                  <button key={item.name} disabled={item.disabled} onClick={() => handleAdd(item.name)}
                    draggable={!item.disabled}
                    onDragStart={(e) => { e.dataTransfer.setData("component-name", item.name); e.dataTransfer.effectAllowed = "copy" }}
                    className="flex items-center gap-2 px-2 py-2 rounded-md text-[11px] border border-transparent hover:border-border hover:bg-accent/50 disabled:opacity-25 disabled:cursor-not-allowed text-left transition-colors">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {grouped.size === 0 && search && (
          <div className="text-[11px] text-muted-foreground text-center py-4">No components match "{search}"</div>
        )}
      </div>
    </div>
  )
}
