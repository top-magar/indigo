import type { ReactNode } from "react"

interface StackProps {
  direction: "vertical" | "horizontal"
  gap: number
  align: "start" | "center" | "end"
  _slots?: { content?: ReactNode }
}

export function Stack({ direction = "vertical", gap = 12, align = "start", _slots }: StackProps) {
  return (
    <div style={{ display: "flex", flexDirection: direction === "vertical" ? "column" : "row", gap, alignItems: align, minHeight: 60 }}>
      {_slots?.content ?? <div className="flex items-center justify-center h-full rounded border-2 border-dashed border-gray-200 p-4 text-xs text-gray-400">+ Add content</div>}
    </div>
  )
}
