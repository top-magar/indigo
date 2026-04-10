"use client"

import { useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical, Plus, Trash2, Copy, Circle, Search, LayoutList, Palette,
  FileText, LayoutTemplate, Layers, LayoutDashboard,
} from "lucide-react"
import { useEditorStore } from "../store"
import { getAllBlocks, getBlock } from "../registry"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemePanel } from "./theme-panel"
import { TemplatesPanel } from "./templates-panel"
import { PagesPanel } from "./pages-panel"
import { LayersPanel } from "./layers-panel"
import { useEditorV2Context } from "../editor-context"
import { cn } from "@/shared/utils"

const CATEGORY_BORDER: Record<string, string> = {
  sections: "border-blue-500",
  basic: "border-gray-500",
  ecommerce: "border-green-500",
  layout: "border-purple-500",
}

const TAB_ITEMS = [
  { value: "sections", icon: LayoutList, label: "Sections" },
  { value: "theme", icon: Palette, label: "Theme" },
  { value: "pages", icon: FileText, label: "Pages" },
  { value: "templates", icon: LayoutTemplate, label: "Templates" },
  { value: "layers", icon: Layers, label: "Layers" },
] as const

function getCategoryBorder(type: string, selected: boolean): string {
  const block = getBlock(type)
  const cat = block?.category ?? "basic"
  const base = CATEGORY_BORDER[cat] ?? "border-gray-500"
  return `border-l-2 ${selected ? base : `${base}/30`}`
}

function SortableItem({ id, type }: { id: string; type: string }) {
  const { selectedId, selectSection, removeSection, duplicateSection } = useEditorStore()
  const block = getBlock(type)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const Icon = block?.icon
  const isSelected = selectedId === id

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer group",
        getCategoryBorder(type, isSelected),
        isSelected ? "bg-white/10" : "hover:bg-white/5"
      )}
      onClick={() => selectSection(id)}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-40 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-3 w-3" />
      </button>
      {Icon ? <Icon className="h-3 w-3 shrink-0 text-muted-foreground" /> : <Circle className="h-2 w-2 shrink-0 text-muted-foreground" />}
      <span className="flex-1 truncate capitalize text-[11px]">{type}</span>
      <button onClick={(e) => { e.stopPropagation(); duplicateSection(id) }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded" title="Duplicate">
        <Copy className="h-2.5 w-2.5 text-muted-foreground" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); removeSection(id) }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded" title="Delete">
        <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  )
}

export function Sidebar() {
  const { sections, addSection, moveSection } = useEditorStore()
  const [search, setSearch] = useState("")
  const [blockSearch, setBlockSearch] = useState("")
  const { tenantId, pageId } = useEditorV2Context()

  const filtered = search ? sections.filter((s) => s.type.toLowerCase().includes(search.toLowerCase())) : sections

  const grouped = () => {
    const map = new Map<string, [string, string][]>()
    for (const [name, reg] of getAllBlocks()) {
      if (!map.has(reg.category)) map.set(reg.category, [])
      map.get(reg.category)!.push([name, name])
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
    <Tabs defaultValue="sections" className="flex flex-col h-full">
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

      <TabsContent value="theme" className="flex-1 overflow-auto overscroll-contain m-0"><ThemePanel /></TabsContent>
      <TabsContent value="pages" className="flex-1 overflow-auto overscroll-contain m-0"><PagesPanel tenantId={tenantId} currentPageId={pageId} /></TabsContent>
      <TabsContent value="templates" className="flex-1 overflow-auto overscroll-contain m-0"><TemplatesPanel tenantId={tenantId} /></TabsContent>
      <TabsContent value="layers" className="flex-1 overflow-auto overscroll-contain m-0"><LayersPanel /></TabsContent>

      <TabsContent value="sections" className="flex flex-col flex-1 min-h-0 m-0">
        <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Sections</span>
          <Badge variant="secondary" className="text-[8px] h-3.5 px-1 text-muted-foreground">{sections.length}</Badge>
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
              <p className="text-[10px] text-muted-foreground/60">Add a section to get started</p>
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {filtered.map((s) => <SortableItem key={s.id} id={s.id} type={s.type} />)}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="px-3 py-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Plus className="h-3 w-3" />Add Section
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <div className="px-2 py-1.5">
                <Input placeholder="Search blocks…" className="h-6 text-xs" onChange={(e) => setBlockSearch(e.target.value)} value={blockSearch} autoFocus />
              </div>
              {[...grouped()].map(([cat, items]) => {
                const filtered = blockSearch ? items.filter(([name]) => name.toLowerCase().includes(blockSearch.toLowerCase())) : items
                if (filtered.length === 0) return null
                return (
                  <DropdownMenuGroup key={cat}>
                    <DropdownMenuLabel className="capitalize">{cat}</DropdownMenuLabel>
                    {filtered.map(([name]) => {
                      const Icon = getBlock(name)?.icon
                      return <DropdownMenuItem key={name} onClick={() => addSection(name)} draggable onDragStart={(e) => { e.dataTransfer.setData("application/x-block-type", name); e.dataTransfer.effectAllowed = "copy" }}>{Icon && <Icon className="h-3.5 w-3.5 mr-2" />}<span className="capitalize text-xs">{name}</span></DropdownMenuItem>
                    })}
                  </DropdownMenuGroup>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TabsContent>
    </Tabs>
  )
}
