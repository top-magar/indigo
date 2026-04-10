"use client"

import { useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, Trash2, Copy } from "lucide-react"
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

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer group", selectedId === id ? "bg-accent text-accent-foreground" : "hover:bg-muted")}
      onClick={() => selectSection(id)}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground" onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      <span className="flex-1 truncate capitalize">{type}</span>
      <button onClick={(e) => { e.stopPropagation(); duplicateSection(id) }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded" title="Duplicate">
        <Copy className="h-3 w-3 text-muted-foreground" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); removeSection(id) }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded" title="Delete">
        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  )
}

export function Sidebar() {
  const { sections, addSection, moveSection } = useEditorStore()
  const [search, setSearch] = useState("")
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
        <TabsList className="w-full">
          <TabsTrigger value="sections" className="text-xs">Sections</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs">Theme</TabsTrigger>
          <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="theme" className="flex-1 overflow-auto m-0"><ThemePanel /></TabsContent>
      <TabsContent value="pages" className="flex-1 overflow-auto m-0"><PagesPanel tenantId={tenantId} currentPageId={pageId} /></TabsContent>
      <TabsContent value="templates" className="flex-1 overflow-auto m-0"><TemplatesPanel tenantId={tenantId} /></TabsContent>

      <TabsContent value="sections" className="flex flex-col flex-1 min-h-0 m-0">
        <div className="flex items-center justify-between px-3 py-2 shrink-0">
          <span className="text-xs font-medium text-muted-foreground">Sections</span>
          <Badge variant="secondary" className="text-[10px] h-5">{sections.length}</Badge>
        </div>
        <div className="px-2 pb-2 shrink-0">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter sections…" className="h-7 text-xs" />
        </div>
        <div className="flex-1 overflow-y-auto px-1">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {filtered.map((s) => <SortableItem key={s.id} id={s.id} type={s.type} />)}
            </SortableContext>
          </DndContext>
        </div>
        <div className="p-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full"><Plus className="h-4 w-4 mr-1" />Add Section</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {[...grouped()].map(([cat, items]) => (
                <DropdownMenuGroup key={cat}>
                  <DropdownMenuLabel className="capitalize">{cat}</DropdownMenuLabel>
                  {items.map(([name]) => {
                    const Icon = getBlock(name)?.icon
                    return <DropdownMenuItem key={name} onClick={() => addSection(name)}>{Icon && <Icon className="h-4 w-4 mr-2" />}<span className="capitalize">{name}</span></DropdownMenuItem>
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
