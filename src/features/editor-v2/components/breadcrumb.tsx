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
    <div className="flex items-center gap-1.5 border-t px-4 py-1.5 text-xs text-muted-foreground bg-background shrink-0">
      <button onClick={() => selectSection(null)} className="hover:text-foreground">Page</button>
      <span>/</span>
      <span>Section {index} of {sections.length}</span>
      <span>/</span>
      <span className="flex items-center gap-1 text-foreground font-medium">
        {Icon && <Icon className="h-3 w-3" />}
        <span className="capitalize">{section.type}</span>
      </span>
    </div>
  )
}
