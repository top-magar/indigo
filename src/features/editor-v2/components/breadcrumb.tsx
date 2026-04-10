"use client"

import { useEditorStore } from "../store"
import { getBlock } from "../registry"

export function SelectionBreadcrumb() {
  const { selectedId, sections, selectSection } = useEditorStore()
  if (!selectedId) return null

  const section = sections.find((s) => s.id === selectedId)
  if (!section) return null

  const block = getBlock(section.type)
  const Icon = block?.icon
  const index = sections.findIndex((s) => s.id === selectedId) + 1

  return (
    <div className="fixed bottom-4 left-[260px] z-20 flex items-center gap-1.5 bg-background/90 backdrop-blur shadow-sm rounded-full px-3 py-1 text-[10px] text-muted-foreground">
      <button onClick={() => selectSection(null)} className="hover:text-foreground">Page</button>
      <span>/</span>
      <span>{index} of {sections.length}</span>
      <span>/</span>
      <span className="flex items-center gap-1 text-foreground font-medium">
        {Icon && <Icon className="h-2.5 w-2.5" />}
        <span className="capitalize">{section.type}</span>
      </span>
    </div>
  )
}
