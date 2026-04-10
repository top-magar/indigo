"use client"

import { useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, Trash2, Copy } from "lucide-react"
import { useEditorStore } from "../store"
import { getAllBlocks, getBlock } from "../registry"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
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
    <SidebarMenuItem
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <SidebarMenuButton
        isActive={selectedId === id}
        onClick={() => selectSection(id)}
        className="cursor-pointer"
      >
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="h-4 w-4" />
        </button>
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="truncate">{type}</span>
      </SidebarMenuButton>
      <SidebarMenuAction
        showOnHover
        onClick={(e) => { e.stopPropagation(); duplicateSection(id) }}
        className="right-7"
        title="Duplicate"
      >
        <Copy className="h-3.5 w-3.5" />
      </SidebarMenuAction>
      <SidebarMenuAction
        showOnHover
        onClick={(e) => { e.stopPropagation(); removeSection(id) }}
        className="hover:text-destructive"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </SidebarMenuAction>
    </SidebarMenuItem>
  )
}

export function Sidebar() {
  const { sections, addSection, moveSection } = useEditorStore()
  const [search, setSearch] = useState("")
  const { tenantId, pageId } = useEditorV2Context()

  const filtered = search
    ? sections.filter((s) => s.type.toLowerCase().includes(search.toLowerCase()))
    : sections

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
    <div className="flex flex-col h-full">
      <Tabs defaultValue="sections" className="flex flex-col h-full gap-0">
        <div className="px-2 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="theme" className="flex-1 overflow-auto">
          <ThemePanel />
        </TabsContent>

        <TabsContent value="pages" className="flex-1 overflow-auto">
          <PagesPanel tenantId={tenantId} currentPageId={pageId} />
        </TabsContent>

        <TabsContent value="templates" className="flex-1 overflow-auto">
          <TemplatesPanel tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="sections" className="flex flex-col flex-1 min-h-0">
          <SidebarGroup className="flex-1 min-h-0 flex flex-col">
            <SidebarGroupLabel className="justify-between">
              Sections
              <SidebarMenuBadge className="static">
                {sections.length}
              </SidebarMenuBadge>
            </SidebarGroupLabel>

            <div className="px-2 pb-2">
              <SidebarInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter sections…"
              />
            </div>

            <SidebarGroupContent className="flex-1 overflow-auto">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filtered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <SidebarMenu>
                    {filtered.map((s) => (
                      <SortableItem key={s.id} id={s.id} type={s.type} />
                    ))}
                  </SidebarMenu>
                </SortableContext>
              </DndContext>
            </SidebarGroupContent>

            <div className="p-2 mt-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-1" />Add Section
                  </Button>
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
          </SidebarGroup>
        </TabsContent>
      </Tabs>
    </div>
  )
}
