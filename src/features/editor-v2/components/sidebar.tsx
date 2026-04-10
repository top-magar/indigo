"use client"

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { useEditorStore } from "../store"
import { getAllBlocks, getBlock } from "../registry"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/shared/utils"

function SortableItem({ id, type }: { id: string; type: string }) {
  const { selectedId, selectSection, removeSection } = useEditorStore()
  const block = getBlock(type)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const Icon = block?.icon
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer group", selectedId === id && "bg-accent")}
      onClick={() => selectSection(id)}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground"><GripVertical className="h-4 w-4" /></button>
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 truncate">{type}</span>
      <button onClick={(e) => { e.stopPropagation(); removeSection(id) }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function Sidebar() {
  const { sections, addSection, moveSection } = useEditorStore()

  const grouped = () => {
    const map = new Map<string, [string, string][]>()
    for (const [name, reg] of getAllBlocks()) {
      const cat = reg.category
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push([name, name])
    }
    return map
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.id === active.id)
    const newIdx = sections.findIndex((s) => s.id === over.id)
    moveSection(oldIdx, newIdx)
  }

  return (
    <div className="flex flex-col h-full p-2 gap-1">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((s) => <SortableItem key={s.id} id={s.id} type={s.type} />)}
        </SortableContext>
      </DndContext>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="mt-auto w-full"><Plus className="h-4 w-4 mr-1" />Add Section</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {[...grouped()].map(([cat, items]) => (
            <DropdownMenuGroup key={cat}>
              <DropdownMenuLabel className="capitalize">{cat}</DropdownMenuLabel>
              {items.map(([name]) => {
                const Icon = getBlock(name)?.icon
                return (
                  <DropdownMenuItem key={name} onClick={() => addSection(name)}>
                    {Icon && <Icon className="h-4 w-4 mr-2" />}{name}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
