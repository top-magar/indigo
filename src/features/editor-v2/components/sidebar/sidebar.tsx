"use client"

import { useState, useEffect, useCallback } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical, Plus, Trash2, Copy, Circle, Search, Palette,
  FileText, Layers, LayoutDashboard, Settings, ChevronLeft, ChevronRight,
  Eye, EyeOff,
} from "lucide-react"
import { useEditorStore } from "../../store"
import { getBlock } from "../../registry"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemePanel } from "./theme-panel"
import { TemplatesPanel } from "./templates-panel"
import { PagesPanel } from "./pages-panel"
import { SeoPanel } from "./seo-panel"
import { TokensPanel } from "./tokens-panel"
import { useEditorV2Context } from "../../editor-context"
import { cn } from "@/shared/utils"
import { AddPanel } from "./add-panel"
import { useSidebarState } from "../../sidebar-state"
import { SectionLabel } from "../ui-primitives"

// ── Tab config ──

const PRIMARY_TABS = [
  { id: "add", icon: Plus, label: "Add", shortcut: "1" },
  { id: "layers", icon: Layers, label: "Layers", shortcut: "2" },
  { id: "theme", icon: Palette, label: "Theme", shortcut: "3" },
  { id: "pages", icon: FileText, label: "Pages", shortcut: "4" },
] as const

const SECONDARY_TABS = [
  { id: "settings", icon: Settings, label: "Settings", shortcut: "5" },
] as const

const ALL_TABS = [...PRIMARY_TABS, ...SECONDARY_TABS]

// ── Category colors ──

const CAT_COLOR: Record<string, string> = {
  sections: "bg-blue-500", basic: "bg-zinc-500", ecommerce: "bg-emerald-500",
  layout: "bg-violet-500", containers: "bg-amber-500",
}

// ── Sortable section item ──

function SortableItem({ id, type }: { id: string; type: string }) {
  const selectedId = useEditorStore(s => s.selectedId)
  const selectSection = useEditorStore(s => s.selectSection)
  const removeSection = useEditorStore(s => s.removeSection)
  const duplicateSection = useEditorStore(s => s.duplicateSection)
  const hiddenSections = useEditorStore(s => s.hiddenSections)
  const toggleSectionVisibility = useEditorStore(s => s.toggleSectionVisibility)
  const block = getBlock(type)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const Icon = block?.icon
  const isSelected = selectedId === id
  const isHidden = hiddenSections.has(id)
  const cat = block?.category ?? "basic"
  const dotColor = CAT_COLOR[cat] ?? "bg-zinc-500"

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 px-2 h-8 text-[11px] cursor-pointer group transition-all rounded-md mx-1 mb-0.5",
        isDragging && "opacity-50",
        isHidden && "opacity-40",
        isSelected ? "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30" : "hover:bg-white/5"
      )}
      onClick={() => selectSection(id)}
    >
      {/* Drag handle */}
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-40 transition-opacity -ml-0.5" aria-label={`Reorder ${type}`} onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-3 w-3" />
      </button>

      {/* Category dot */}
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />

      {/* Icon + name */}
      {Icon && <Icon className={cn("h-3 w-3 shrink-0", isSelected ? "text-blue-400" : "text-muted-foreground/60")} />}
      <span className="flex-1 truncate capitalize">{type.replace(/([A-Z])/g, " $1").trim()}</span>

      {/* Actions (visible on hover) */}
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(id) }} className="p-0.5 hover:bg-white/10 rounded" aria-label={isHidden ? "Show" : "Hide"}>
          {isHidden ? <EyeOff className="h-2.5 w-2.5 text-muted-foreground" /> : <Eye className="h-2.5 w-2.5 text-muted-foreground" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); duplicateSection(id) }} className="p-0.5 hover:bg-white/10 rounded" aria-label="Duplicate">
          <Copy className="h-2.5 w-2.5 text-muted-foreground" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); removeSection(id) }} className="p-0.5 hover:bg-white/10 rounded" aria-label="Delete">
          <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-red-400" />
        </button>
      </div>
    </div>
  )
}

// ── Settings sub-panel ──

function SettingsSubPanel({ tenantId }: { tenantId: string }) {
  const [sub, setSub] = useState<"templates" | "tokens" | "seo">("templates")
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-0.5 px-2 py-1.5 border-b border-border/10 shrink-0">
        {(["templates", "tokens", "seo"] as const).map((t) => (
          <button key={t} onClick={() => setSub(t)} className={cn(
            "flex-1 h-6 text-[10px] rounded-md transition-all capitalize",
            sub === t ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:bg-white/5"
          )}>
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
  const [collapsed, setCollapsed] = useState(false)
  const { tenantId, pageId } = useEditorV2Context()
  const { tab, setTab } = useSidebarState()

  const filtered = search ? sections.filter((s) => s.type.toLowerCase().includes(search.toLowerCase())) : sections

  // Keyboard shortcuts: Alt+1-5 to switch tabs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey || e.metaKey || e.ctrlKey) return
      const match = ALL_TABS.find((t) => t.shortcut === e.key)
      if (match) { e.preventDefault(); setTab(match.id); if (collapsed) setCollapsed(false) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [setTab, collapsed])

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.id === active.id)
    const newIdx = sections.findIndex((s) => s.id === over.id)
    moveSection(oldIdx, newIdx)
  }, [sections, moveSection])

  return (
    <div className="flex h-full">
      {/* Vertical icon strip — always visible */}
      <div className="flex flex-col items-center w-10 shrink-0 border-r border-border/10 py-2 gap-0.5 bg-sidebar/50">
        {PRIMARY_TABS.map(({ id, icon: TabIcon, label, shortcut }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => { setTab(id); if (collapsed) setCollapsed(false) }}
                className={cn(
                  "relative h-8 w-8 flex items-center justify-center rounded-lg transition-all",
                  tab === id && !collapsed
                    ? "bg-white/10 text-foreground shadow-sm"
                    : "text-muted-foreground/60 hover:bg-white/5 hover:text-muted-foreground"
                )}
                aria-label={label}
              >
                <TabIcon className="h-4 w-4" />
                {/* Active indicator bar */}
                {tab === id && !collapsed && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-blue-500" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-[10px]">
              {label} <kbd className="ml-1 text-[9px] bg-white/10 px-1 rounded">Alt+{shortcut}</kbd>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="flex-1" />

        {/* Section count badge */}
        {sectionCount > 0 && (
          <span className="text-[8px] text-muted-foreground/50 tabular-nums mb-1">{sectionCount}</span>
        )}

        {SECONDARY_TABS.map(({ id, icon: TabIcon, label, shortcut }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => { setTab(id); if (collapsed) setCollapsed(false) }}
                className={cn(
                  "relative h-8 w-8 flex items-center justify-center rounded-lg transition-all",
                  tab === id && !collapsed
                    ? "bg-white/10 text-foreground shadow-sm"
                    : "text-muted-foreground/60 hover:bg-white/5 hover:text-muted-foreground"
                )}
                aria-label={label}
              >
                <TabIcon className="h-4 w-4" />
                {tab === id && !collapsed && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-blue-500" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-[10px]">
              {label} <kbd className="ml-1 text-[9px] bg-white/10 px-1 rounded">Alt+{shortcut}</kbd>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Collapse toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => setCollapsed(!collapsed)} className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/5 transition-all mt-1" aria-label={collapsed ? "Expand panel" : "Collapse panel"}>
              {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[10px]">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
        </Tooltip>
      </div>

      {/* Content panel — collapsible */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-200 overflow-hidden",
        collapsed ? "w-0 opacity-0" : "opacity-100"
      )}>
        {tab === "add" && <AddPanel />}
        {tab === "theme" && <div className="flex-1 overflow-auto overscroll-contain"><ThemePanel /></div>}
        {tab === "pages" && <div className="flex-1 overflow-auto overscroll-contain"><PagesPanel tenantId={tenantId} currentPageId={pageId} /></div>}
        {tab === "settings" && <SettingsSubPanel tenantId={tenantId} />}

        {tab === "layers" && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
              <SectionLabel>Layers</SectionLabel>
              <span className="text-[9px] text-muted-foreground/40 tabular-nums">{sectionCount}</span>
              <div className="flex-1" />
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground/40 pointer-events-none" />
                <Input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter…" className="h-6 text-[10px] pl-6 w-28 bg-transparent border-0 border-b border-border/10 rounded-none focus:border-blue-500/50 focus:ring-0 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain py-0.5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <LayoutDashboard className="size-8 text-muted-foreground/15 mb-2" />
                  <p className="text-[10px] text-muted-foreground/40">
                    {search ? "No matches" : "Empty canvas"}
                  </p>
                  {!search && (
                    <button onClick={() => setTab("add")} className="text-[10px] text-blue-400 hover:text-blue-300 mt-1 transition-colors">
                      + Add first section
                    </button>
                  )}
                </div>
              ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={filtered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {filtered.map((s) => <SortableItem key={s.id} id={s.id} type={s.type} />)}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
