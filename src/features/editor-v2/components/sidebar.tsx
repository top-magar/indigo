"use client"

import { useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, Trash2, Copy, Circle, Search, ChevronDown } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ThemePanel } from "./theme-panel"
import { TemplatesPanel } from "./templates-panel"
import { PagesPanel } from "./pages-panel"
import { useEditorV2Context } from "../editor-context"
import { cn } from "@/shared/utils"

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
        isSelected ? "bg-white/10 border-l-2 border-blue-500" : "hover:bg-white/5"
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

interface SidebarProps {
  headerEnabled: boolean
  footerEnabled: boolean
  onHeaderChange: (v: boolean) => void
  onFooterChange: (v: boolean) => void
}

export function Sidebar({ headerEnabled, footerEnabled, onHeaderChange, onFooterChange }: SidebarProps) {
  const { sections, addSection, moveSection } = useEditorStore()
  const [search, setSearch] = useState("")
  const [globalOpen, setGlobalOpen] = useState(false)
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
      <div className="px-2 pt-2 shrink-0">
        <TabsList className="w-full bg-transparent border-b rounded-none p-0 h-auto">
          <TabsTrigger value="sections" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none">Sections</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none">Theme</TabsTrigger>
          <TabsTrigger value="pages" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none">Pages</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none">Templates</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="theme" className="flex-1 overflow-auto overscroll-contain m-0"><ThemePanel /></TabsContent>
      <TabsContent value="pages" className="flex-1 overflow-auto overscroll-contain m-0"><PagesPanel tenantId={tenantId} currentPageId={pageId} /></TabsContent>
      <TabsContent value="templates" className="flex-1 overflow-auto overscroll-contain m-0"><TemplatesPanel tenantId={tenantId} /></TabsContent>

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
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {filtered.map((s) => <SortableItem key={s.id} id={s.id} type={s.type} />)}
            </SortableContext>
          </DndContext>
        </div>

        {/* Global Sections — collapsible */}
        <div className="border-t shrink-0">
          <button onClick={() => setGlobalOpen(!globalOpen)} className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider hover:bg-white/5">
            Global Sections
            <ChevronDown className={cn("h-3 w-3 transition-transform", globalOpen && "rotate-180")} />
          </button>
          {globalOpen && (
            <div className="px-3 pb-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Header</Label>
                <Switch checked={headerEnabled} onCheckedChange={onHeaderChange} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Footer</Label>
                <Switch checked={footerEnabled} onCheckedChange={onFooterChange} />
              </div>
            </div>
          )}
        </div>

        <div className="p-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full h-6 text-[11px] text-muted-foreground"><Plus className="h-3 w-3 mr-1" />Add Section</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {[...grouped()].map(([cat, items]) => (
                <DropdownMenuGroup key={cat}>
                  <DropdownMenuLabel className="capitalize">{cat}</DropdownMenuLabel>
                  {items.map(([name]) => {
                    const Icon = getBlock(name)?.icon
                    return <DropdownMenuItem key={name} onClick={() => addSection(name)}>{Icon && <Icon className="h-3.5 w-3.5 mr-2" />}<span className="capitalize text-xs">{name}</span></DropdownMenuItem>
                  })}
                </DropdownMenuGroup>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TabsContent>
    </Tabs>
  )
}
