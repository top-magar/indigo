"use client"

import { useState } from "react"
import { Eye, EyeOff, ChevronRight } from "lucide-react"
import { useEditorStore } from "../store"
import { getBlock } from "../registry"
import { cn } from "@/shared/utils"
import type { Section } from "../store"

function LayerItem({ section, depth = 0 }: { section: Section; depth?: number }) {
  const { selectedId, selectSection, hiddenSections, toggleSectionVisibility } = useEditorStore()
  const [open, setOpen] = useState(true)
  const block = getBlock(section.type)
  const Icon = block?.icon
  const isSelected = selectedId === section.id
  const isHidden = hiddenSections.has(section.id)
  const hasChildren = section.children && Object.values(section.children).some((s) => s.length > 0)

  return (
    <div>
      <div
        className={cn("flex items-center gap-1 px-2 py-0.5 text-[11px] cursor-pointer group", isSelected ? "bg-white/10" : "hover:bg-white/5")}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => selectSection(section.id)}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setOpen(!open) }} className="p-0.5">
            <ChevronRight className={cn("h-3 w-3 transition-transform", open && "rotate-90")} />
          </button>
        ) : <span className="w-4" />}
        {Icon ? <Icon className="h-3 w-3 shrink-0 text-muted-foreground" /> : null}
        <span className="flex-1 truncate capitalize">{section.type}</span>
        <button
          onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id) }}
          className="opacity-0 group-hover:opacity-100 p-0.5"
        >
          {isHidden ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
        </button>
      </div>
      {hasChildren && open && Object.entries(section.children!).map(([slot, children]) =>
        children.map((child) => <LayerItem key={child.id} section={child} depth={depth + 1} />)
      )}
    </div>
  )
}

export function LayersPanel() {
  const sections = useEditorStore((s) => s.sections)
  return (
    <div className="py-1">
      {sections.map((s) => <LayerItem key={s.id} section={s} />)}
      {sections.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No sections</p>}
    </div>
  )
}
