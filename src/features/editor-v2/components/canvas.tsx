"use client"

import "../blocks"
import { useEditorStore } from "../store"
import { getBlock } from "../registry"
import { cn } from "@/shared/utils"

export function Canvas() {
  const { sections, selectedId, selectSection } = useEditorStore()

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {sections.map((s) => {
          const block = getBlock(s.type)
          if (!block) return null
          const Component = block.component
          return (
            <div
              key={s.id}
              className={cn("cursor-pointer rounded", selectedId === s.id && "ring-2 ring-blue-500")}
              onClick={() => selectSection(s.id)}
            >
              <Component {...s.props} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
