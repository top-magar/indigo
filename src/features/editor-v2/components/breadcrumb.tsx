"use client"

import { useEditorStore } from "../store"
import { getBlock } from "../registry"

export function SelectionBreadcrumb() {
  const selectedId = useEditorStore((s) => s.selectedId)
  const sectionCount = useEditorStore((s) => s.sections.length)
  const selectSection = useEditorStore((s) => s.selectSection)
  const section = useEditorStore((s) => s.sections.find((sec) => sec.id === s.selectedId))
  const index = useEditorStore((s) => s.sections.findIndex((sec) => sec.id === s.selectedId) + 1)
  if (!selectedId || !section) return null

  const block = getBlock(section.type)
  const Icon = block?.icon

  return (
    <div className="fixed bottom-4 left-[260px] z-20 flex items-center gap-1.5 bg-gray-900/80 backdrop-blur shadow-sm rounded-full px-3 py-1 text-[10px] text-white/60">
      <button onClick={() => selectSection(null)} className="hover:text-white">Page</button>
      <span>/</span>
      <span>{index} of {sectionCount}</span>
      <span>/</span>
      <span className="flex items-center gap-1 text-white font-medium">
        {Icon && <Icon className="h-2.5 w-2.5" />}
        <span className="capitalize">{section.type}</span>
      </span>
    </div>
  )
}
