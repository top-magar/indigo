"use client"
import { useMemo } from "react"
import { Square, Type, Heading1, ImageIcon, Link2, MousePointerClick, Layers, List, FileInput, TextCursorInput, Code2, BoxSelect, Rows3, Pilcrow, Play, Tag, TextIcon, CheckSquare, CircleDot, ListFilter, Minus } from "lucide-react"
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
  const selectedComponent = s.selectedInstanceId ? s.instances.get(s.selectedInstanceId)?.component : undefined

  const grouped = useMemo(() => {
    const groups = new Map<string, { name: string; label: string; icon: string; disabled: boolean }[]>()
    for (const [name, meta] of getAllMetas()) {
      const disabled = selectedComponent ? !canAcceptChild(selectedComponent, name) : false
      const list = groups.get(meta.category) ?? []
      list.push({ name, label: meta.label, icon: meta.icon, disabled })
      groups.set(meta.category, list)
    }
    return groups
  }, [selectedComponent])

  const handleAdd = (component: string) => {
    if (!s.selectedInstanceId) return
    const parent = s.instances.get(s.selectedInstanceId)
    if (!parent) return
    const id = s.addInstance(s.selectedInstanceId, parent.children.length, component)
    s.select(id)
  }

  if (!s.selectedInstanceId) {
    return (
      <div className="p-4 text-center">
        <div className="text-xs text-muted-foreground mb-1">Select an element first</div>
        <div className="text-[10px] text-muted-foreground/50">Then add child components here</div>
      </div>
    )
  }

  return (
    <div className="p-2 overflow-y-auto">
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
    </div>
  )
}
