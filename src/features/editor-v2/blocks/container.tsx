import type { ReactNode } from "react"

interface ContainerProps {
  layout: "flex-row" | "flex-col" | "grid"
  gap: number
  alignItems: "start" | "center" | "end" | "stretch"
  justifyContent: "start" | "center" | "end" | "between" | "around"
  wrap: boolean
  _slots?: { content?: ReactNode }
}

export function Container({ layout = "flex-col", gap = 16, alignItems = "stretch", justifyContent = "start", wrap = false, _slots }: ContainerProps) {
  return (
    <div style={{ display: layout.startsWith("flex") ? "flex" : "grid", flexDirection: layout === "flex-row" ? "row" : "column", gap, alignItems, justifyContent: justifyContent === "between" ? "space-between" : justifyContent === "around" ? "space-around" : justifyContent, flexWrap: wrap ? "wrap" : undefined, minHeight: 60 }}>
      {_slots?.content ?? <div className="flex items-center justify-center h-full rounded border-2 border-dashed border-gray-200 p-4 text-xs text-gray-400">+ Add content</div>}
    </div>
  )
}
