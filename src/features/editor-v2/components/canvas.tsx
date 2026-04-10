"use client"

import "../blocks"
import { useEffect, useState, useCallback, useRef } from "react"
import { DndContext, DragOverlay, closestCenter, pointerWithin, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEditorStore } from "../store"
import { getBlock, getAllBlocks } from "../registry"
import { cn } from "@/shared/utils"
import { Plus, GripVertical, Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const VIEWPORT_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "375px" } as const

function useGoogleFonts(fonts: string[]) {
  useEffect(() => {
    const unique = [...new Set(fonts.filter((f) => f && f !== "Inter"))]
    if (unique.length === 0) return
    const id = "editor-google-fonts"
    let link = document.getElementById(id) as HTMLLinkElement | null
    const href = `https://fonts.googleapis.com/css2?${unique.map((f) => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`
    if (link) { link.href = href } else {
      link = document.createElement("link"); link.id = id; link.rel = "stylesheet"; link.href = href; document.head.appendChild(link)
    }
  }, [fonts])
}

// Hover toolbar that appears on each section
function HoverToolbar({ sectionId, index, total }: { sectionId: string; index: number; total: number }) {
  const { duplicateSection, removeSection, moveSection } = useEditorStore()
  return (
    <div className="absolute -top-3 right-2 z-10 hidden group-hover:flex items-center gap-0.5 bg-background border rounded-md shadow-sm px-1 py-0.5">
      <button onClick={(e) => { e.stopPropagation(); moveSection(index, index - 1) }} disabled={index === 0} className="p-0.5 hover:bg-muted rounded disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); moveSection(index, index + 1) }} disabled={index === total - 1} className="p-0.5 hover:bg-muted rounded disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); duplicateSection(sectionId) }} className="p-0.5 hover:bg-muted rounded"><Copy className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); removeSection(sectionId) }} className="p-0.5 hover:bg-muted rounded text-destructive"><Trash2 className="h-3 w-3" /></button>
    </div>
  )
}

// Sortable section wrapper on canvas
function SortableSection({ id, index, total, children }: { id: string; index: number; total: number; children: React.ReactNode }) {
  const { selectedId, selectSection } = useEditorStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={cn("group relative cursor-pointer rounded transition-shadow", selectedId === id ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-200")}
      onClick={(e) => { e.stopPropagation(); selectSection(id) }}
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex cursor-grab bg-background border rounded shadow-sm p-0.5">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <HoverToolbar sectionId={id} index={index} total={total} />
      {children}
    </div>
  )
}

// Drop zone between sections for adding new blocks
function DropZone({ onAdd }: { onAdd: () => void }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative h-4 -my-1 z-5"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {visible && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="flex-1 h-px bg-blue-400" />
          <button onClick={onAdd} className="mx-2 h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
            <Plus className="h-3 w-3" />
          </button>
          <div className="flex-1 h-px bg-blue-400" />
        </div>
      )}
    </div>
  )
}

export function Canvas() {
  const { sections, selectedId, selectSection, addSection, moveSection, viewport, theme } = useEditorStore()
  const [addMenuAt, setAddMenuAt] = useState<number | null>(null)

  const primaryColor = (theme.primaryColor as string) ?? "#3b82f6"
  const headingFont = (theme.headingFont as string) ?? "Inter"
  const bodyFont = (theme.bodyFont as string) ?? "Inter"
  const borderRadius = (theme.borderRadius as number) ?? 8

  useGoogleFonts([headingFont, bodyFont])

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.id === active.id)
    const newIdx = sections.findIndex((s) => s.id === over.id)
    if (oldIdx !== -1 && newIdx !== -1) moveSection(oldIdx, newIdx)
  }

  const insertAt = useCallback((index: number, type: string) => {
    addSection(type)
    // Move the newly added section (at end) to the desired index
    const fromIdx = sections.length // will be at end after addSection
    setTimeout(() => {
      const store = useEditorStore.getState()
      const lastIdx = store.sections.length - 1
      if (lastIdx > index) store.moveSection(lastIdx, index)
    }, 0)
    setAddMenuAt(null)
  }, [sections.length, addSection])

  return (
    <div
      className="h-full overflow-y-auto p-8"
      style={{ backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      onClick={(e) => { if (e.target === e.currentTarget) { selectSection(null); setAddMenuAt(null) } }}
    >
      <div
        className={cn("mx-auto bg-white shadow-sm rounded-lg transition-all duration-200 min-h-[200px]", viewport !== "desktop" && "shadow-md")}
        style={{
          maxWidth: VIEWPORT_WIDTHS[viewport],
          "--store-color-primary": primaryColor,
          "--store-font-heading": `"${headingFont}", sans-serif`,
          "--store-font-body": `"${bodyFont}", sans-serif`,
          "--store-radius": `${borderRadius}px`,
        } as React.CSSProperties}
      >
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
            <p className="text-sm">Add your first section</p>
            <Button variant="outline" size="sm" onClick={() => addSection("hero")}>
              <Plus className="h-4 w-4 mr-1" />Add Hero Section
            </Button>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col py-2">
                {sections.map((s, i) => {
                  const block = getBlock(s.type)
                  if (!block) return null
                  const Component = block.component
                  return (
                    <div key={s.id}>
                      <DropZone onAdd={() => setAddMenuAt(i)} />
                      {addMenuAt === i && (
                        <AddBlockMenu onSelect={(type) => insertAt(i, type)} onClose={() => setAddMenuAt(null)} />
                      )}
                      <SortableSection id={s.id} index={i} total={sections.length}>
                        <div style={{
                          paddingTop: (s.props._paddingTop as number) || undefined,
                          paddingBottom: (s.props._paddingBottom as number) || undefined,
                          backgroundColor: (s.props._backgroundColor as string) || undefined,
                          maxWidth: (s.props._maxWidth as number) || undefined,
                          marginInline: (s.props._maxWidth as number) ? "auto" : undefined,
                        }}>
                          <Component {...s.props} />
                        </div>
                      </SortableSection>
                    </div>
                  )
                })}
                <DropZone onAdd={() => setAddMenuAt(sections.length)} />
                {addMenuAt === sections.length && (
                  <AddBlockMenu onSelect={(type) => { addSection(type); setAddMenuAt(null) }} onClose={() => setAddMenuAt(null)} />
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

// Inline add block menu
function AddBlockMenu({ onSelect, onClose }: { onSelect: (type: string) => void; onClose: () => void }) {
  const blocks = getAllBlocks()
  const grouped = new Map<string, [string, { icon: React.ComponentType<{ className?: string }> }][]>()
  for (const [name, reg] of blocks) {
    const cat = reg.category
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push([name, { icon: reg.icon }])
  }

  return (
    <div className="relative z-20 mx-4 my-1 p-2 bg-background border rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">Add Block</span>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {[...blocks].map(([name, reg]) => {
          const Icon = reg.icon
          return (
            <button key={name} onClick={() => onSelect(name)} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-muted text-xs">
              <Icon className="h-4 w-4" />
              <span className="truncate w-full text-center capitalize">{name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
