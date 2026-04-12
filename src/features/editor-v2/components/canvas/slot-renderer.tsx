"use client"

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, Trash2 } from "lucide-react"
import { useEditorStore, type Section } from "../../store"
import { getBlock, getAllBlocks } from "../../registry"
import { cn } from "@/shared/utils"
import { useState } from "react"

function SlotItem({ section, parentId, slot }: { section: Section; parentId: string; slot: string }) {
  const selectedId = useEditorStore(s => s.selectedId)
  const selectSection = useEditorStore(s => s.selectSection)
  const removeDeep = useEditorStore(s => s.removeDeep)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const block = getBlock(section.type)
  if (!block) return null
  const Component = block.component

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={cn("relative group/slot cursor-pointer rounded", selectedId === section.id ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-blue-300")}
      onClick={(e) => { e.stopPropagation(); selectSection(section.id) }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); removeDeep(section.id) }}
        className="absolute -top-1.5 -right-1.5 z-10 hidden group-hover/slot:flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white"
      >
        <Trash2 className="h-2.5 w-2.5" />
      </button>
      <Component {...section.props} />
    </div>
  )
}

interface SlotRendererProps {
  parentId: string
  slot: string
  sections: Section[]
}

export function SlotRenderer({ parentId, slot, sections }: SlotRendererProps) {
  const addChildSection = useEditorStore(s => s.addChildSection)
  const moveInSlot = useEditorStore(s => s.moveInSlot)
  const reparentSection = useEditorStore(s => s.reparentSection)
  const [showAdd, setShowAdd] = useState(false)

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.id === active.id)
    const newIdx = sections.findIndex((s) => s.id === over.id)
    if (oldIdx !== -1 && newIdx !== -1) moveInSlot(parentId, slot, oldIdx, newIdx)
  }

  return (
    <div
      className="flex flex-col gap-1 min-h-[40px]"
      onDragOver={(e) => { if (e.dataTransfer.types.includes('section-id')) { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('ring-2', 'ring-blue-400') } }}
      onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-blue-400') }}
      onDrop={(e) => {
        e.currentTarget.classList.remove('ring-2', 'ring-blue-400')
        const sectionId = e.dataTransfer.getData('section-id')
        if (sectionId) { e.preventDefault(); e.stopPropagation(); reparentSection(sectionId, parentId, slot) }
      }}
    >
      {sections.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map((s) => <SlotItem key={s.id} section={s} parentId={parentId} slot={slot} />)}
          </SortableContext>
        </DndContext>
      ) : null}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="flex items-center justify-center gap-1 py-1.5 rounded border border-dashed border-gray-300 text-xs text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        <Plus className="h-3 w-3" />Add
      </button>
      {showAdd && (
        <div className="grid grid-cols-2 gap-1 p-1 bg-background border rounded shadow-sm">
          {[...getAllBlocks()].filter(([name]) => name !== "columns").map(([name, reg]) => {
            const Icon = reg.icon
            return (
              <button key={name} onClick={() => { addChildSection(parentId, slot, name); setShowAdd(false) }} className="flex items-center gap-1 p-1 rounded hover:bg-muted text-xs">
                <Icon className="h-3 w-3" /><span className="capitalize truncate">{name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
