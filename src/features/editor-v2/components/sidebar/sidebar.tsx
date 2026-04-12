"use client"

import { useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical, Plus, Trash2, Copy, Circle, Search, Palette,
  FileText, Layers, LayoutDashboard, Settings, Globe,
} from "lucide-react"
import { useEditorStore } from "../../store"
import { getBlock } from "../../registry"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemePanel } from "./theme-panel"
import { TemplatesPanel } from "./templates-panel"
import { PagesPanel } from "./pages-panel"
import { LayersPanel } from "./layers-panel"
import { SeoPanel } from "./seo-panel"
import { TokensPanel } from "./tokens-panel"
import { useEditorV2Context } from "../../editor-context"
import { cn } from "@/shared/utils"
import { AddPanel } from "./add-panel"
import { useSidebarState } from "../../sidebar-state"
import { SectionLabel } from "../ui-primitives"

// ── Vertical icon strip config ──

const PRIMARY_TABS = [
  { id: "add", icon: Plus, label: "Add" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "theme", icon: Palette, label: "Theme" },
  { id: "pages", icon: FileText, label: "Pages" },
] as const

const SECONDARY_TABS = [
  { id: "settings", icon: Settings, label: "Settings" },
] as const

// ── Sortable section item ──

const CATEGORY_BORDER: Record<string, string> = {
  sections: "border-blue-500", basic: "border-gray-500",
  ecommerce: "border-green-500", layout: "border-purple-500",
}

function SortableItem({ id, type }: { id: string; type: string }) {
  const selectedId = useEditorStore(s => s.selectedId)
  const selectSection = useEditorStore(s => s.selectSection)
  const removeSection = useEditorStore(s => s.removeSection)
  const duplicateSection = useEditorStore(s => s.duplicateSection)
  const block = getBlock(type)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const Icon = block?.icon
  const isSelected = selectedId === id
  const cat = block?.category ?? "basic"
  const border = CATEGORY_BORDER[cat] ?? "border-gray-500"

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1 px-2 h-7 text-[11px] cursor-pointer group transition-colors border-l-2",
        isSelected ? `${border} bg-blue-500/15 text-blue-400` : `${border}/30 hover:bg-white/5`
      )}
      onClick={() => selectSection(id)}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-40 transition-opacity" aria-label={`Reorder ${type}`} onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-2.5 w-2.5" />
      </button>
      {Icon ? <Icon className={cn("h-3 w-3 shrink-0", isSelected ? "text-blue-400" : "text-muted-foreground")} /> : <Circle className="h-2 w-2 shrink-0 text-muted-foreground" />}
      <span className="flex-1 truncate capitalize">{type}</span>
      <div className="hidden group-hover:flex items-center gap-0">
        <Tooltip><TooltipTrigger asChild>
          <button onClick={(e) => { e.stopPropagation(); duplicateSection(id) }} className="p-0.5 hover:bg-white/10 rounded" aria-label="Duplicate">
            <Copy className="h-2.5 w-2.5 text-muted-foreground" />
          </button>
        </TooltipTrigger><TooltipContent side="right" className="text-[9px]">Duplicate</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild>
          <button onClick={(e) => { e.stopPropagation(); removeSection(id) }} className="p-0.5 hover:bg-white/10 rounded" aria-label="Delete">
            <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
          </button>
        </TooltipTrigger><TooltipContent side="right" className="text-[9px]">Delete</TooltipContent></Tooltip>
      </div>
    </div>
  )
}

// ── Settings sub-panel (Templates + Tokens + SEO) ──

function SettingsSubPanel({ tenantId }: { tenantId: string }) {
  const [sub, setSub] = useState<"templates" | "tokens" | "seo">("templates")
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-0.5 px-2 py-1.5 border-b border-border/20 shrink-0">
        {(["templates", "tokens", "seo"] as const).map((t) => (
          <button key={t} onClick={() => setSub(t)} className={cn("flex-1 h-6 text-[10px] rounded transition-colors capitalize", sub === t ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5")}>
            {t === "seo" ? "SEO" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto overscroll-contain">
        {sub === "templates" && <TemplatesPanel tenantId={tenantId} />}
        {sub === "tokens" && <TokensPanel />}
        {sub === "seo" && <SeoPanel />}
      </div>
    </div>
  )
}

// ── Main sidebar ──

export function Sidebar() {
  const moveSection = useEditorStore(s => s.moveSection)
  const sections = useEditorStore(s => s.sections)
  const sectionCount = useEditorStore(s => s.sections.length)
  const [search, setSearch] = useState("")
  const { tenantId, pageId } = useEditorV2Context()
  const { tab, setTab } = useSidebarState()

  const filtered = search ? sections.filter((s) => s.type.toLowerCase().includes(search.toLowerCase())) : sections

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.id === active.id)
    const newIdx = sections.findIndex((s) => s.id === over.id)
    moveSection(oldIdx, newIdx)
  }

  const allTabs = [...PRIMARY_TABS, ...SECONDARY_TABS]

  return (
    <div className="flex h-full">
      {/* Vertical icon strip */}
      <div className="flex flex-col items-center w-10 shrink-0 border-r border-border/20 py-2 gap-1">
        {PRIMARY_TABS.map(({ id, icon: TabIcon, label }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTab(id)}
                className={cn(
                  "h-8 w-8 flex items-center justify-center rounded-md transition-colors",
                  tab === id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                aria-label={label}
              >
                <TabIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ))}

        <div className="flex-1" />

        {SECONDARY_TABS.map(({ id, icon: TabIcon, label }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTab(id)}
                className={cn(
                  "h-8 w-8 flex items-center justify-center rounded-md transition-colors",
                  tab === id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                aria-label={label}
              >
                <TabIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Content panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {tab === "add" && <AddPanel />}
        {tab === "theme" && <div className="flex-1 overflow-auto overscroll-contain"><ThemePanel /></div>}
        {tab === "pages" && <div className="flex-1 overflow-auto overscroll-contain"><PagesPanel tenantId={tenantId} currentPageId={pageId} /></div>}
        {tab === "settings" && <SettingsSubPanel tenantId={tenantId} />}

        {tab === "layers" && (
          <div className="flex flex-col h-full">
            {/* Search + count header */}
            <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
              <SectionLabel>Layers</SectionLabel>
              <Badge variant="secondary" className="text-[8px] h-3.5 px-1 text-muted-foreground">{sectionCount}</Badge>
            </div>
            <div className="px-2 pb-1.5 shrink-0 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="h-7 text-xs pl-7" />
            </div>

            {/* Section list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-1">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LayoutDashboard className="size-10 text-muted-foreground/20 mb-2" />
                  <p className="text-[10px] text-muted-foreground/60">No sections yet</p>
                </div>
              ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={filtered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {filtered.map((s) => <SortableItem key={s.id} id={s.id} type={s.type} />)}
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Add button */}
            <div className="px-3 py-2 shrink-0">
              <button onClick={() => { setTab("add"); useSidebarState.getState().openAddPanel() }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1.5 border border-dashed rounded hover:border-foreground/20">
                <Plus className="h-3.5 w-3.5" />Add
              </button>
            </div>

            {/* Visibility toggles */}
            <div className="border-t border-border/20">
              <LayersPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
