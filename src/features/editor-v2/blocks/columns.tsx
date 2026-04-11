import type { ReactNode } from "react"

interface ColumnsProps {
  columns: number
  gap: number
  /** Rendered by the canvas — slot content injected here */
  _slots?: Record<string, ReactNode>
}

export function Columns({ columns, gap, _slots }: ColumnsProps) {
  return (
    <div className="flex flex-col @sm:flex-row" style={{ gap, minHeight: 60 }}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className="min-h-[60px] flex-1">
          {_slots?.[`col_${i}`] ?? (
            <div className="flex items-center justify-center h-full rounded border-2 border-dashed border-gray-200 p-4 text-xs text-gray-400">
              Column {i + 1}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
