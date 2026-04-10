"use client"

import { useState } from "react"
import { Eye, EyeOff, ChevronRight, Lock, Unlock, GripVertical, Copy, Trash2 } from "lucide-react"
import { useEditorStore, type Section } from "../store"
import { getBlock } from "../registry"
import { cn } from "@/shared/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

function LayerItem({ section, depth = 0, index, total }: { section: Section; depth?: number; index: number; total: number }) {
  const { selectedId, selectSection, hiddenSections, toggleSectionVisibility, duplicateSection, removeSection } = useEditorStore()
  const [open, setOpen] = useState(true)
  const block = getBlock(section.type)
  const Icon = block?.icon
  const isSelected = selectedId === section.id
  const isHidden = hiddenSections.has(section.id)
  const hasChildren = section.children && Object.values(section.children).some((s) => s.length > 0)

  return (
    <div className={cn(isHidden && "opacity-40")}>
      <div
        className={cn(
          "flex items-center gap-0.5 h-7 text-[11px] cursor-pointer group transition-colors",
          isSelected ? "bg-blue-500/15 text-blue-400" : "hover:bg-white/5"
        )}
        style={{ paddingLeft: 4 + depth * 14 }}
        onClick={() => selectSection(section.id)}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setOpen(!open) }} className="p-0.5 hover:bg-white/10 rounded">
            <ChevronRight className={cn("h-2.5 w-2.5 transition-transform text-muted-foreground", open && "rotate-90")} />
          </button>
        ) : <span className="w-3.5" />}

        {Icon && <Icon className={cn("h-3 w-3 shrink-0", isSelected ? "text-blue-400" : "text-muted-foreground")} />}
        <span className="flex-1 truncate capitalize">{section.type}</span>

        {/* Hover actions */}
        <div className="hidden group-hover:flex items-center gap-0">
          <Tooltip><TooltipTrigger asChild>
            <button onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id) }} className="p-0.5 hover:bg-white/10 rounded">
              {isHidden ? <EyeOff className="h-2.5 w-2.5 text-muted-foreground" /> : <Eye className="h-2.5 w-2.5 text-muted-foreground" />}
            </button>
          </TooltipTrigger><TooltipContent side="left" className="text-[9px]">{isHidden ? "Show" : "Hide"}</TooltipContent></Tooltip>

          <Tooltip><TooltipTrigger asChild>
            <button onClick={(e) => { e.stopPropagation(); duplicateSection(section.id) }} className="p-0.5 hover:bg-white/10 rounded">
              <Copy className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
          </TooltipTrigger><TooltipContent side="left" className="text-[9px]">Duplicate</TooltipContent></Tooltip>

          <Tooltip><TooltipTrigger asChild>
            <button onClick={(e) => { e.stopPropagation(); removeSection(section.id) }} className="p-0.5 hover:bg-white/10 rounded">
              <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
            </button>
          </TooltipTrigger><TooltipContent side="left" className="text-[9px]">Delete</TooltipContent></Tooltip>
        </div>

        {/* Index badge (visible when not hovering) */}
        <span className="group-hover:hidden text-[9px] text-muted-foreground/50 tabular-nums pr-2">{index + 1}</span>
      </div>

      {hasChildren && open && Object.entries(section.children!).map(([slot, children]) =>
        children.map((child, ci) => <LayerItem key={child.id} section={child} depth={depth + 1} index={ci} total={children.length} />)
      )}
    </div>
  )
}

export function LayersPanel() {
  const sections = useEditorStore((s) => s.sections)
  return (
    <div className="py-0.5">
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Layers</span>
        <span className="text-[9px] text-muted-foreground tabular-nums">{sections.length}</span>
      </div>
      {sections.map((s, i) => <LayerItem key={s.id} section={s} index={i} total={sections.length} />)}
      {sections.length === 0 && (
        <div className="flex flex-col items-center gap-1 py-8 text-muted-foreground">
          <Eye className="h-5 w-5 opacity-20" />
          <span className="text-[10px]">No layers</span>
        </div>
      )}
    </div>
  )
}
