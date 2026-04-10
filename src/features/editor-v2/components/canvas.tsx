"use client"

import "../blocks"
import { useEffect, useState, useCallback, useRef } from "react"
import { DndContext, DragOverlay, closestCenter, pointerWithin, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEditorStore } from "../store"
import { getBlock, getAllBlocks } from "../registry"
import { cn } from "@/shared/utils"
import { Plus, GripVertical, Copy, Trash2, ArrowUp, ArrowDown, Clipboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlotRenderer } from "./slot-renderer"
import { BlockModeProvider } from "../blocks/data-context"
import type { Section } from "../store"

const VIEWPORT_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "375px" } as const

const SHADOW_MAP: Record<string, string> = {
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px rgba(0,0,0,0.07)",
  lg: "0 10px 15px rgba(0,0,0,0.1)",
  xl: "0 20px 25px rgba(0,0,0,0.1)",
}

function getStyleProp(props: Record<string, unknown>, key: string, viewport: string): unknown {
  if (viewport !== "desktop") {
    const ov = props[`_${viewport}_${key}`]
    if (ov !== undefined && ov !== "") return ov
  }
  return props[`_${key}`]
}

function buildSectionStyle(props: Record<string, unknown>, viewport: string): React.CSSProperties {
  const g = (key: string) => getStyleProp(props, key, viewport)
  const bgImage = g("backgroundImage") as string
  const bgOverlay = (g("backgroundOverlay") as number) ?? 0
  const shadow = g("shadow") as string

  return {
    paddingTop: (g("paddingTop") as number) || undefined,
    paddingBottom: (g("paddingBottom") as number) || undefined,
    paddingLeft: (g("paddingLeft") as number) || undefined,
    paddingRight: (g("paddingRight") as number) || undefined,
    marginTop: (g("marginTop") as number) || undefined,
    marginBottom: (g("marginBottom") as number) || undefined,
    maxWidth: (g("maxWidth") as number) || undefined,
    marginInline: (g("maxWidth") as number) ? "auto" : undefined,
    backgroundColor: (g("backgroundColor") as string) || undefined,
    backgroundImage: bgImage ? `${bgOverlay ? `linear-gradient(rgba(0,0,0,${bgOverlay / 100}),rgba(0,0,0,${bgOverlay / 100})),` : ""}url(${bgImage})` : undefined,
    backgroundSize: bgImage ? ((g("backgroundSize") as string) || "cover") : undefined,
    backgroundPosition: bgImage ? "center" : undefined,
    color: (g("textColor") as string) || undefined,
    fontSize: (g("fontSize") as number) || undefined,
    textAlign: (g("textAlign") as React.CSSProperties["textAlign"]) || undefined,
    borderRadius: (g("borderRadius") as number) || undefined,
    borderWidth: (g("borderWidth") as number) || undefined,
    borderColor: (g("borderColor") as string) || undefined,
    borderStyle: (g("borderWidth") as number) ? "solid" : undefined,
    opacity: (g("opacity") as number) != null ? (g("opacity") as number) / 100 : undefined,
    boxShadow: shadow && shadow !== "none" ? SHADOW_MAP[shadow] : undefined,
    filter: (g("blur") as number) ? `blur(${g("blur")}px)` : undefined,
    overflow: "hidden",
  }
}

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
  const { duplicateSection, removeSection, moveSection, copySection } = useEditorStore()
  return (
    <div className="absolute -top-3 right-2 z-10 hidden group-hover:flex items-center gap-0.5 bg-background border rounded-md shadow-sm px-1 py-0.5">
      <button onClick={(e) => { e.stopPropagation(); moveSection(index, index - 1) }} disabled={index === 0} className="p-0.5 hover:bg-muted rounded disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); moveSection(index, index + 1) }} disabled={index === total - 1} className="p-0.5 hover:bg-muted rounded disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); copySection(sectionId) }} className="p-0.5 hover:bg-muted rounded" title="Copy (⌘C)"><Clipboard className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); duplicateSection(sectionId) }} className="p-0.5 hover:bg-muted rounded"><Copy className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); removeSection(sectionId) }} className="p-0.5 hover:bg-muted rounded text-destructive"><Trash2 className="h-3 w-3" /></button>
    </div>
  )
}

// Sortable section wrapper on canvas
function SortableSection({ id, index, total, sectionType, children }: { id: string; index: number; total: number; sectionType: string; children: React.ReactNode }) {
  const { selectedId, selectSection } = useEditorStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={cn("group relative cursor-pointer rounded transition-shadow", selectedId === id ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-200")}
      onClick={(e) => { e.stopPropagation(); selectSection(id) }}
    >
      {/* Section type pill */}
      <span className="absolute top-1 left-1 z-10 hidden group-hover:inline-block bg-black/70 text-white text-[10px] rounded capitalize px-1.5 py-0.5">{sectionType}</span>
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

/** Build React nodes for each slot of a section that has children */
function buildSlots(section: Section): Record<string, React.ReactNode> | undefined {
  if (!section.children) return undefined
  const slots: Record<string, React.ReactNode> = {}
  for (const [slotName, children] of Object.entries(section.children)) {
    slots[slotName] = <SlotRenderer parentId={section.id} slot={slotName} sections={children} />
  }
  return slots
}

export function Canvas() {
  const { sections, selectedId, selectSection, addSection, moveSection, viewport, theme, zoom } = useEditorStore()
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
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
          "--store-color-primary": primaryColor,
          "--store-font-heading": `"${headingFont}", sans-serif`,
          "--store-font-body": `"${bodyFont}", sans-serif`,
          "--store-radius": `${borderRadius}px`,
        } as React.CSSProperties}
      >
        <BlockModeProvider value={{ mode: "editor", slug: "" }}>
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
            <span className="text-5xl">🎨</span>
            <p className="text-sm">Start building your page</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addSection("hero")}>🖼 Hero</Button>
              <Button variant="outline" size="sm" onClick={() => addSection("product-grid")}>🛍 Product Grid</Button>
              <Button variant="outline" size="sm" onClick={() => setAddMenuAt(0)}>📂 Browse Templates</Button>
            </div>
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
                      <SortableSection id={s.id} index={i} total={sections.length} sectionType={s.type}>
                        <div style={buildSectionStyle(s.props, viewport)}>
                          <Component {...s.props} _sectionId={s.id} _slots={buildSlots(s)} />
                        </div>
                      </SortableSection>
                    </div>
                  )
                })}
                <DropZone onAdd={() => setAddMenuAt(sections.length)} />
                {addMenuAt === sections.length && (
                  <AddBlockMenu onSelect={(type) => { addSection(type); setAddMenuAt(null) }} onClose={() => setAddMenuAt(null)} />
                )}
                <div className="flex justify-center py-4">
                  <Button variant="outline" size="sm" onClick={() => setAddMenuAt(sections.length)} className="gap-1 text-muted-foreground">
                    <Plus className="h-3.5 w-3.5" />Add Section
                  </Button>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        )}
        </BlockModeProvider>
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
