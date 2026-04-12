"use client"

import { useState, memo, useCallback, useRef, useEffect } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical, Plus, Trash2, Copy, Circle, Search, LayoutList, Palette,
  FileText, LayoutTemplate, Layers, LayoutDashboard, Globe, Eye, EyeOff,
} from "lucide-react"
import { useEditorStore } from "../../store"
import { getBlock } from "../../registry"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemePanel } from "./theme-panel"
import { TemplatesPanel } from "./templates-panel"
import { PagesPanel } from "./pages-panel"
import { SeoPanel } from "./seo-panel"
import { useEditorV2Context } from "../../editor-context"
import { cn } from "@/shared/utils"
import { AddPanel } from "./add-panel"
import { useSidebarState } from "../../sidebar-state"

const CATEGORY_BORDER: Record<string, string> = {
  sections: "border-blue-500",
  basic: "border-gray-500",
  ecommerce: "border-green-500",
  layout: "border-purple-500",
}

// Merged: Sections + Layers into one "Sections" tab (was 7 tabs, now 6)
const TAB_ITEMS = [
  { value: "add", icon: Plus, label: "Add" },
  { value: "sections", icon: Layers, label: "Sections" },
  { value: "theme", icon: Palette, label: "Theme" },
  { value: "pages", icon: FileText, label: "Pages" },
  { value: "templates", icon: LayoutTemplate, label: "Templates" },
  { value: "seo", icon: Globe, label: "SEO" },
] as const

/** camelCase → Title Case: "productGrid" → "Product Grid" */
function humanize(type: string): string {
  return type.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim()
}

function getCategoryBorder(type: string, selected: boolean): string {
  const block = getBlock(type)
  const cat = block?.category ?? "basic"
  const base = CATEGORY_BORDER[cat] ?? "border-gray-500"
  return `border-l-2 ${selected ? base : `${base}/30`}`
}

// Memoized — only re-renders when its own props change, not on every selection change
const SortableItem = memo(function SortableItem({ id, type, isSelected, isHidden }: { id: string; type: string; isSelected: boolean; isHidden: boolean }) {
  const selectSection = useEditorStore(s => s.selectSection)
  const removeSection = useEditorStore(s => s.removeSection)
  const duplicateSection = useEditorStore(s => s.duplicateSection)
  const toggleSectionVisibility = useEditorStore(s => s.toggleSectionVisibility)
  const block = getBlock(type)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const Icon = block?.icon

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1 px-2 h-7 text-[11px] cursor-pointer group transition-colors",
        getCategoryBorder(type, isSelected),
        isHidden && "opacity-40",
        isSelected ? "bg-blue-500/15 text-blue-400" : "hover:bg-white/5"
      )}
      onClick={() => selectSection(id)}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-40 transition-opacity" aria-label={`Reorder ${humanize(type)}`} aria-roledescription="sortable" onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-2.5 w-2.5" />
      </button>
      {Icon ? <Icon className={cn("h-3 w-3 shrink-0", isSelected ? "text-blue-400" : "text-muted-foreground")} /> : <Circle className="h-2 w-2 shrink-0 text-muted-foreground" />}
      <span className="flex-1 truncate">{humanize(type)}</span>
      <div className="hidden group-hover:flex items-center gap-0">
        <Tooltip><TooltipTrigger asChild>
          <button onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(id) }} className="p-0.5 hover:bg-white/10 rounded" aria-label={isHidden ? "Show section" : "Hide section"}>
            {isHidden ? <EyeOff className="h-2.5 w-2.5 text-muted-foreground" /> : <Eye className="h-2.5 w-2.5 text-muted-foreground" />}
          </button>
        </TooltipTrigger><TooltipContent side="right" className="text-[9px]">{isHidden ? "Show" : "Hide"}</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild>
          <button onClick={(e) => { e.stopPropagation(); duplicateSection(id) }} className="p-0.5 hover:bg-white/10 rounded" aria-label={`Duplicate ${humanize(type)}`}>
            <Copy className="h-2.5 w-2.5 text-muted-foreground" />
          </button>
        </TooltipTrigger><TooltipContent side="right" className="text-[9px]">Duplicate</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild>
          <button onClick={(e) => { e.stopPropagation(); removeSection(id) }} className="p-0.5 hover:bg-white/10 rounded" aria-label={`Delete ${humanize(type)}`}>
            <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
          </button>
        </TooltipTrigger><TooltipContent side="right" className="text-[9px]">Delete</TooltipContent></Tooltip>
      </div>
    </div>
  )
})

export function Sidebar() {
  const moveSection = useEditorStore(s => s.moveSection)
  const sections = useEditorStore(s => s.sections)
  const selectedId = useEditorStore(s => s.selectedId)
  const sectionCount = useEditorStore(s => s.sections.length)
  const hiddenSectionsSize = useEditorStore(s => s.hiddenSections.size)
  const hiddenRef = useRef(useEditorStore.getState().hiddenSections)
  useEffect(() => { hiddenRef.current = useEditorStore.getState().hiddenSections }, [hiddenSectionsSize])
  const [search, setSearch] = useState("")
  const { tenantId, pageId } = useEditorV2Context()
  const { tab, setTab } = useSidebarState()

  const filtered = search ? sections.filter((s) => s.type.toLowerCase().includes(search.toLowerCase())) : sections

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const secs = useEditorStore.getState().sections
    const oldIdx = secs.findIndex((s) => s.id === active.id)
    const newIdx = secs.findIndex((s) => s.id === over.id)
    moveSection(oldIdx, newIdx)
  }, [moveSection])

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
      <div className="px-2 pt-2 pb-1 shrink-0 flex justify-center">
        <TabsList className="bg-transparent p-0 h-auto gap-1">
          {TAB_ITEMS.map(({ value, icon: TabIcon, label }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value={value}
                  className="h-8 w-8 p-0 rounded data-[state=active]:bg-white/10 data-[state=active]:shadow-none"
                >
                  <TabIcon className="h-4 w-4" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </TabsList>
      </div>

      <TabsContent value="add" className="flex-1 overflow-auto overscroll-contain m-0"><AddPanel /></TabsContent>
      <TabsContent value="theme" className="flex-1 overflow-auto overscroll-contain m-0"><ThemePanel /></TabsContent>
      <TabsContent value="pages" className="flex-1 overflow-auto overscroll-contain m-0"><PagesPanel tenantId={tenantId} currentPageId={pageId} /></TabsContent>
      <TabsContent value="templates" className="flex-1 overflow-auto overscroll-contain m-0"><TemplatesPanel tenantId={tenantId} /></TabsContent>
      <TabsContent value="seo" className="flex-1 overflow-auto overscroll-contain m-0"><SeoPanel /></TabsContent>

      <TabsContent value="sections" className="flex flex-col flex-1 min-h-0 m-0">
        <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Sections</span>
          <Badge variant="secondary" className="text-[8px] h-3.5 px-1 text-muted-foreground">{sectionCount}</Badge>
        </div>
        <div className="px-2 pb-1.5 shrink-0 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sections..." className="h-7 text-xs pl-7" />
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LayoutDashboard className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-xs text-muted-foreground">No sections yet</p>
              <button onClick={() => setTab("add")} className="text-[10px] text-blue-400 hover:text-blue-300 mt-1 transition-colors">+ Add your first section</button>
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {filtered.map((s) => (
                  <SortableItem key={s.id} id={s.id} type={s.type} isSelected={selectedId === s.id} isHidden={hiddenRef.current.has(s.id)} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="px-3 py-2 shrink-0">
          <button onClick={() => useSidebarState.getState().openAddPanel()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1.5 border border-dashed rounded hover:border-foreground/20">
            <Plus className="h-3.5 w-3.5" />Add Section
          </button>
        </div>
      </TabsContent>
    </Tabs>
  )
}
